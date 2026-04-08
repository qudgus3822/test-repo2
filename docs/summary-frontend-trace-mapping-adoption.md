# Frontend Summary: traceMapping 필드 도입 가이드

> 작성일: 2026-04-07  
> 대상: 프론트엔드 개발자  
> 목적: `GET /traceability` 응답에 추가된 `traceMapping` 필드를 사용하여 MR/커밋 상세 테이블을 동적으로 렌더링하는 방법 안내

---

## 1. API 응답 변경사항 (Before / After)

### 변경된 것

`TraceResult` 응답 루트에 `traceMapping` 필드 1개가 추가되었다.

```diff
 interface TraceResult {
   metricInfo: MetricInfo;
+  traceMapping: TraceMapping | null;   // NEW
   query: { ... };
   root: TraceNode | null;
   rawDailyMetric: { ... } | null;
   metadata: { ... };
 }
```

- `TraceMapping | null` -- 지표가 trace 상세를 지원하면 객체, 아니면 `null`
- 현재 11개 GitLab 기반 지표에 `traceMapping`이 존재한다
- 비-GitLab 지표(SonarQube, Jira 등)는 `null`

### 변경되지 않은 것

- API 엔드포인트 URL: `GET /traceability` (동일)
- 쿼리 파라미터: `metricName`, `periodKey`, `aggregationLevel`, `departmentCode`, `memberId`, `excludeMergeRequests` (동일)
  - **참고**: `excludeMergeRequests=true`이면 `MemberTraceNode.mergeRequests`가 `null`이 되지만, `rawDailyData[].details`는 여전히 포함된다. 즉, `traceMapping` 기반 상세 테이블 렌더링은 `excludeMergeRequests` 값과 무관하게 가능하다.
- `metricInfo`, `query`, `root`, `rawDailyMetric`, `metadata` -- 모든 기존 필드 (동일)
- `MemberTraceNode.mergeRequests: MergeRequestSummary[]` -- 기존 MR 목록 (동일)
- 인증/권한 Guard -- (동일)

---

## 2. traceMapping의 위치 (응답 트리 구조)

```
TraceResult
├── metricInfo: MetricInfo
├── traceMapping: TraceMapping | null   <-- NEW: details 해석 메타데이터
├── query: { metricName, periodKey, period, aggregationLevel }
├── root: TraceNode | null
│   └── (예: TeamTraceNode)
│       └── children: MemberTraceNode[]
│           ├── metric: MetricSnapshot
│           ├── rawDailyData: DailyUserMetric[]
│           │   ├── date: string
│           │   ├── value: number
│           │   ├── totalCount: number
│           │   ├── relatedMergeRequests: { iid, repositoryId }[]
│           │   └── details: Record<string, unknown>  <-- traceMapping이 이 필드의 해석법을 정의
│           └── mergeRequests: MergeRequestSummary[] | null
├── rawDailyMetric: { dateStart, dateEnd, documentCount, totalUsers } | null
└── metadata: { supportsMemberLevel, lowestTraceLevel, mergeRequestsIncluded, ... }
```

**핵심**: `traceMapping`은 응답 루트에 1번만 존재하고, 모든 멤버의 `rawDailyData[].details`에 동일하게 적용된다.

---

## 3. TraceMapping TypeScript 타입 정의

아래는 백엔드에서 사용하는 정확한 인터페이스이다. 프론트엔드에 동일하게 정의할 것을 권장한다.

