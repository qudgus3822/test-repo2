# Plan: Frontend Adoption for Traceability API Trace Chain UX

**Date**: 2026-04-02
**Status**: PROPOSED
**Target Repo**: `barcode-plus-front` (separate from backend)
**Prerequisites**: Backend traceability API complete on `feat/traceability` branch

---

## 0. Frontend Codebase Context

### Tech Stack
- React 19 + TypeScript 5.8 + Vite
- State: Zustand (client state) + TanStack React Query v5 (server state)
- Styling: Tailwind CSS v4
- Routing: React Router v7 (flat routes in `App.tsx`)
- HTTP: Custom fetch wrapper at `src/libs/fetch/index.ts` (`apiGet`, `apiPost`, etc.)
- Icons: lucide-react
- Charts: recharts

### Existing Patterns (MUST follow)
| Layer | Pattern | Example |
|-------|---------|---------|
| Types | `src/types/{domain}.types.ts` | `metrics.types.ts` |
| API Client | `src/api/{domain}.ts` using `apiGet` | `api/metrics.ts` |
| React Query Hook | `src/api/hooks/use{Feature}.ts` | `api/hooks/useMetricsOverview.ts` |
| Page | `src/pages/{domain}/{Page}.tsx` | `pages/dashboard/Dashboard.tsx` |
| Components | `src/components/{domain}/` | `components/dashboard/MetricsRanking.tsx` |
| UI Primitives | `src/components/ui/` | `ui/Card.tsx`, `ui/LoadingSpinner.tsx` |
| Store | `src/store/use{Domain}Store.ts` | `store/useDashboardStore.ts` |
| Utils | `src/utils/{domain}.ts` | `utils/metrics.ts` |

### Key Conventions
- File/directory names: camelCase (per CLAUDE.md)
- Cookie-based auth (JWT in `accessToken` cookie, auto-handled by `apiFetch`)
- `apiGet<T>(endpoint)` returns `Promise<T>` — throws on non-ok response
- React Query hooks: `queryKey` arrays, `staleTime` typically 2min
- Modals use `useModalAnimation` hook + slide panel pattern (see `MetricsDetailModal.tsx`)

---

## 1. API Integration Layer

### 1.1. TypeScript Types

**File**: `src/types/traceability.types.ts`

Must mirror the backend interfaces exactly. All types below are derived from `/src/modules/traceability/interfaces/traceResult.interface.ts` in the backend.

```typescript
// ── Query Parameters ──

export interface TraceQuery {
  metricName: string;
  periodKey: string; // "YYYYMMDD" (DAILY) or "YYYY-MM" (MONTHLY)
  aggregationLevel: 'MEMBER' | 'TEAM' | 'DIVISION' | 'COMPANY';
  memberId?: string;
  employeeId?: string;
  departmentCode?: string;
  excludeMergeRequests?: boolean;
}

// ── Metric Metadata ──

export type TimeUnitConversion = 'seconds_to_hours' | 'minutes_to_hours' | 'none';

export interface MetricInfo {
  title: string;
  category: string;
  aggregationType: string;
  rawUnit: string;
  displayUnit: string;
  timeUnitConversion: TimeUnitConversion | string;
}

// ── Metric Snapshot ──

export interface MetricSnapshot {
  value: number;
  rawValue: number;
  score: number;
  weightedScore: number;
  count: number;
  countLabel: 'ITEMS' | 'DAYS' | 'MEMBERS';
  unit?: string;
}

// ── MR ──

export interface MergeRequestSummary {
  iid: number;
  repositoryId: number;
  repositoryName: string;
  title: string;
  author: string;
  authorEmail: string;
  reviewers: string[];
  sourceBranch: string;
  targetBranch: string;
  createdAt: string; // ISO date string (Date -> string in JSON)
  mergedAt?: string;
  projectEpicKey?: string;
  projectName?: string;
}

// ── Daily Data ──

export interface DailyUserMetric {
  date: string; // YYYYMMDD
  value: number;
  totalCount: number;
  relatedMergeRequests: Array<{ iid: number; repositoryId: number }>;
  details: Record<string, unknown> | null;
}

// ── Tree Nodes (discriminated union on level) ──

export interface MemberTraceNode {
  level: 'MEMBER';
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberEmployeeId: string;
  metric: MetricSnapshot;
  rawDailyData: DailyUserMetric[] | null;
  mergeRequests: MergeRequestSummary[] | null;
}

export interface TeamTraceNode {
  level: 'TEAM';
  departmentCode: string;
  departmentName: string;
  metric: MetricSnapshot;
  aggregationMethod: 'WEIGHTED_AVERAGE' | 'SUM';
  children: MemberTraceNode[] | null;
}

export interface DivisionTraceNode {
  level: 'DIVISION';
  departmentCode: string;
  departmentName: string;
  metric: MetricSnapshot;
  aggregationMethod: 'WEIGHTED_AVERAGE' | 'SUM';
  children: TeamTraceNode[] | null; // null in COMPANY shallow response
}

export interface CompanyTraceNode {
  level: 'COMPANY';
  metric: MetricSnapshot;
  aggregationMethod: 'WEIGHTED_AVERAGE' | 'SUM';
  children: DivisionTraceNode[];
}

export type TraceNode = CompanyTraceNode | DivisionTraceNode | TeamTraceNode | MemberTraceNode;

// ── Response ──

export interface TraceResult {
  metricInfo: MetricInfo;
  query: {
    metricName: string;
    periodKey: string;
    period: 'DAILY' | 'MONTHLY';
    aggregationLevel: 'MEMBER' | 'TEAM' | 'DIVISION' | 'COMPANY';
  };
  root: TraceNode | null;
  rawDailyMetric: {
    dateStart: string;
    dateEnd: string;
    documentCount: number;
    totalUsers: number;
  } | null;
  metadata: {
    supportsMemberLevel: boolean;
    lowestTraceLevel: string;
    mergeRequestsIncluded: boolean;
    mergeRequestsExcludedReason?: 'COMPANY_LEVEL' | 'USER_OPTED_OUT';
    isShallowResponse?: boolean;
  };
}
```

