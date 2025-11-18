# 커밋 메시지 예시: fix (버그 수정)

## 타입: TypeScript 빌드 오류 수정

```
fix: TypeScript 빌드 오류 수정 및 타입 안정성 강화

- MetricsTable에서 MetricCategory enum을 값으로 사용하기 위해 import 방식 변경
- ServiceStability 컴포넌트에서 ThresholdType 사용으로 타입 통일
- Dashboard에서 ServiceStabilityMetric 속성명 변경 (count→value, targetCount→targetValue 등)
- GOAL_STATUS_COLORS에 good 상태 추가
- getStatusColor 함수에 default case 추가

# 상세 설명

## 문제 상황
npm run build 실행 시 다음 오류 발생:
- MetricCategory를 값으로 사용할 수 없는 import type 오류 (TS1361)
- ServiceStabilityMetric 속성 불일치 오류 (TS2339)
- ThresholdType의 'good' 타입이 색상 객체에 없는 오류 (TS7053)
- MetricStatus 반환값 누락 오류 (TS2366)

## 수정 내역

### 1. MetricsTable.tsx (src/components/metrics/MetricsTable.tsx)
**변경 전:**
```typescript
import type { MetricItem, MetricStatus, MetricCategory } from "@/types/metrics.types";

const codeQualityCount = metrics.filter((m) => m.category === "code_quality").length;
```

**변경 후:**
```typescript
import type { MetricItem } from "@/types/metrics.types";
import { MetricStatus, MetricCategory } from "@/types/metrics.types";

const codeQualityCount = metrics.filter((m) => m.category === MetricCategory.CODE_QUALITY).length;
```

**이유:** enum은 런타임에 값으로 사용되므로 type import가 아닌 일반 import 필요

### 2. ServiceStability.tsx (src/components/dashboard/ServiceStability.tsx)
**변경 전:**
```typescript
type MetricStatus = "excellent" | "warning" | "danger";

const STATUS_ICONS: Record<MetricStatus, LucideIcon> = {
  excellent: CheckCircle2,
  warning: TriangleAlert,
  danger: TriangleAlert,
};
```

**변경 후:**
```typescript
import type { ThresholdType } from "@/types/serviceStability.types";

const STATUS_ICONS: Record<ThresholdType, LucideIcon> = {
  excellent: CheckCircle2,
  good: CheckCircle2,
  warning: TriangleAlert,
  danger: TriangleAlert,
};
```

**이유:**
- 중복 타입 정의 제거
- ThresholdType에 'good' 상태 포함되어 있어 매핑 필요

### 3. Dashboard.tsx (src/pages/dashboard/Dashboard.tsx)
**변경 내역:**
| 기존 속성명 | 새 속성명 | 이유 |
|------------|----------|------|
| `count` | `value` | ServiceStabilityMetric 인터페이스 통일 |
| `targetCount` | `targetValue` | 목표값 속성명 통일 |
| `rate` | `value` | 비율도 value로 통일 |
| `targetRate` | `targetValue` | 목표 비율 속성명 통일 |
| `hours` | `value` | 시간도 value로 통일 |
| `targetHours` | `targetValue` | 목표 시간 속성명 통일 |

**변경 예시:**
```typescript
// 변경 전
value: `${mockServiceStability.deploymentFrequency.count}회`

// 변경 후
value: `${mockServiceStability.deploymentFrequency.value}회`
```

### 4. colors.ts (src/styles/colors.ts)
```typescript
// 변경 전
export const GOAL_STATUS_COLORS = {
  excellent: "#00A63E",
  warning: "#FF6900",
  danger: "#E7000B",
} as const;

// 변경 후
export const GOAL_STATUS_COLORS = {
  excellent: "#00A63E",
  good: "#10b981",      // 추가
  warning: "#FF6900",
  danger: "#E7000B",
} as const;
```

## 빌드 결과
- ✅ ESLint 검사 통과
- ✅ TypeScript 컴파일 성공
- ✅ Vite 빌드 성공 (3.79s)
- ✅ 모든 타입 오류 해결
```

## 특징
- **타입**: fix (버그 수정)
- **본문**: 5개 주요 수정사항 나열
- **상세 설명**:
  - 문제 상황 명시
  - 변경 전/후 코드 비교
  - 변경 이유 설명
  - 테이블로 다중 변경사항 정리
- **빌드 결과**: 수정 검증 결과 포함
