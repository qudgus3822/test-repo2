// ==================== 지표 상태 Enum ====================
// 2025.11.11 정책 엑셀 참고하여 수정 필요!
export enum MetricStatus {
  EXCELLENT = "excellent", // 우수 (초록색 체크)
  WARNING = "warning", // 경고 (주황색 느낌표)
  DANGER = "danger", // 위험 (빨간색 X)
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
export interface MetricsTargetValueAchievement {
  month: string; // 'YYYY-MM' 형식
  achievementRate: number; // 달성률 (76.7%)
  achievedMetrics: number; // 달성한 지표 수 (23개)
  totalMetrics: number; // 전체 지표 수 (30개)
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
  category: MetricCategory; // 범주
  // 25.11.10 API 응답 형태 변경됨. 확인필요. category: "quality" | "review" | "efficiency"; // 범주 (문자열 리터럴)
  currentValue: string; // 현재값 (8.2일, 15.2, 3.5%, 125개, 68%)
  targetValue: string; // 목표값 (10일, 12, 5%, 100개, 80%)
  achievementRate: number; // 달성률 (%)
  status: MetricStatus; // 상태 (달성/주의/미달성)
  ratio: number; // 비율 (11.1%, 11.2%)
  metricCode?: string; // 지표 코드 (예: "TECH_DEBT")
  unit?: string; // 단위 (일, %, 개)
  // 25.11.10 API 응답 형태 변경됨. 확인필요. unit: string; // 단위 (hour, count, percent)
  description?: string; // 설명
}

// ==================== API 응답 형태의 지표 아이템 ====================
// export interface MetricItemResponse {
//   name: string; // 지표명
//   category: "quality" | "review" | "efficiency"; // 범주 (문자열 리터럴)
//   currentValue: string; // 현재값
//   targetValue: string; // 목표값
//   achievementRate: number; // 달성률 (%)
//   status: "achieved" | "warning" | "not_achieved"; // 상태 (문자열 리터럴)
//   ratio: number; // 비율
//   metricCode: string; // 지표 코드
//   unit: string; // 단위 (hour, count, percent)
//   description: string; // 설명
// }