**Important notes for type consumers:**
- `createdAt` / `mergedAt` arrive as ISO strings (not `Date` objects) in JSON. Parse with `new Date()` when needed for display.
- `details` is `Record<string, unknown>` — structure varies per metric. Type-narrow at the renderer level.
- `root` can be `null` — always check before rendering.

### 1.2. API Client

**File**: `src/api/traceability.ts`

```typescript
import { apiGet } from '@/libs/fetch';
import type { TraceResult, TraceQuery } from '@/types/traceability.types';

/**
 * 역추적 데이터 조회
 */
export const fetchTraceability = async (query: TraceQuery): Promise<TraceResult> => {
  const params = new URLSearchParams();
  params.set('metricName', query.metricName);
  params.set('periodKey', query.periodKey);
  params.set('aggregationLevel', query.aggregationLevel);
  if (query.memberId) params.set('memberId', query.memberId);
  if (query.employeeId) params.set('employeeId', query.employeeId);
  if (query.departmentCode) params.set('departmentCode', query.departmentCode);
  if (query.excludeMergeRequests) params.set('excludeMergeRequests', 'true');

  return apiGet<TraceResult>(`/traceability?${params.toString()}`);
};
```

**Error handling**: `apiGet` already throws on non-ok responses with the error message from the response body. React Query will catch and expose via `error` property. No additional error handling needed in the API function.

### 1.3. React Query Hook

**File**: `src/api/hooks/useTraceability.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchTraceability } from '@/api/traceability';
import type { TraceResult, TraceQuery } from '@/types/traceability.types';

export const traceabilityKeys = {
  all: ['traceability'] as const,
  byQuery: (query: TraceQuery) => [...traceabilityKeys.all, query] as const,
};

/**
 * 역추적 데이터 조회 Hook
 * @param query - 조회 파라미터
 * @param enabled - 쿼리 활성화 여부
 */
export const useTraceability = (query: TraceQuery, enabled: boolean = true) => {
  return useQuery<TraceResult, Error>({
    queryKey: traceabilityKeys.byQuery(query),
    queryFn: () => fetchTraceability(query),
    enabled: enabled && !!query.metricName && !!query.periodKey,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * COMPANY shallow 응답에서 개별 DIVISION 상세 조회 Hook
 * Progressive loading 시 사용
 */
export const useDivisionTrace = (
  metricName: string,
  periodKey: string,
  departmentCode: string,
  enabled: boolean = false, // 사용자 클릭 시에만 활성화
) => {
  const query: TraceQuery = {
    metricName,
    periodKey,
    aggregationLevel: 'DIVISION',
    departmentCode,
  };

  return useQuery<TraceResult, Error>({
    queryKey: traceabilityKeys.byQuery(query),
    queryFn: () => fetchTraceability(query),
    enabled: enabled && !!departmentCode,
    staleTime: 5 * 60 * 1000, // 5분 (drill-down 데이터는 더 오래 캐시)
    retry: 1, // Division 상세는 무거운 쿼리이므로 기본 3회 대신 1회만 재시도
  });
};
```

**Progressive loading strategy for COMPANY**:
1. Initial `useTraceability` call returns shallow COMPANY response (`metadata.isShallowResponse: true`)
2. Each division card has an expand button that triggers `useDivisionTrace` with `enabled: true`
3. React Query caches each division independently — no re-fetch on re-expand
4. Multiple divisions can be loading simultaneously (parallel fetches)

---

## 2. Data Processing Layer

**File**: `src/utils/traceability.ts`

### 2.1. MR Enrichment — Joining Detail MRs with MR Metadata

```typescript
/**
 * details.mergeRequests[j]의 지표별 데이터와 mergeRequests[k]의 MR 메타데이터를
 * join하여 완전한 Enriched MR을 생성합니다.
 *
 * Join key: Number(detailMR.id) === mr.iid && detailMR.repositoryId === mr.repositoryId
 *
 * CRITICAL: details.mergeRequests[].id는 string, mergeRequests[].iid는 number.
 * Number() 변환이 반드시 필요합니다.
 */
export interface EnrichedMergeRequest {
  // MR metadata (from mergeRequests[])
  iid: number;
  repositoryId: number;
  repositoryName: string;
  title: string;
  author: string;
  authorEmail: string;
  reviewers: string[];
  sourceBranch: string;
  targetBranch: string;
  createdAt: string;
  mergedAt?: string;
  projectEpicKey?: string;
  projectName?: string;
  // Metric-specific data (from details.mergeRequests[])
  metricData: Record<string, unknown>;
  // Role determination
  isAuthor: boolean;
  isReviewer: boolean;
}

export function enrichMergeRequests(
  detailMRs: Array<Record<string, unknown>>,  // from rawDailyData[i].details.mergeRequests
  mrSummaries: MergeRequestSummary[],          // from memberNode.mergeRequests
  memberEmployeeId: string,                    // for role determination
): EnrichedMergeRequest[];
```

