// ==================== 지표 상태 Enum ====================
export enum MetricStatus {
  ACHIEVED = "achieved", // 달성 (초록색 체크)
  WARNING = "warning", // 주의 (노란색 경고)
  NOT_ACHIEVED = "not_achieved", // 미달성 (빨간색 X)
}

export enum MetricCategory {
  CODE_QUALITY = "code_quality", // 코드품질
  REVIEW_QUALITY = "review_quality", // 리뷰품질
  DEVELOPMENT_EFFICIENCY = "development_efficiency", // 개발효율
}

// ==================== 지표 총 현황 ====================
export interface MetricOverview {
  month: string; // 'YYYY-MM' 형식
  totalMetrics: number; // 전체 지표 수 (30개)
  totalMetricsIcon?: string; // 전체 지표 아이콘 (lucide-react icon name)
  codeQualityCount: number; // 코드품질 지표 수 (9개)
  codeQualityIcon?: string; // 코드품질 아이콘 (lucide-react icon name)
  reviewQualityCount: number; // 리뷰품질 지표 수 (12개)
  reviewQualityIcon?: string; // 리뷰품질 아이콘 (lucide-react icon name)
  developmentEfficiencyCount: number; // 개발효율 지표 수 (9개)
  developmentEfficiencyIcon?: string; // 개발효율 아이콘 (lucide-react icon name)
}

// ==================== 목표 달성률 ====================
export interface MetricsGoalAchievement {
  month: string; // 'YYYY-MM' 형식
  achievementRate: number; // 달성률 (76.7%)
  achievedMetrics: number; // 달성한 지표 수 (23개)
  totalMetrics: number; // 전체 지표 수 (30개)
}

// ==================== 지표 아이템(지표 리스트) ====================
export interface MetricItem {
  name: string; // 지표명 (예: "기술부채", "코드복잡도")
  category: MetricCategory; // 범주
  currentValue: string; // 현재값 (8.2일, 15.2, 3.5%, 125개, 68%)
  targetValue: string; // 목표값 (10일, 12, 5%, 100개, 80%)
  achievementRate: number; // 달성률 (%)
  status: MetricStatus; // 상태 (달성/주의/미달성)
  ratio: number; // 비율 (11.1%, 11.2%)
  metricCode?: string; // 지표 코드 (예: "TECH_DEBT")
  unit?: string; // 단위 (일, %, 개)
  description?: string; // 설명
}
