/**
 * 개발생산성 트렌드 데이터 타입
 */
export interface DevelopmentProductionTrend {
  month: string; // 'YYYY-MM' 형식
  bdpiAverage: number; // BDPI 평균
  codeQuality: number; // 코드품질 점수
  reviewQuality: number; // 리뷰품질 점수
  developmentEfficiency: number; // 개발효율 점수
  target: number; // 목표치 (점선)
}
