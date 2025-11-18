/**
 * 품질 메트릭 (재사용 가능한 중첩 인터페이스)
 */
export interface QualityMetric {
  score: number; // 품질 점수 (0-100)
  achievedMetrics: number; // 달성한 지표 수
  totalMetrics: number; // 전체 지표 수
}

/**
 * 전사 품질 메트릭 메인 인터페이스
 */
export interface CompanyQualityMetrics {
  month: string; // 'YYYY-MM' 형식
  bdpiAverage: number; // 전사 BDPI 평균
  bdpiChange: number; // 전월 대비 변화율 (%)
  codeQuality: QualityMetric; // 코드 품질
  reviewQuality: QualityMetric; // 리뷰 품질
  developmentEfficiency: QualityMetric; // 개발 효율
}
