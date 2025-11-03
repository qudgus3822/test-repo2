/**
 * 대시보드 목업 데이터
 * API 연결 전 개발 및 테스트용 목업 데이터
 */

// ==================== 전사 BDPI 데이터 목업 ====================
export const mockCompanyQuality = {
  month: '2025-10',
  bdpiAverage: 77.4,
  bdpiChange: 2.3,
  codeQuality: {
    score: 85.3,
    achievedMetrics: 7,
    totalMetrics: 9,
  },
  reviewQuality: {
    score: 69.5,
    achievedMetrics: 9,
    totalMetrics: 12,
  },
  developmentEfficiency: {
    score: 77.4,
    achievedMetrics: 6,
    totalMetrics: 9,
  },
};

// ==================== 전사 서비스 안정성 목업 ====================
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

// ==================== 개발생산성 트렌드 목업 ====================
export const mockProductionTrend = {
  target: 75,
  trendData: [
    {
      month: '2025-05',
      bdpiAverage: 69,
      codeQuality: 75,
      reviewQuality: 65,
      developmentEfficiency: 65,
      target: 75,
    },
    {
      month: '2025-06',
      bdpiAverage: 71,
      codeQuality: 78,
      reviewQuality: 68,
      developmentEfficiency: 68,
      target: 75,
    },
    {
      month: '2025-07',
      bdpiAverage: 73,
      codeQuality: 80,
      reviewQuality: 70,
      developmentEfficiency: 70,
      target: 75,
    },
    {
      month: '2025-08',
      bdpiAverage: 75,
      codeQuality: 80,
      reviewQuality: 73,
      developmentEfficiency: 73,
      target: 75,
    },
    {
      month: '2025-09',
      bdpiAverage: 77,
      codeQuality: 82,
      reviewQuality: 75,
      developmentEfficiency: 76,
      target: 75,
    },
    {
      month: '2025-10',
      bdpiAverage: 78,
      codeQuality: 82,
      reviewQuality: 77,
      developmentEfficiency: 77,
      target: 75,
    },
  ],
};

// ==================== 목표 달성률 목업 ====================
export const mockGoalAchievement = {
  month: '2025-10',
  achievementRate: 76.7,
  achievedMetrics: 23,
  totalMetrics: 30,
};

// ==================== 지표 순위 목업 ====================
export const mockMetricRankings = {
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