**Implementation notes:**
- Build a Map from `mrSummaries` keyed by `${iid}-${repositoryId}` for O(1) lookup
- For each `detailMR`, parse the id and **guard against NaN**:
  ```typescript
  const parsedId = Number(detailMR.id);
  if (Number.isNaN(parsedId)) continue; // 비정상 id 무시 (로그 남기기 권장)
  const key = `${parsedId}-${detailMR.repositoryId}`;
  ```
- If no match found (MR metadata missing), still include the detail with null metadata fields
- `isAuthor = memberEmployeeId === mr.author`
- `isReviewer = mr.reviewers.includes(memberEmployeeId)`

### 2.2. Time Value Formatting

```typescript
/**
 * rawValue를 사람이 읽기 쉬운 형식으로 포맷합니다.
 *
 * Examples:
 *   formatRawTime(176, 'seconds_to_hours') → "2분 56초"
 *   formatRawTime(1440, 'minutes_to_hours') → "24시간 0분"
 *   formatRawTime(3.5, 'none') → "3.5" (변환 없음)
 */
export function formatRawTime(rawValue: number, timeUnitConversion: string): string;

/**
 * NOTE: timeUnitConversion 파라미터는 `TimeUnitConversion | string` 타입입니다.
 * 백엔드가 향후 새로운 변환 타입을 추가할 수 있으므로 `| string` escape hatch가 존재합니다.
 * 구현 시 알 수 없는 값에 대한 fallback을 반드시 포함해야 합니다:
 *
 *   switch (timeUnitConversion) {
 *     case 'seconds_to_hours': ...
 *     case 'minutes_to_hours': ...
 *     case 'none': ...
 *     default:
 *       // 알 수 없는 변환 타입 → rawValue를 그대로 문자열로 반환
 *       return String(rawValue);
 *   }
 */

/**
 * 표시값과 원본값을 함께 포맷합니다.
 *
 * Examples:
 *   formatMetricValue(0.05, 176, '시간', '초', 'seconds_to_hours')
 *     → { display: "0.05시간", raw: "176초", human: "2분 56초" }
 */
export function formatMetricValue(
  value: number,
  rawValue: number,
  displayUnit: string,
  rawUnit: string,
  timeUnitConversion: string,
): { display: string; raw: string; human: string };
```

### 2.3. Count Label Display

```typescript
/**
 * countLabel을 한국어 접미사로 변환합니다.
 *
 * ITEMS → "건"
 * DAYS  → "일"
 * MEMBERS → "명"
 */
export function getCountSuffix(countLabel: 'ITEMS' | 'DAYS' | 'MEMBERS'): string;

/**
 * count + countLabel을 표시 문자열로 변환합니다.
 *
 * (2, 'ITEMS') → "2건"
 * (22, 'DAYS') → "22일"
 * (3, 'MEMBERS') → "3명"
 */
export function formatCount(count: number, countLabel: 'ITEMS' | 'DAYS' | 'MEMBERS'): string;
```

### 2.4. Aggregation Method Display

```typescript
/**
 * aggregationMethod를 한국어 표시명으로 변환합니다.
 *
 * 'WEIGHTED_AVERAGE' → "가중 평균"
 * 'SUM' → "합계"
 */
export function getAggregationMethodLabel(method: 'WEIGHTED_AVERAGE' | 'SUM'): string;
```

### 2.5. Date Formatting

```typescript
/**
 * YYYYMMDD → "YYYY-MM-DD" 또는 "YYYY년 MM월 DD일"
 */
export function formatDateKey(dateKey: string, format?: 'iso' | 'korean'): string;

/**
 * periodKey → 표시 문자열
 *
 * "20260202" → "2026-02-02 (일별)"
 * "2026-02" → "2026년 2월 (월별)"
 */
export function formatPeriodKey(periodKey: string, period: 'DAILY' | 'MONTHLY'): string;
```

---

## 3. Component Architecture

### 3.1. Component Tree

```
src/pages/traceability/
  Traceability.tsx              ← 페이지 컴포넌트 (Route에 등록)

src/components/traceability/
  index.ts                      ← barrel export
  TraceHeader.tsx               ← 지표 정보 + 쿼리 컨텍스트 + 기간
  TraceTree.tsx                 ← 트리 컨테이너 (level 기반 분기)
  MetricExplanation.tsx         ← 집계 방식 설명 (수식 시각화)
  nodes/
    CompanyNode.tsx             ← COMPANY 노드 + division 목록 (shallow)
    DivisionNode.tsx            ← DIVISION 노드 + team children
    TeamNode.tsx                ← TEAM 노드 + member children + 집계 설명
    MemberNode.tsx              ← MEMBER 리프 노드 + raw data + MR 리스트
  panels/
    RawDailyDataPanel.tsx       ← 일별 원본 데이터 분해 (MONTHLY 시 여러 행)
    MergeRequestPanel.tsx       ← Enriched MR 목록
    MergeRequestCard.tsx        ← 개별 MR 상세 카드
  renderers/
    ReviewSpeedDetail.tsx       ← review_speed 전용 (responseTime, timeline)
    ResponseRateDetail.tsx      ← review_request_response_rate 전용 (pass/fail)
    CommitFrequencyDetail.tsx   ← commit_frequency 전용 (repository breakdown)
    GenericDetail.tsx           ← 알 수 없는 지표 fallback (JSON 표시)
    detailRendererRegistry.ts   ← 지표명 → renderer 컴포넌트 매핑
```

