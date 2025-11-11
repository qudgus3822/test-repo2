# 유틸리티 함수 사용 가이드

프로젝트 전반에서 사용되는 공통 유틸리티 함수들에 대한 가이드입니다.

## 📁 디렉토리 구조

```
src/
└── utils/
    ├── errorHandler.ts    # 에러 처리 관련 유틸리티
    └── metrics.ts         # 지표(Metrics) 관련 유틸리티
```

---

## 📊 Metrics 관련 유틸리티

### `getCategoryLabel`

MetricCategory enum 값을 한글 라벨로 변환합니다.

#### 사용 위치

- 지표 테이블, 모달, 상세 화면 등 MetricCategory를 표시하는 모든 컴포넌트

#### Import

**방법 1: 직접 import (권장)**

```typescript
import { getCategoryLabel } from "@/utils/metrics";
```

**방법 2: 통합 import**

```typescript
import { getCategoryLabel } from "@/utils";
```

#### 함수 시그니처

```typescript
getCategoryLabel(category: MetricCategory | string): string
```

#### 파라미터

- `category`: MetricCategory enum 값 또는 문자열
  - `"code_quality"` → 코드품질
  - `"review_quality"` → 리뷰품질
  - `"development_efficiency"` → 개발효율

#### 반환값

- `string`: 한글 라벨 문자열

#### 사용 예시

**기본 사용**

```typescript
import { getCategoryLabel } from "@/utils/metrics";
import { MetricCategory } from "@/types/metrics.types";

// enum 값 사용
const label1 = getCategoryLabel(MetricCategory.CODE_QUALITY);
console.log(label1); // "코드품질"

// 문자열 사용
const label2 = getCategoryLabel("review_quality");
console.log(label2); // "리뷰품질"

const label3 = getCategoryLabel("development_efficiency");
console.log(label3); // "개발효율"
```

**컴포넌트에서 사용**

```typescript
import { getCategoryLabel } from "@/utils/metrics";
import type { MetricItem } from "@/types/metrics.types";

interface Props {
  metric: MetricItem;
}

const MetricCard = ({ metric }: Props) => {
  return (
    <div>
      <span>카테고리: {getCategoryLabel(metric.category)}</span>
    </div>
  );
};
```

**테이블에서 사용**

```typescript
import { getCategoryLabel } from "@/utils/metrics";

const MetricsTable = ({ metrics }: { metrics: MetricItem[] }) => {
  return (
    <table>
      <tbody>
        {metrics.map((metric) => (
          <tr key={metric.metricCode}>
            <td>{metric.name}</td>
            <td>{getCategoryLabel(metric.category)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

#### 적용된 컴포넌트

- ✅ `src/components/metrics/MetricsTable.tsx`
- ✅ `src/components/metrics/MetricsDetailModal.tsx`
- ✅ `src/components/metrics/TargetValueSettingModal.tsx`
- ✅ `src/components/metrics/AchievementRateSettingModal.tsx`

---

## ⚠️ 에러 처리 유틸리티

### 위치

`src/utils/errorHandler.ts`

### 주요 함수

(추후 문서화 예정)

---

## 🔧 새로운 유틸리티 함수 추가 가이드

### 1. 파일 생성 규칙

- 관련된 기능별로 파일 분리
- 파일명은 camelCase 사용 (예: `dateUtils.ts`, `stringUtils.ts`)
- 각 파일은 하나의 도메인/영역에 집중

### 2. 함수 작성 규칙

````typescript
/**
 * 함수에 대한 설명
 *
 * @param paramName - 파라미터 설명
 * @returns 반환값 설명
 *
 * @example
 * ```typescript
 * import { functionName } from "@/utils/fileName";
 *
 * const result = functionName(param);
 * // Returns: 예상 결과
 * ```
 */
export const functionName = (param: Type): ReturnType => {
  // 구현
};
````

### 3. JSDoc 작성

- 함수 설명, 파라미터, 반환값, 사용 예시를 포함
- TypeScript 타입과 함께 명확한 문서화 제공

### 4. 테스트 작성

- 유닛 테스트 작성 권장
- 엣지 케이스 고려

### 5. 가이드 문서 업데이트

- 이 파일에 새로운 함수 사용법 추가
- 적용된 컴포넌트 목록 업데이트

---

## 📝 체크리스트

새로운 유틸리티 함수를 추가할 때:

- [ ] JSDoc 주석 작성
- [ ] TypeScript 타입 정의
- [ ] 사용 예시 코드 작성
- [ ] 가이드 문서 업데이트
- [ ] 관련 컴포넌트에 적용
- [ ] 중복 코드 제거

---

## 💡 Best Practices

### ✅ DO (권장사항)

- 순수 함수로 작성 (부작용 없음)
- 명확한 함수명 사용 (동작을 설명)
- 한 함수는 하나의 책임만 수행
- JSDoc으로 충분한 문서화
- 타입 안정성 보장

### ❌ DON'T (피해야 할 사항)

- 컴포넌트별로 동일한 유틸 함수 중복 작성
- 너무 많은 기능을 하나의 함수에 포함
- 타입 정의 없이 `any` 사용
- 문서화 없이 함수 작성

---

## 📚 참고 자료

- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [JSDoc 공식 문서](https://jsdoc.app/)
