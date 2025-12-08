// ==================== 지표 상태 Enum ====================
// 2025.11.11 정책 엑셀 참고하여 수정 필요!
export enum MetricStatus {
  EXCELLENT = "excellent", // 우수 (초록색 체크)
  WARNING = "warning", // 경고 (주황색 느낌표)
  DANGER = "danger", // 위험 (빨간색 X)
}

export enum MetricCategory {
  CODE_QUALITY = "quality", // 코드품질
  REVIEW_QUALITY = "review", // 리뷰품질
  DEVELOPMENT_EFFICIENCY = "efficiency", // 개발효율
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

// ==================== 지표 리스트 전체 데이터 ====================
export interface MetricsListData {
  month: string; // 'YYYY-MM' 형식
  totalCount: number; // 전체 지표 수 (30개)
  codeQualityCount: number; // 코드품질 지표 수 (9개)
  reviewQualityCount: number; // 리뷰품질 지표 수 (12개)
  developmentEfficiencyCount: number; // 개발효율 지표 수 (9개)
  // metrics: MetricItemResponse[]; // 지표 배열
  metrics: MetricItem[]; // 지표 배열
}

// ==================== 지표 아이템 ====================
export interface MetricItem {
  name: string; // 지표명 (예: "기술부채", "코드복잡도")
  category: MetricCategory; // 범주 ("quality" | "review" | "efficiency")
  currentValue: string; // 현재값 (8.2일, 15.2, 3.5%, 125개, 68%)
  targetValue: string; // 목표값 (10일, 12, 5%, 100개, 80%)
  achievementRate: number; // 달성률 (%)
  status: MetricStatus; // 상태 (excellent/warning/danger)
  weightRatio: number; // 비율 (11.1%, 11.2%)
  metricCode: string; // 지표 코드 (예: "TECH_DEBT")
  unit: string; // 단위 (hour, count, percent, %, 건, 분 등)
  description?: string; // 설명
  dataSource?: string; // 데이터 소스 (예: "Sonarqube", "Gitlab")
}

// ==================== 달성률 기준 설정 ====================
export interface AchievementCriteria {
  appliedMonth: string; // 적용 월 (YYYY-MM 형식)
  thresholds: {
    excellent: number; // 우수 기준 (%)
    danger: number; // 위험 기준 (%)
  };
  updatedAt: string; // 수정일시 (ISO 8601 형식)
}

export interface AchievementCriteriaUpdateRequest {
  month: string; // 적용 월 (YYYY-MM 형식)
  excellent: number; // 우수 기준 (%)
  danger: number; // 위험 기준 (%)
}

// ==================== 목표값 설정 ====================
export interface TargetValueMetric {
  metricName: string; // 지표명
  category: string; // 범주
  targetValue: string; // 목표값
  unit: string; // 단위
  metricCode: string; // 지표 코드
}

export interface TargetValuesResponse {
  category: string; // 범주 코드
  appliedMonth: string; // 적용 월 (YYYY-MM 형식)
  categoryName: string; // 범주명
  metrics: TargetValueMetric[]; // 지표 목록
  updatedBy: string; // 수정자
  updatedAt: string; // 수정일시 (ISO 8601 형식)
}