### 3.2. Component Responsibilities

#### `Traceability.tsx` (Page)

- URL query param에서 `metricName`, `periodKey`, `aggregationLevel`, `departmentCode`, `memberId` 추출
- `useTraceability` hook으로 데이터 fetch
- Loading / Error / Empty 상태 처리
- TraceHeader + TraceTree 렌더링
- 선택된 멤버 상태 관리 (상세 패널 표시용)

```typescript
// URL: /traceability?metricName=review_speed&periodKey=20260202&aggregationLevel=TEAM&departmentCode=2100
// useSearchParams()로 파라미터 추출
```

#### `TraceHeader.tsx`

Props: `metricInfo: MetricInfo`, `query: TraceResult['query']`, `rawDailyMetric: TraceResult['rawDailyMetric']`, `metadata: TraceResult['metadata']`

표시 내용:
- 지표 한국어명 (`metricInfo.title`) + 영문 코드 (`query.metricName`)
- 카테고리 뱃지 (`metricInfo.category`)
- 집계 방식 뱃지 (`metricInfo.aggregationType`)
- 기간 표시 (`query.periodKey` + `query.period`)
- 원본 데이터 요약 (`rawDailyMetric.dateStart ~ dateEnd`, `documentCount`, `totalUsers`)
- Shallow 경고 (`metadata.isShallowResponse`)

#### `TraceTree.tsx`

Props: `root: TraceNode | null`, `metricInfo: MetricInfo`, `metadata: TraceResult['metadata']`, `query: TraceResult['query']`

역할:
- `root.level`로 분기하여 적절한 Node 컴포넌트 렌더링
- `root === null` → 빈 상태 메시지
- 중첩 구조는 각 Node가 자체 children 렌더링 담당

#### `CompanyNode.tsx`

Props: `node: CompanyTraceNode`, `metricInfo`, `query`

역할:
- 전사 집계값 표시
- Division 목록 (각 division에 "상세 보기" 버튼)
- 클릭 시 `useDivisionTrace` 활성화 → DivisionNode로 교체
- Division별 독립 로딩 상태 표시

**Progressive loading 구현**:
```typescript
// 각 division에 대해 독립적인 expand 상태 관리
const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());

// division 클릭 시 Set에 추가 → useDivisionTrace의 enabled가 true로 변경
const toggleDivision = (deptCode: string) => {
  setExpandedDivisions(prev => {
    const next = new Set(prev);
    if (next.has(deptCode)) next.delete(deptCode);
    else next.add(deptCode);
    return next;
  });
};
```

각 division card 내부에서:
```typescript
const { data, isLoading, error } = useDivisionTrace(
  query.metricName,
  query.periodKey,
  division.departmentCode,
  expandedDivisions.has(division.departmentCode), // enabled
);

// Type narrowing: TraceResult.root는 TraceNode 유니온이므로 반드시 level 체크 필요
const divisionRoot = data?.root?.level === 'DIVISION' ? data.root : null;
```

**Per-division 에러 처리 UI**: 각 division card 내부에서 에러 상태를 독립적으로 표시합니다:
```typescript
if (error) {
  return (
    <div className="ml-6 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
      <span className="font-medium">{division.departmentName}</span> 데이터를 불러오지 못했습니다.
      <button onClick={() => refetch()} className="ml-2 underline">재시도</button>
    </div>
  );
}
```
이렇게 하면 한 division의 API 실패가 다른 division에 영향을 주지 않으며, 사용자가 실패한 division만 재시도할 수 있습니다.

#### `DivisionNode.tsx`

Props: `node: DivisionTraceNode`, `metricInfo`, `query`, `fullData?: TraceResult` (progressive loading 결과)

역할:
- 실별 집계값 + aggregationMethod 표시
- `children`이 null이면 → "로딩 중" 또는 "상세 보기 클릭" 안내
- `children`이 있으면 → TeamNode 목록 렌더링

#### `TeamNode.tsx`

Props: `node: TeamTraceNode`, `metricInfo`, `query`

역할:
- 팀별 집계값 + aggregationMethod + 멤버 수 표시
- `children === null` → "이 지표는 멤버 레벨 집계를 지원하지 않습니다" 안내
- `children` 있으면 → MemberNode 목록 렌더링
- 하단에 MetricExplanation (집계 수식 시각화)

#### `MemberNode.tsx`

Props: `node: MemberTraceNode`, `metricInfo`, `query`, `onSelect: (member) => void`

역할:
- 멤버명, employeeId, 집계값 표시
- 클릭 시 상세 패널 표시 (`onSelect` 호출)
- 축약 표시: `값: 176초 (2건) | 점수: 100`
- 펼치면 RawDailyDataPanel + MergeRequestPanel

