/**
 * 품질 메트릭 (재사용 가능한 중첩 인터페이스)
 */
export interface QualityMetric {
  score: number; // 품질 점수 (0-100)
  achievedMetrics: number; // 달성한 지표 수
  totalMetrics: number; // 전체 지표 수
}

/**
 * 전월 대비 변화 정보
 */
export interface MonthlyComparison {
  changePercent: number; // 전월 대비 변화율 (%)
  direction: "up" | "down" | "same" | "new"; // 변화 방향
}

/**
 * 전사 품질 메트릭 메인 인터페이스
 */
export interface CompanyQualityMetrics {
  month: string; // 'YYYY-MM' 형식
  bdpiAverage: number; // 전사 BDPI 평균
  monthlyComparison: MonthlyComparison; // 전월 대비 변화
  quality: QualityMetric; // 코드 품질
  review: QualityMetric; // 리뷰 품질
  efficiency: QualityMetric; // 개발 효율
}