```typescript
interface TraceMapping {
  /** trace 항목 종류 ("mergeRequest" | "commit") */
  itemType: 'mergeRequest' | 'commit';
  /** details 내 항목 배열의 위치 */
  itemsLocation: TraceMappingItemsLocation;
  /** 공통 참조 필드 (id, repositoryId 등) */
  referenceFields: TraceMappingField[];
  /** 사용자별 요약 필드 (평균값, 건수 등) */
  summaryFields: TraceMappingField[];
  /** 유효 항목의 메트릭별 컬럼 정의 */
  validItemFields: TraceMappingField[];
  /** 무효 항목의 메트릭별 컬럼 정의 */
  invalidItemFields: TraceMappingField[];
}

interface TraceMappingItemsLocation {
  /** 유효 항목 배열 경로 (예: "mergeRequests", "mergeRequests.firstTimePass") */
  validPath: string;
  /** 무효 항목 배열 경로 (예: "invalidMergeRequests", "mergeRequests.modified") */
  invalidPath: string;
  /** 유효 항목 탭 라벨 (기본: "유효") */
  validLabel?: string;
  /** 무효 항목 탭 라벨 (기본: "무효") */
  invalidLabel?: string;
}

interface TraceMappingField {
  /** details 내 필드 경로 (예: "responseTime", "stats.additions") */
  key: string;
  /** 한국어 표시명 (예: "응답시간") */
  label: string;
  /** 데이터 타입 */
  type: 'string' | 'number' | 'date' | 'boolean' | 'object' | 'array';
  /** UI 테이블에 컬럼으로 표시할지 여부 */
  display: boolean;
  /** 단위 (예: "초", "분", "라인") */
  unit?: string;
  /** 포맷된 값의 필드 키 (예: "responseTimeFormatted") */
  formattedKey?: string;
  /** 다른 컬렉션 참조 여부 */
  isReference?: boolean;
  /** 참조 대상 컬렉션명 (예: "raw_merge_requests") */
  referenceCollection?: string;
}
```

---

## 4. traceMapping을 사용하여 details를 렌더링하는 방법

### 4.1 필수 유틸리티: 중첩 경로 접근 함수

`itemsLocation.validPath`와 `validItemFields[].key`에 dot-notation 경로가 사용된다. 반드시 다음과 같은 헬퍼가 필요하다:

```typescript
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>(
    (current, key) => (current as Record<string, unknown>)?.[key],
    obj,
  );
}
```

### 4.2 Step 1: details에서 유효/무효 항목 배열 추출

```typescript
const { traceMapping } = traceResult;
if (!traceMapping) {
  // trace 상세 미지원 지표 -- 기존 방식으로 렌더링
  return;
}

// rawDailyData가 null 또는 빈 배열일 수 있음 (매칭 실패 시)
if (!memberNode.rawDailyData?.length) {
  // 원본 데이터 없음 -- 상세 패널 비활성화
  return;
}

// 일별 데이터를 순회하며 항목 추출 (DAILY: 1일, MONTHLY: ~22일)
const allValidItems: Array<{ date: string; items: unknown[] }> = [];
const allInvalidItems: Array<{ date: string; items: unknown[] }> = [];

for (const daily of memberNode.rawDailyData) {
  const details = daily.details;
  if (!details) continue;

  const validItems = (getNestedValue(details, traceMapping.itemsLocation.validPath) || []) as unknown[];
  const invalidItems = (getNestedValue(details, traceMapping.itemsLocation.invalidPath) || []) as unknown[];

  allValidItems.push({ date: daily.date, items: validItems });
  allInvalidItems.push({ date: daily.date, items: invalidItems });
}

// DAILY면 allValidItems[0]만 존재, MONTHLY면 일별로 분리됨
```

> **Tip**: DAILY 조회(rawDailyData 1건)에서는 `allValidItems[0].items`만 사용하면 된다.
> MONTHLY 조회에서는 날짜별 아코디언/탭으로 분리하거나, 전체 항목을 flat하게 합칠 수 있다.

### 4.3 Step 2: 요약 영역 렌더링 (summaryFields)

`summaryFields`는 `details` 루트 레벨의 요약 값이다 (항목 배열 안이 아님).
Step 1의 루프와 함께, 각 일별 details에서 요약을 추출한다.

```typescript
// Step 1의 루프 안에서 일별 요약 추출 (allValidItems 수집과 함께)
function extractSummary(details: Record<string, unknown> | null) {
  return traceMapping.summaryFields
    .filter(f => f.display)
    .map(f => ({
      label: f.label,
      value: details ? getNestedValue(details, f.key) : null,
      unit: f.unit ?? null,
    }));
}

// 일별 요약 데이터 (Step 1 루프에서 함께 수집)
const allSummaries = memberNode.rawDailyData.map(daily => ({
  date: daily.date,
  summary: extractSummary(daily.details),
}));

// 렌더링 예시 (DAILY: allSummaries[0], MONTHLY: 날짜별 표시):
// "평균 응답시간: 3m" | "유효 MR 수: 1개"
```

### 4.4 Step 3: 항목 테이블 컬럼 정의 (referenceFields + validItemFields)