#### `RawDailyDataPanel.tsx`

Props: `rawDailyData: DailyUserMetric[] | null`, `metricInfo: MetricInfo`

역할:
- DAILY: 1개 행 표시
- MONTHLY: 날짜순 정렬 → 일별 행 표시 (date, value, totalCount, MR 수)
- 각 행 클릭 시 해당 일의 details 표시
- `rawDailyData === null` → "원본 데이터 매칭 실패" 안내

#### `MergeRequestPanel.tsx`

Props: `mergeRequests: MergeRequestSummary[] | null`, `rawDailyData: DailyUserMetric[] | null`, `memberEmployeeId: string`, `metricInfo: MetricInfo`

역할:
- `enrichMergeRequests()` 호출하여 Enriched MR 목록 생성
- 각 MR에 대해 MergeRequestCard 렌더링
- `mergeRequests === null` → "MR 정보 포함되지 않음" 안내 (사유 표시)
- `mergeRequests === []` → "연관된 MR 없음" 안내

#### `MergeRequestCard.tsx`

Props: `mr: EnrichedMergeRequest`, `metricInfo: MetricInfo`

역할:
- MR 메타데이터 표시 (title, repositoryName, author, branches)
- 역할 뱃지 (isAuthor → "작성자", isReviewer → "리뷰어")
- 지표별 상세는 `detailRendererRegistry`에서 적절한 renderer 선택
- 프로젝트/에픽 정보 (`projectEpicKey`, `projectName`)

#### `MetricExplanation.tsx`

Props: `aggregationMethod`, `parentMetric: MetricSnapshot`, `children: Array<{ metric: MetricSnapshot; label: string }>`

역할:
- WEIGHTED_AVERAGE: `(v1*c1 + v2*c2 + ...) / (c1+c2+...) = result` 수식 표시
- SUM: `v1 + v2 + ... = result` 수식 표시
- 실제 children 값으로 수식을 채워서 검증 가능하게 표시

### 3.3. Metric-Specific Renderers

**File**: `src/components/traceability/renderers/detailRendererRegistry.ts`

```typescript
import type { ComponentType } from 'react';

export interface DetailRendererProps {
  metricData: Record<string, unknown>;  // details.mergeRequests[j]의 지표별 데이터
  metricInfo: MetricInfo;
}

// 지표명 prefix → renderer 컴포넌트 매핑
const RENDERER_MAP: Record<string, ComponentType<DetailRendererProps>> = {
  'review_speed': ReviewSpeedDetail,
  'review_request_response_rate': ResponseRateDetail,
  'review_request_count': GenericDetail, // 단순 MR 목록이므로 generic으로 충분
  'commit_frequency': CommitFrequencyDetail,
  // 향후 추가: code_quality 계열, deployment 계열 등
};

export function getDetailRenderer(metricName: string): ComponentType<DetailRendererProps> {
  return RENDERER_MAP[metricName] ?? GenericDetail;
}
```

#### Renderer 상세

| Renderer | 대상 지표 | 표시 필드 | UI |
|----------|----------|----------|-----|
| `ReviewSpeedDetail` | review_speed | `responseTime`, `reviewRequestTime`, `firstResponseTime`, `responseTimeFormatted` | 타임라인 (요청 → 첫 응답, 소요시간 표시) |
| `ResponseRateDetail` | review_request_response_rate | `respondedInTime`, `responseDelayMinutes`, `responseThresholdHours` | Pass/Fail 뱃지 + 기준 시간 대비 표시 |
| `CommitFrequencyDetail` | commit_frequency | `totalCommits`, `repositories[].name`, `repositories[].commitCount` | 레포지토리별 커밋 수 바 차트 또는 목록 |
| `GenericDetail` | (fallback) | 전체 details JSON | `@uiw/react-json-view` 또는 key-value 테이블 |

---

## 4. State Management

### 4.1. 상태 분류

| 상태 | 위치 | 이유 |
|------|------|------|
| API 응답 데이터 | React Query cache | 서버 상태 — 자동 캐싱/갱신 |
| URL 파라미터 (metricName, periodKey 등) | URL query params | 북마크/공유 가능 |
| 트리 노드 펼침/접힘 | `useState` in CompanyNode/TeamNode | 페이지 로컬 UI 상태 |
| Division progressive loading | `useState<Set<string>>` in CompanyNode | 어떤 division이 펼쳐졌는지 |
| 선택된 멤버 (상세 패널) | `useState` in Traceability page | 페이지 로컬 UI 상태 |

**Zustand store 불필요**: 트레이스 뷰는 자체 완결적 페이지이며, 상태가 다른 페이지와 공유될 필요 없음. React Query + 로컬 useState로 충분.

### 4.2. Progressive Loading Flow (COMPANY)

```
1. 사용자가 COMPANY 레벨 trace view 진입
   → useTraceability({ aggregationLevel: 'COMPANY', ... })
   → 응답: { root: CompanyTraceNode, metadata: { isShallowResponse: true } }
   → root.children[]: DivisionTraceNode[] (각 division의 children은 null)

2. 사용자가 "플랫폼개발실 (2000)" 클릭
   → expandedDivisions.add('2000')
   → useDivisionTrace(metricName, periodKey, '2000', enabled: true) 활성화
   → Loading spinner 표시
   → 응답 도착 → DivisionNode에 fullData 전달 → TeamNode 렌더링

3. 사용자가 "서비스개발실 (3000)" 클릭 (동시에 가능)
   → expandedDivisions.add('3000')
   → 별도 useDivisionTrace 호출 (React Query가 병렬 처리)

4. 사용자가 "플랫폼개발실" 다시 클릭 (접기)
   → expandedDivisions.delete('2000')
   → 하위 내용 숨김 (데이터는 React Query 캐시에 유지)
   → 다시 펼치면 캐시에서 즉시 표시 (staleTime 이내)
```

