/**
 * 공통 색상 정의
 * 애플리케이션 전체에서 사용하는 색상을 정의합니다.
 */

// 브랜드 색상
export const BRAND_COLORS = {
  primary: "#FF6C00", // 빗썸 주황색
  secondary: "#4751B8", // 보조 색상
} as const;

// 카드/영역 색상
export const SURFACE_COLORS = {
  card: "#FFFFFF", // 카드 배경
  cardBorder: "#E2E8F0", // 카드 테두리
} as const;

// 지표 트렌드 색상
export const TREND_COLORS = {
  increase: "#00A63E", // 상승 (녹색)
  decrease: "#E7000B", // 하락 (빨간색)
} as const;

// 목표값 상태 색상
export const GOAL_STATUS_COLORS = {
  excellent: "#00A63E", // 우수
  warning: "#FF6900", // 경고
  danger: "#E7000B", // 위험
} as const;

// 상태 색상
export const STATUS_COLORS = {
  success: "#10b981", // 성공
  warning: "#FF6900", // 경고
  error: "#E7000B", // 에러
  info: "#06b6d4", // 정보
} as const;

// 텍스트 색상
export const TEXT_COLORS = {
  primary: "#111827", // 주요 텍스트
  secondary: "#6b7280", // 보조 텍스트
  disabled: "#9ca3af", // 비활성화 텍스트
} as const;

// 모든 색상 통합 export
export const COLORS = {
  brand: BRAND_COLORS,
  surface: SURFACE_COLORS,
  trend: TREND_COLORS,
  status: STATUS_COLORS,
  text: TEXT_COLORS,
} as const;