```typescript
// 유효 항목 테이블 컬럼 = referenceFields(display:true) + validItemFields(display:true)
const validColumns = [
  ...traceMapping.referenceFields.filter(f => f.display),
  ...traceMapping.validItemFields.filter(f => f.display),
];

// 무효 항목 테이블 컬럼 = referenceFields(display:true) + invalidItemFields(display:true)
const invalidColumns = [
  ...traceMapping.referenceFields.filter(f => f.display),
  ...traceMapping.invalidItemFields.filter(f => f.display),
];
```

### 4.5 Step 4: 테이블 행 데이터 구성

```typescript
function buildRows(items: unknown[], columns: TraceMappingField[]): Record<string, unknown>[] {
  return (items as Record<string, unknown>[]).map(item => {
    const row: Record<string, unknown> = {};
    for (const col of columns) {
      if (col.formattedKey) {
        // formattedKey가 있으면 표시용으로 포맷된 값 사용
        row[col.key] = getNestedValue(item, col.formattedKey) ?? getNestedValue(item, col.key);
      } else {
        row[col.key] = getNestedValue(item, col.key);
      }
    }
    return row;
  });
}

// Step 1에서 수집한 allValidItems/allInvalidItems 사용
// DAILY: 1일치, MONTHLY: 날짜별로 행 구성
const rowsByDate = allValidItems.map(({ date, items }) => ({
  date,
  validRows: buildRows(items, validColumns),
}));
const invalidRowsByDate = allInvalidItems.map(({ date, items }) => ({
  date,
  invalidRows: buildRows(items, invalidColumns),
}));
```

### 4.6 Step 5: 탭 라벨 결정

```typescript
const validTabLabel = traceMapping.itemsLocation.validLabel ?? '유효';
const invalidTabLabel = traceMapping.itemsLocation.invalidLabel ?? '무효';
// invalidItems가 비어있으면 무효 탭 자체를 숨길 수 있다
```

### 4.7 Step 6: formattedKey 처리 (정렬 vs 표시)

`formattedKey`가 있는 컬럼은 두 가지 값을 유지해야 한다:
- **표시**: `formattedKey`의 값 (예: `"3m"`)
- **정렬/필터**: 원본 `key`의 값 (예: `171` 초)

```typescript
// 정렬 시
const sortValue = getNestedValue(item, col.key);       // 숫자 171
// 표시 시
const displayValue = getNestedValue(item, col.formattedKey); // 문자열 "3m"
```

---

## 5. 반드시 처리해야 할 엣지 케이스

### 5.1 `traceMapping: null` -- trace 미지원 지표

비-GitLab 지표(SonarQube, Jira 기반)는 `traceMapping`이 `null`이다. 이 경우 details 상세 테이블을 렌더링하지 않는다.

### 5.2 `first_time_pass_rate` -- 중첩 경로 + 커스텀 라벨

이 지표만 `details.mergeRequests`가 배열이 아닌 **객체**이다:

```json
{
  "mergeRequests": {
    "firstTimePass": [ ... ],  // validPath: "mergeRequests.firstTimePass"
    "modified": [ ... ]         // invalidPath: "mergeRequests.modified"
  }
}
```

- `validLabel: "초회 통과"`, `invalidLabel: "수정 후 통과"` -- 기본 "유효"/"무효" 대신 사용
- 반드시 dot-notation split으로 중첩 객체 탐색 필요

### 5.3 `pr_size` -- 무효 항목 없음

`invalidItemFields: []` (빈 배열) + `details.invalidMergeRequests`가 실제 데이터에 존재하지 않는다.
- `getNestedValue(details, invalidPath)`가 `undefined` 반환 -- `|| []` 폴백 필수
- 무효 탭 자체를 숨기는 것이 적절하다

### 5.4 `loc_per_commit` -- 중첩 키 (nested key)

`validItemFields`에 `stats.additions`, `stats.deletions`, `stats.total` 같은 중첩 키가 있다:

```json
{
  "id": "11ab18d6...",
  "mrId": "5",
  "repositoryId": 77132601,
  "stats": {
    "additions": 0,
    "deletions": 352,
    "total": 352
  }
}
```

항목에서 값을 꺼낼 때 `getNestedValue(item, "stats.additions")`처럼 dot-split 탐색이 필요하다.

### 5.5 `commit_frequency`, `loc_per_commit` -- `itemType: "commit"`

이 두 지표는 `itemType: "commit"`이며, 경로가 `commits` / `invalidCommits`이다.
- UI에서 "MR" 대신 "커밋"으로 표시해야 한다
- `referenceFields`에 `mrId`가 있어 커밋 -> MR 역참조 가능