---

## 5. Visual Design Specifications

### 5.1. Layout

```
┌─────────────────────────────────────────────────────┐
│  TraceHeader                                         │
│  ┌─────────────────────────────────────────────────┐│
│  │ 리뷰 속도 (review_speed)   [리뷰] [평균 지표]    ││
│  │ A플랫폼개발팀 (2100) | 2026-02-02 (일별)        ││
│  └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│  TraceTree                                           │
│  ┌─────────────────────────────────────────────────┐│
│  │ ▼ A플랫폼개발팀  값: 176초  점수: 100  {formatCount(3, 'MEMBERS')} ││
│  │   ┌─────────────────────────────────────────────┐│
│  │   │ 이승우 (moco.seungwoo) 176초 {formatCount(2, countLabel)} 100점 ││
│  │   │   ▼ 일별 데이터                              ││
│  │   │   ▼ MR 상세 ({formatCount(2, countLabel)})   ││
│  │   │     ┌ MR #22 (moco_api) ...                 ││
│  │   │     └ MR #30 (moco_next) ...                ││
│  │   └─────────────────────────────────────────────┘│
│  │   ┌─────────────────────────────────────────────┐│
│  │   │ 김도현 (moco.dohyun) 180초 {formatCount(1, countLabel)} 95점 ││
│  │   └─────────────────────────────────────────────┘│
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │ MetricExplanation                                ││
│  │ 가중 평균: (176*2 + 180*1) / (2+1) = 177.3      ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

**Visual mockup 주의**: 위 목업에서 `{formatCount(N, countLabel)}` 표기는 실제 구현 시 `formatCount()` 유틸 함수를 사용해야 함을 나타냅니다. DAILY이면 멤버 레벨에서 "2건", 팀 레벨에서 "3명"이 되고, MONTHLY이면 "22일"이 됩니다. "건"을 하드코딩하지 마세요.

### 5.2. 색상 코딩

| 요소 | 색상 규칙 |
|------|----------|
| 점수 100 | `text-green-600 bg-green-50` |
| 점수 70-99 | `text-yellow-600 bg-yellow-50` |
| 점수 < 70 | `text-red-600 bg-red-50` |
| 응답 Pass (respondedInTime: true) | `text-green-600` + 체크 아이콘 |
| 응답 Fail (respondedInTime: false) | `text-red-600` + X 아이콘 |
| Author 뱃지 | `bg-blue-100 text-blue-700` |
| Reviewer 뱃지 | `bg-purple-100 text-purple-700` |
| Shallow 경고 | `bg-amber-50 text-amber-700 border-amber-200` |
| 카테고리 뱃지 (review) | `bg-indigo-100 text-indigo-700` |
| 카테고리 뱃지 (quality) | `bg-emerald-100 text-emerald-700` |
| 카테고리 뱃지 (efficiency) | `bg-orange-100 text-orange-700` |

### 5.3. 반응형

- 최소 너비: 1024px (데스크톱 전용 — 기존 앱 패턴과 동일)
- 트리 노드 들여쓰기: `ml-6` per level
- MR 카드: 전체 너비, 세로 스택

### 5.4. 트리 노드 펼침/접힘

- 기본: TEAM 이하 노드는 접힌 상태
- 클릭 또는 chevron 아이콘으로 토글
- lucide-react의 `ChevronRight` (접힘) / `ChevronDown` (펼침) 사용
- 트랜지션: Tailwind `transition-all duration-200`

---

## 6. Routing & Integration Points

### 6.1. 라우트 등록

**File**: `src/App.tsx`

```diff
+ import TraceabilityPage from "@/pages/traceability/Traceability";

  <Route element={<Layout />}>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/projects" element={<ProjectsPage />} />
    <Route path="/organization" element={<OrganizationPage />} />
    <Route path="/metrics" element={<MetricsPage />} />
    <Route path="/settings" element={<SettingsPage />} />
+   <Route path="/traceability" element={<TraceabilityPage />} />
  </Route>
```

### 6.2. 네비게이션 함수

**File**: `src/utils/traceability.ts` (추가)

```typescript
/**
 * 역추적 페이지로 이동하는 URL을 생성합니다.
 *
 * @example
 * buildTraceUrl({ metricName: 'review_speed', periodKey: '2026-02', aggregationLevel: 'COMPANY' })
 * → "/traceability?metricName=review_speed&periodKey=2026-02&aggregationLevel=COMPANY"
 */
