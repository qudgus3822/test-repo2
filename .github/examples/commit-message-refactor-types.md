# 커밋 메시지 예시: refactor (리팩토링)

## 타입: 대시보드 목업 데이터 타입 정의 추가

```
refactor(types): 대시보드 목업 데이터 타입 정의 추가

- MongoDB 스키마 기반 TypeScript 인터페이스 생성
- 전사 품질, 서비스 안정성, 개발생산성 트렌드, 목표 달성률, 지표 순위 목업에 타입 적용
- 타입 안전성 강화 및 코드 품질 개선

# 상세 설명

## 배경
백엔드 MongoDB 스키마와 프론트엔드 타입 정의가 일치하지 않아 타입 안전성이 부족했습니다.
API 연동 전에 목업 데이터에 올바른 타입을 적용하여 개발 중 타입 오류를 사전에 방지하고자 합니다.

## 생성된 타입 파일

| 파일명 | 인터페이스 | 설명 |
|--------|-----------|------|
| `companyQuality.types.ts` | `CompanyQualityMetrics` | 전사 BDPI 품질 데이터 |
| `serviceStability.types.ts` | `ServiceStabilityMetrics` | 서비스 안정성 메트릭 |
| `productionTrend.types.ts` | `DevelopmentProductionTrend` | 개발생산성 트렌드 |
| `goalAchievement.types.ts` | `GoalAchievementRate` | 목표 달성률 |
| `metricRankings.types.ts` | `MetricRankings` | 지표 순위 (우수/위험) |

## 타입 적용 예시

### 1. serviceStability.types.ts
```typescript
/**
 * 서비스 안정성 임계값 타입
 */
export type ThresholdType = "excellent" | "good" | "warning" | "danger";

/**
 * 서비스 안정성 개별 메트릭
 */
export interface ServiceStabilityMetric {
  threshold: ThresholdType;
  value: number;              // count, rate, hours 통합
  targetValue: number;        // 목표값
  changeRate: number;         // 변화율 (%)
  metricName: string;
  unit?: MetricUnitType;      // "count" | "percentage" | "hours"
}

/**
 * 전사 서비스 안정성 메트릭
 */
export interface ServiceStabilityMetrics {
  month: string;
  deploymentFrequency: ServiceStabilityMetric;
  deploymentSuccessRate: ServiceStabilityMetric;
  mttr: ServiceStabilityMetric;
  mttd: ServiceStabilityMetric;
  incidentCount: ServiceStabilityMetric;
}
```

### 2. 목업 파일 수정 (serviceStability.mock.ts)
**변경 전:**
```typescript
export const mockServiceStability = {
  month: '2025-10',
  deploymentFrequency: {
    threshold: 'excellent' as const,
    count: 245,
    targetCount: 200,
    // ...
  },
  // ...
};
```

**변경 후:**
```typescript
import type { ServiceStabilityMetrics } from "@/types/serviceStability.types";

export const mockServiceStability: ServiceStabilityMetrics = {
  month: "2025-10",
  deploymentFrequency: {
    threshold: "excellent",
    value: 241,               // count → value
    targetValue: 200,         // targetCount → targetValue
    changeRate: 14,
    metricName: "배포 빈도수",
    unit: "count",
  },
  // ...
};
```

## 타입 설계 원칙

### 1. MongoDB 스키마와 일치
백엔드 스키마의 필드명과 타입을 그대로 사용:
```typescript
// MongoDB Schema (NestJS)
@Prop({ required: true })
month: string;

@Prop({ required: true })
value: number;

// TypeScript Interface
month: string;
value: number;
```

### 2. 공통 속성 통일
- `count`, `rate`, `hours` → `value`로 통일
- `targetCount`, `targetRate`, `targetHours` → `targetValue`로 통일
- 단위 구분은 `unit` 필드 활용

### 3. Enum vs Union Type
- 상태 값이 고정된 경우: **Union Type** 사용
  ```typescript
  type ThresholdType = "excellent" | "good" | "warning" | "danger";
  ```
- 카테고리처럼 값으로 사용되는 경우: **Enum** 사용
  ```typescript
  export enum MetricCategory {
    CODE_QUALITY = "code_quality",
    REVIEW_QUALITY = "review_quality",
    DEVELOPMENT_EFFICIENCY = "development_efficiency",
  }
  ```

## 개선 효과
- ✅ 타입 안전성 강화: 목업 데이터 수정 시 컴파일 단계에서 오류 감지
- ✅ 자동완성 지원: IDE에서 속성명 자동완성 및 타입 힌트 제공
- ✅ 백엔드 스키마와 동기화: API 연동 시 타입 불일치 방지
- ✅ 리팩토링 안정성: 인터페이스 변경 시 영향 받는 코드 즉시 파악
- ✅ 코드 가독성 향상: 데이터 구조를 명확히 파악 가능
```

## 특징
- **타입**: refactor (코드 개선)
- **scope**: types (타입 정의)
- **본문**: 3개 주요 변경사항 나열
- **상세 설명**:
  - 배경 설명 (왜 필요한지)
  - 테이블로 생성된 파일 정리
  - 변경 전/후 코드 비교
  - 타입 설계 원칙 설명
  - 개선 효과 정량화