### 5.6 `review_feedback_specificity` -- summaryFields만 존재

`validItemFields: []`, `invalidItemFields: []` -- 항목별 테이블이 없다.
- `summaryFields`만 7개 존재 (평균 구체성 점수, 총 리뷰 수 등)
- 항목 테이블을 렌더링하지 말고 요약만 표시

### 5.7 `null`과 빈 문자열(`""`) 처리

- `review_request_response_rate`의 `respondedAt` -- 미응답 시 `null`
- `review_completion_time`의 `approvedAt` -- 미승인 시 빈 문자열 `""`
- 둘 다 UI에서 `"-"` 또는 빈 값으로 표시

### 5.8 `display: false` 필드

`display: false` 필드는 테이블 컬럼에 표시하지 않지만 데이터에는 포함된다.
- 예: `repositoryId` (MR 상세 링크 생성 시 필요)
- 예: `responseTimeFormatted` (`formattedKey`로 참조됨)
- 예: `totalSpecificityScore` (계산 과정 투명성용, 표시 불필요)

**권장**: `display: false` 필드도 데이터로는 파싱하되, `.filter(f => f.display)` 로 컬럼 정의에서만 제외

### 5.9 `formattedKey` 패턴

현재 `review_speed`의 `responseTime` 필드에만 사용:
- `responseTime: 171` (숫자, 초) + `responseTimeFormatted: "3m"` (문자열)
- 표시: `formattedKey` 값 우선 사용
- 정렬: 원본 `key` 값 사용

### 5.10 커스텀 탭 라벨 (`validLabel` / `invalidLabel`)

`validLabel`/`invalidLabel`이 있으면 해당 값, 없으면 기본값 `"유효"` / `"무효"` 사용.
현재 커스텀 라벨은 `first_time_pass_rate`만 해당:
- `validLabel: "초회 통과"`, `invalidLabel: "수정 후 통과"`

### 5.11 MONTHLY 기간: rawDailyData 다건 처리

MONTHLY 조회 시 `rawDailyData`에 ~22개 요소가 있다 (근무일 수만큼).
각 요소마다 `details`가 있으며, 모두 동일한 `traceMapping`으로 해석한다.
- 일별로 펼쳐서 렌더링하거나, 합산 후 렌더링하는 것은 프론트엔드 UI 설계에 따른다
- 각 일별 `details`의 항목 개수가 다를 수 있다 (어떤 날은 MR 0건, 어떤 날은 3건)

---

## 6. 실제 데이터 예시

### 6.1 review_speed (MR 기반, formattedKey 패턴)

**traceMapping** (metric_definitions):
```jsonc
{
  "itemType": "mergeRequest",
  "itemsLocation": {
    "validPath": "mergeRequests",
    "invalidPath": "invalidMergeRequests"
  },

  // ── referenceFields: 항목 식별 + 원본 참조 ──
  "referenceFields": [
    { "key": "id", "label": "MR ID", "type": "string", "display": true, "isReference": true, "referenceCollection": "raw_merge_requests" },
    { "key": "repositoryId", "label": "저장소 ID", "type": "number", "display": false, "isReference": true, "referenceCollection": "raw_merge_requests" }
  ],

  // ── summaryFields: 사용자 요약 (details 루트 레벨) ──
  "summaryFields": [
    { "key": "averageFormatted", "label": "평균 응답시간", "type": "string", "display": true },
    { "key": "count", "label": "유효 MR 수", "type": "number", "display": true, "unit": "개" }
  ],

  // ── validItemFields: 유효 항목 테이블 컬럼 ──
  "validItemFields": [
    { "key": "responseTime", "label": "응답시간", "type": "number", "display": true, "unit": "초", "formattedKey": "responseTimeFormatted" },
    { "key": "responseTimeFormatted", "label": "응답시간(포맷)", "type": "string", "display": false },
    { "key": "reviewRequestTime", "label": "리뷰 요청 시각", "type": "date", "display": true },
    { "key": "firstResponseTime", "label": "첫 응답 시각", "type": "date", "display": true }
  ],

  // ── invalidItemFields: 무효 항목 테이블 컬럼 ──
  "invalidItemFields": [
    { "key": "reviewRequestTime", "label": "리뷰 요청 시각", "type": "date", "display": true },
    { "key": "reason", "label": "제외 사유", "type": "string", "display": true }
  ]
}
```