export function buildTraceUrl(params: {
  metricName: string;
  periodKey: string;
  aggregationLevel: string;
  departmentCode?: string;
  memberId?: string;
}): string;
```

### 6.3. Entry Points (진입점)

#### A. 대시보드 → 지표 순위 클릭

**File**: `src/components/dashboard/MetricsRanking.tsx`

변경 내용:
- 각 지표 순위 행에 클릭 핸들러 추가
- `useNavigate()`로 `/traceability?metricName=X&periodKey=YYYY-MM&aggregationLevel=COMPANY` 이동
- `periodKey`는 `useDashboardStore`의 `currentDate`에서 추출

#### B. 지표 관리 → 지표 테이블 행 클릭

**File**: `src/components/metrics/MetricsTable.tsx`

변경 내용:
- 각 지표 행에 "역추적" 버튼 또는 아이콘 추가 (lucide-react `Search` 또는 `GitBranch` 아이콘)
- 클릭 시 `/traceability?metricName=X&periodKey=YYYY-MM&aggregationLevel=COMPANY` 이동
- `metricCode` → `metricName` 매핑 필요 (현재 MetricItem에 `metricCode`가 있으나 이는 대문자 코드, 실제 API는 snake_case `metricName` 사용)

**NOTE**: `MetricItem.metricCode` (예: "TECH_DEBT")와 traceability API의 `metricName` (예: "technical_debt") 간 매핑이 필요합니다. 매핑 테이블을 `src/utils/traceability.ts`에 추가하거나, 백엔드 MetricsListData 응답에 `metricName` 필드를 추가해야 합니다.

#### C. 조직 비교 페이지 → 부서별 지표 클릭

**File**: `src/pages/organization/Organization.tsx` (또는 관련 컴포넌트)

변경 내용:
- 부서별 지표 값 클릭 시 `/traceability?metricName=X&periodKey=Y&aggregationLevel=DIVISION&departmentCode=Z` 이동

#### D. Sidebar 메뉴 (Optional)

**File**: `src/components/layout/Sidebar.tsx`

역추적은 독립 페이지이지만 항상 다른 뷰에서 진입하므로, Sidebar 메뉴에 추가하지 않아도 됩니다. 직접 URL 접근은 가능하되 메뉴에는 노출하지 않는 것을 권장합니다.

---

## 7. Edge Cases

### 7.1. Empty Result

```typescript
// root === null
if (!data.root) {
  return <EmptyState message="해당 기간에 데이터가 없습니다." />;
}
```

### 7.2. Metric Without Member Support

```typescript
// TeamNode에서 children === null + metadata.supportsMemberLevel === false
if (node.children === null && !metadata.supportsMemberLevel) {
  return <InfoBox>이 지표는 멤버 레벨 집계를 지원하지 않습니다.</InfoBox>;
}
```

### 7.3. COMPANY Shallow Response

- `metadata.isShallowResponse === true` → 각 division의 children이 null
- CompanyNode에서 division별 "상세 보기" 버튼 표시
- 상단에 안내: "상세 데이터는 각 실을 클릭하여 조회하세요"

### 7.4. MR Not Found in raw_merge_requests

```typescript
// mergeRequests === null → MR 정보 미포함 (COMPANY shallow 또는 excludeMergeRequests)
// mergeRequests === [] → MR 조회 완료, 해당 MR 없음
if (node.mergeRequests === null) {
  // metadata.mergeRequestsExcludedReason에 따라 사유 표시
  const reason = metadata.mergeRequestsExcludedReason;
  if (reason === 'COMPANY_LEVEL') return <InfoBox>전사 레벨에서는 MR 상세가 포함되지 않습니다.</InfoBox>;
  if (reason === 'USER_OPTED_OUT') return <InfoBox>MR 상세가 제외되었습니다.</InfoBox>;
  return <InfoBox>MR 정보를 확인할 수 없습니다.</InfoBox>;
}
if (node.mergeRequests.length === 0) {
  return <InfoBox>연관된 MR이 없습니다.</InfoBox>;
}
```

### 7.5. Large Monthly Data — Virtualization

MONTHLY 데이터 규모 예상: ~22일 x 10멤버 x 5MR = ~1,100 MR 카드 (최악 케이스).

**권장 접근**:
- 1차: 가상화 없이 구현 (트리 노드가 기본 접힌 상태이므로 동시 렌더링 수가 적음)
- 문제 발생 시: `react-virtuoso` 또는 수동 페이지네이션 적용
- MemberNode는 기본 접힌 상태 → 펼칠 때만 MR 카드 렌더링

### 7.6. rawDailyData === null (매칭 실패)

```typescript
if (node.rawDailyData === null) {
  return <WarningBox>원본 일별 데이터를 매칭할 수 없습니다.</WarningBox>;
}
```

### 7.7. 네트워크 에러 / 400 Validation Error

React Query의 `error` 상태 활용:
```typescript
const { data, isLoading, error } = useTraceability(query);

if (error) {
  return <ErrorBox message={error.message} />;
  // "지표명 'invalid_metric'을(를) 찾을 수 없습니다."
  // "aggregationLevel이 TEAM/DIVISION일 때 departmentCode는 필수입니다."
}
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Types + API)
**Estimated files: 3**

| File | Action | Description |
|------|--------|-------------|
| `src/types/traceability.types.ts` | CREATE | 모든 TypeScript 타입 정의 |
| `src/api/traceability.ts` | CREATE | `fetchTraceability()` API 함수 |
| `src/api/hooks/useTraceability.ts` | CREATE | `useTraceability`, `useDivisionTrace` hooks |

### Phase 2: Data Processing Utils
**Estimated files: 1**

