/**
 * 전사 서비스 안정성 데이터 목업
 */

export const mockServiceStability = {
  month: '2025-10',
  deploymentFrequency: {
    threshold: 'excellent' as const,
    count: 245,
    targetCount: 200,
    changeRate: 12,
    metricName: '배포 빈도수',
  },
  deploymentSuccessRate: {
    threshold: 'excellent' as const,
    rate: 96.5,
    targetRate: 95,
    changeRate: 3,
    metricName: '배포 성공률',
  },
  mttr: {
    threshold: 'excellent' as const,
    hours: 2.3,
    targetHours: 3,
    changeRate: 15,
    metricName: 'MTTR',
  },
  mttd: {
    threshold: 'warning' as const,
    hours: 0.8,
    targetHours: 1,
    changeRate: 5,
    metricName: 'MTTD',
  },
  incidentCount: {
    threshold: 'danger' as const,
    count: 12,
    targetCount: 15,
    changeRate: -20,
    metricName: '장애 발생건수',
  },
};
