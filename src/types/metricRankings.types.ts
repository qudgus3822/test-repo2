/**
 * 지표 순위 타입
 */
export type MetricRankingType = "growth" | "warning";

/**
 * 지표 순위 데이터 타입
 */
export interface MetricRanking {
  month: string; // 'YYYY-MM' 형식
  type: MetricRankingType; // 'growth' | 'warning'
  rank: number; // 순위 (1-5)
  metricName: string; // 지표명 (예: "테스트커버리지")
  changeRate: number; // 변화율 (%)
  metricCode?: string; // 지표 코드 (선택)
}

/**
 * 지표 순위 목업 데이터 구조
 */
export interface MetricRankings {
  growth: MetricRanking[];
  warning: MetricRanking[];
}