| File | Action | Description |
|------|--------|-------------|
| `src/utils/traceability.ts` | CREATE | `enrichMergeRequests`, `formatRawTime`, `formatCount`, `buildTraceUrl` 등 |

### Phase 3: Page + Core Components
**Estimated files: 7**

| File | Action | Description |
|------|--------|-------------|
| `src/pages/traceability/Traceability.tsx` | CREATE | 페이지 컴포넌트 |
| `src/components/traceability/TraceHeader.tsx` | CREATE | 헤더 영역 |
| `src/components/traceability/TraceTree.tsx` | CREATE | 트리 컨테이너 |
| `src/components/traceability/nodes/CompanyNode.tsx` | CREATE | COMPANY 노드 |
| `src/components/traceability/nodes/DivisionNode.tsx` | CREATE | DIVISION 노드 |
| `src/components/traceability/nodes/TeamNode.tsx` | CREATE | TEAM 노드 |
| `src/components/traceability/nodes/MemberNode.tsx` | CREATE | MEMBER 노드 |

### Phase 4: Detail Panels
**Estimated files: 3**

| File | Action | Description |
|------|--------|-------------|
| `src/components/traceability/panels/RawDailyDataPanel.tsx` | CREATE | 일별 원본 데이터 |
| `src/components/traceability/panels/MergeRequestPanel.tsx` | CREATE | MR 목록 |
| `src/components/traceability/panels/MergeRequestCard.tsx` | CREATE | 개별 MR 카드 |

### Phase 5: Metric-Specific Renderers
**Estimated files: 5**

| File | Action | Description |
|------|--------|-------------|
| `src/components/traceability/renderers/detailRendererRegistry.ts` | CREATE | 레지스트리 |
| `src/components/traceability/renderers/ReviewSpeedDetail.tsx` | CREATE | 리뷰 속도 |
| `src/components/traceability/renderers/ResponseRateDetail.tsx` | CREATE | 응답률 |
| `src/components/traceability/renderers/CommitFrequencyDetail.tsx` | CREATE | 커밋 빈도 |
| `src/components/traceability/renderers/GenericDetail.tsx` | CREATE | 범용 fallback |

### Phase 6: Integration + MetricExplanation
**Estimated files: 5**

| File | Action | Description |
|------|--------|-------------|
| `src/components/traceability/MetricExplanation.tsx` | CREATE | 집계 수식 시각화 |
| `src/components/traceability/index.ts` | CREATE | barrel export |
| `src/App.tsx` | MODIFY | `/traceability` 라우트 추가 |
| `src/components/dashboard/MetricsRanking.tsx` | MODIFY | 지표 클릭 → 역추적 네비게이션 |
| `src/components/metrics/MetricsTable.tsx` | MODIFY | 역추적 버튼 추가 |

### Total: 24 files (20 CREATE + 4 MODIFY)

---

## 9. Important Implementation Notes

### 9.1. metricCode vs metricName 매핑 — 차단 요소 없음

기존 백엔드 API(`weight-settings-response.dto.ts`, `target-value-settings-response.dto.ts`)가 이미 `metricCode`와 `metricName`을 모두 반환하고 있습니다. 따라서 프론트엔드는 기존 API 응답에서 `metricName`에 접근할 수 있으며, 별도의 매핑 테이블이나 백엔드 수정이 필요하지 않습니다.

- MetricsTable 등 진입점에서 해당 API 응답의 `metricName` 필드를 사용하여 traceability URL을 생성하면 됩니다.
- 이 항목은 blocking dependency가 아닙니다.

### 9.2. details 타입 안전성

`details`는 `Record<string, unknown>`이므로 각 renderer에서 타입 가드 사용:

```typescript
// ReviewSpeedDetail.tsx 내부
interface ReviewSpeedDetailData {
  responseTime: number;
  reviewRequestTime: string;
  firstResponseTime: string;
  responseTimeFormatted: string;
}

function isReviewSpeedData(data: Record<string, unknown>): data is ReviewSpeedDetailData {
  return typeof data.responseTime === 'number' && typeof data.reviewRequestTime === 'string';
}
```

### 9.3. Date JSON serialization

백엔드 `MergeRequestSummary.createdAt`은 `Date` 타입이지만 JSON 직렬화 후 ISO string이 됩니다. 프론트엔드 타입에서는 `string`으로 정의하고, 표시 시 `new Date(createdAt)` 변환 사용.

### 9.4. 기존 `@uiw/react-json-view` 활용

`GenericDetail` renderer에서 알 수 없는 지표의 details를 표시할 때 이미 의존성에 포함된 `@uiw/react-json-view`를 사용합니다.

### 9.5. COMPANY 진입 시 periodKey 결정

대시보드에서 진입 시 `periodKey`는 `useDashboardStore.currentDate`에서 `YYYY-MM` 형식으로 변환합니다. 일별 데이터로 진입하려면 별도 날짜 선택 UI가 필요합니다 (향후 확장).

### 9.6. MR enrichment join 실패 대응

`details.mergeRequests[j]`와 `mergeRequests[k]` join에서 매칭 실패 시:
- detail 데이터만 있고 MR 메타데이터 없음 → MR 제목/작성자 없이 지표 데이터만 표시
- MR 메타데이터만 있고 detail 없음 → MR 정보만 표시, 지표 상세 "N/A"
