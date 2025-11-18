/**
 * 서비스 안정성 임계값 타입
 */
export type ThresholdType = "excellent" | "good" | "warning" | "danger";

/**
 * 메트릭 단위 타입
 */
export type MetricUnitType = "count" | "percentage" | "hours";

/**
 * 서비스 안정성 개별 메트릭
 */
export interface ServiceStabilityMetric {
  threshold: ThresholdType; // 임계값 상태
  value: number; // 실제값 (count, rate, hours 등)
  targetValue: number; // 목표값
  changeRate: number; // 변화율/개선율 (%)
  metricName: string; // 메트릭 이름
  unit?: MetricUnitType; // 단위 (선택적)
}

/**
 * 전사 서비스 안정성 메트릭 메인 인터페이스
 */
export interface ServiceStabilityMetrics {
  month: string; // 'YYYY-MM' 형식
  deploymentFrequency: ServiceStabilityMetric; // 배포 빈도수
  deploymentSuccessRate: ServiceStabilityMetric; // 배포 성공률
  mttr: ServiceStabilityMetric; // MTTR (평균 복구 시간)
  mttd: ServiceStabilityMetric; // MTTD (평균 탐지 시간)
  incidentCount: ServiceStabilityMetric; // 장애 발생건수
}
