/**
 * 서비스 안정성 상태 타입
 */
export type StatusType = "over_achieved" | "achieved" | "not_achieved" | null;

/**
 * 월별 비교 방향 타입
 */
export type DirectionType = "up" | "down" | "no_change" | "no_data" | "new";

/**
 * 월별 비교 데이터
 */
export interface MonthlyComparison {
  changePercent: number; // 변화율 (%)
  direction: DirectionType; // 변화 방향
}

/**
 * 서비스 안정성 개별 메트릭
 */
export interface ServiceStabilityMetric {
  status: StatusType; // 목표 달성 상태
  value: number; // 실제값
  targetValue: number; // 목표값
  monthlyComparison: MonthlyComparison; // 월별 비교 데이터
  metricName: string; // 메트릭 이름
  unit: string; // 단위 (건, %, 초 등)
}

/**
 * 전사 서비스 안정성 메트릭 메인 인터페이스
 */
export interface ServiceStabilityMetrics {
  month: string; // 'YYYY-MM' 형식
  deploymentFrequency: ServiceStabilityMetric; // 배포 빈도
  deploymentSuccessRate: ServiceStabilityMetric; // 배포 성공률
  meanTimeToRecovery: ServiceStabilityMetric; // 평균 장애 해결 시간
  timeToDetection: ServiceStabilityMetric; // 장애 탐지 시간
  incidentResolvedCount: ServiceStabilityMetric; // 장애 해결수
}