**실제 details** (raw_daily_metrics, date: 20251216):
```json
{
  "averageFormatted": "3m",
  "count": 1,
  "mergeRequests": [
    {
      "id": "5",
      "repositoryId": 77132601,
      "responseTime": 171,
      "reviewRequestTime": "2025-12-16T13:21:34Z",
      "firstResponseTime": "2025-12-16T13:24:25Z",
      "responseTimeFormatted": "3m"
    }
  ],
  "invalidMergeRequests": []
}
```

**해석 방법**:
1. `summaryFields` -> `details.averageFormatted = "3m"`, `details.count = 1`
2. `itemsLocation.validPath = "mergeRequests"` -> `details.mergeRequests` 배열 (1건)
3. 유효 테이블 컬럼: `referenceFields`의 `id`(display:true) + `validItemFields`의 `responseTime`(display:true, formattedKey로 "3m" 표시), `reviewRequestTime`(display:true), `firstResponseTime`(display:true)
4. `repositoryId`는 `display: false`이므로 컬럼에 안 보이지만 데이터로 보유

### 6.2 loc_per_commit (커밋 기반, 중첩 키)

**traceMapping** (metric_definitions):
```jsonc
{
  "itemType": "commit",
  "itemsLocation": {
    "validPath": "commits",
    "invalidPath": "invalidCommits"
  },

  // ── referenceFields: 커밋 식별 + MR 역참조 ──
  "referenceFields": [
    { "key": "id", "label": "커밋 SHA", "type": "string", "display": true },
    { "key": "mrId", "label": "MR ID", "type": "string", "display": true, "isReference": true, "referenceCollection": "raw_merge_requests" },
    { "key": "repositoryId", "label": "저장소 ID", "type": "number", "display": false, "isReference": true, "referenceCollection": "raw_merge_requests" }
  ],

  // ── summaryFields: 사용자 요약 ──
  "summaryFields": [
    { "key": "averageLocPerCommit", "label": "평균 커밋당 라인수", "type": "number", "display": true, "unit": "라인" },
    { "key": "totalLines", "label": "총 라인 수", "type": "number", "display": true, "unit": "라인" },
    { "key": "totalCommits", "label": "총 커밋 수", "type": "number", "display": true, "unit": "회" },
    { "key": "totalAdditions", "label": "총 추가 라인", "type": "number", "display": true, "unit": "라인" },
    { "key": "totalDeletions", "label": "총 삭제 라인", "type": "number", "display": true, "unit": "라인" }
  ],

  // ── validItemFields: 커밋별 테이블 컬럼 (중첩 키 주의!) ──
  "validItemFields": [
    { "key": "stats.additions", "label": "추가 라인", "type": "number", "display": true, "unit": "라인" },
    { "key": "stats.deletions", "label": "삭제 라인", "type": "number", "display": true, "unit": "라인" },
    { "key": "stats.total", "label": "총 변경 라인", "type": "number", "display": true, "unit": "라인" }
  ],

  // ── invalidItemFields: 없음 ──
  "invalidItemFields": []
}
```

**실제 details** (raw_daily_metrics, date: 20251216):
```json
{
  "averageLocPerCommit": 352,
  "totalLines": 704,
  "totalCommits": 2,
  "totalAdditions": 0,
  "totalDeletions": 704,
  "commits": [
    {
      "id": "11ab18d6d6a5c0caafedb9fa6c6566f3dc18d0af",
      "mrId": "5",
      "repositoryId": 77132601,
      "stats": {
        "additions": 0,
        "deletions": 352,
        "total": 352
      }
    },
    {
      "id": "4a454583f7233559522283f1c043708779db5171",
      "mrId": "5",
      "repositoryId": 77132601,
      "stats": {
        "additions": 0,
        "deletions": 352,
        "total": 352
      }
    }
  ],
  "invalidCommits": [],
  "totalCount": 2,
  "validityRate": 100
}
```

**해석 방법**:
1. `summaryFields` -> `details.averageLocPerCommit = 352`, `details.totalLines = 704`, ...
2. `itemsLocation.validPath = "commits"` -> `details.commits` 배열 (2건)
3. 유효 테이블 컬럼: `referenceFields`의 `id`(커밋 SHA, display:true), `mrId`(display:true) + `validItemFields`의 `stats.additions`(display:true), `stats.deletions`(display:true), `stats.total`(display:true)
4. **중첩 키 주의**: `stats.additions`는 `item.stats.additions`로 접근해야 한다
5. `invalidItemFields: []` + `invalidCommits: []` -- 무효 탭 불필요
6. `totalCount`, `validityRate` 등 traceMapping에 정의되지 않은 필드가 details에 존재할 수 있다 -- 이들은 집계 파이프라인의 ���부 필드이며 **안전하게 무시**해도 된다. traceMapping에 정의된 필드만 렌더링하면 된다

