import type { MetricRankings } from "@/types/metricRankings.types";

/**
 * 지표 순위 데이터 목업
 */
export const mockMetricRankings: MetricRankings = {
  growth: [
    {
      month: '2025-10',
      type: 'growth' as const,
      rank: 1,
      metricName: '테스트커버리지',
      changeRate: 15.3,
      metricCode: 'TEST_COVERAGE',
    },
    {
      month: '2025-10',
      type: 'growth' as const,
      rank: 2,
      metricName: '리뷰참여율',
      changeRate: 12.8,
      metricCode: 'REVIEW_PARTICIPATION',
    },
    {
      month: '2025-10',
      type: 'growth' as const,
      rank: 3,
      metricName: '배포성공률',
      changeRate: 10.2,
      metricCode: 'DEPLOY_SUCCESS_RATE',
    },
    {
      month: '2025-10',
      type: 'growth' as const,
      rank: 4,
      metricName: '초회통과율',
      changeRate: 8.7,
      metricCode: 'FIRST_PASS_RATE',
    },
    {
      month: '2025-10',
      type: 'growth' as const,
      rank: 5,
      metricName: '커밋빈도',
      changeRate: 7.5,
      metricCode: 'COMMIT_FREQUENCY',
    },
  ],
  warning: [
    {
      month: '2025-10',
      type: 'warning' as const,
      rank: 1,
      metricName: '장애발생건수',
      changeRate: -8.5,
      metricCode: 'INCIDENT_COUNT',
    },
    {
      month: '2025-10',
      type: 'warning' as const,
      rank: 2,
      metricName: '코드복잡도',
      changeRate: -6.3,
      metricCode: 'CODE_COMPLEXITY',
    },
    {
      month: '2025-10',
      type: 'warning' as const,
      rank: 3,
      metricName: '기술부채',
      changeRate: -5.2,
      metricCode: 'TECH_DEBT',
    },
    {
      month: '2025-10',
      type: 'warning' as const,
      rank: 4,
      metricName: 'MTTR',
      changeRate: -4.8,
      metricCode: 'MTTR',
    },
    {
      month: '2025-10',
      type: 'warning' as const,
      rank: 5,
      metricName: '보안취약점수',
      changeRate: -3.1,
      metricCode: 'SECURITY_VULNERABILITIES',
    },
  ],
};