---

## 7. 11개 지표 요약 매트릭스

| 지표명 | itemType | ref* | summary | valid | invalid | 특이사항 |
|--------|----------|:---:|:-------:|:-----:|:-------:|----------|
| review_speed | mergeRequest | 2 | 2 | 4 | 2 | `formattedKey` 패턴 |
| review_request_response_rate | mergeRequest | 2 | 6 | 5 | 5 | `totalCount`/`validityRate` 포함 |
| review_feedback_specificity | mergeRequest | 2 | 7 | 0 | 0 | **요약만, 항목 테이블 없음** |
| review_request_count | mergeRequest | 2 | 0 | 0 | 0 | referenceFields만 (최소 매핑) |
| review_participation_count | mergeRequest | 2 | 0 | 1 | 1 | commentCount만 |
| first_time_pass_rate | mergeRequest | 2 | 3 | 4 | 4 | **중첩 경로 + 커스텀 라벨** |
| review_feedback_adoption_time | mergeRequest | 2 | 5 | 3 | 2 | |
| review_completion_time | mergeRequest | 2 | 4 | 3 | 3 | |
| commit_frequency | commit | 3 | 3 | 0 | 0 | 커밋 기반, 요약만 |
| pr_size | mergeRequest | 2 | 3 | 4 | 0 | **무효 항목 없음** |
| loc_per_commit | commit | 3 | 5 | 3 | 0 | 커밋 기반, **중첩 키** |

> 숫자 = `display: true/false` 무관, 해당 배열의 전체 필드 개수. `0` = 빈 배열 `[]`.
> *`ref*` = referenceFields 개수. 유효 테이블 컬럼 수 = `ref + valid`, 무효 테이블 컬럼 수 = `ref + invalid` (각각 `display:true`만 필터 후).

---

## 8. 권장 렌더링 로직 플로우

```
1. API 응답 수신
2. traceMapping이 null이면 -> 상세 패널 숨김 (기존 방식 유지)
3. traceMapping이 있으면:
   a. 컬럼 정의 (traceMapping으로부터 — 전체 rawDailyData에 대해 동일하므로 1회만 계산):
      - validColumns = referenceFields(display:true) + validItemFields(display:true)
      - invalidColumns = referenceFields(display:true) + invalidItemFields(display:true)
      - validTabLabel = validLabel ?? "유효"
      - invalidTabLabel = invalidLabel ?? "무효"
   b. rawDailyData가 null/빈 배열이면 -> "원본 데이터 없음" 표시
   c. rawDailyData를 순회 (DAILY: 1건, MONTHLY: ~22건):
      각 daily에 대해:
      - summaryFields 중 display:true만 일별 요약으로 추출
      - validItems = getNestedValue(daily.details, validPath) || []
      - invalidItems = getNestedValue(daily.details, invalidPath) || []
      - validItems가 있으면 validColumns으로 행 구성
      - invalidItems가 있고 invalidItemFields가 비어있지 않으면 invalidColumns으로 행 구성
   d. MONTHLY 렌더링 방식 선택:
      - 날짜별 아코디언/탭으로 분리 표시 (권장)
      - 또는 전체 항목을 flat하게 합쳐서 한 테이블로 표시
   e. invalidItems가 비어있거나 invalidItemFields가 빈 배열이면 -> 무효 탭 숨김
```

> **성능 팁**: 컬럼 정의(step 3a)는 `traceMapping`에서 계산되며, 모든 rawDailyData 항목에 동일하게 적용된다. `useMemo` 등으로 memoize하여 매 렌더링마다 재계산하지 않도록 한다.

---

## 9. 참고 자료

- 백엔드 인터페이스 정의: `src/modules/traceability/interfaces/traceResult.interface.ts`
- TraceMapping 스키마: `src/modules/analytics/schemas/metric-definition.schema.ts` (lines 36-88)
- 엣지 케이스 상세: `docs/handoff-trace-mapping.md` (Section 7)
- 구현 계획: `.claude/doc/plan-trace-mapping-adoption.md`
