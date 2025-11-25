/**
 * 공통 색상 정의
 * 애플리케이션 전체에서 사용하는 색상을 정의합니다.
 */

// 브랜드 색상
export const BRAND_COLORS = {
  primary: "#FF6C00", // 빗썸 주황색 (메인 로고)
  secondary: "#4751B8", // 보조 색상 (레거시)
} as const;

// Color Palette 3 - 프로젝트 전반 사용
export const PALETTE_COLORS = {
  darkBlue: "#1B21A6", // 진한 파란색 (네이비)
  blue: "#1E54B8", // 파란색 (메인 포인트)
  yellow: "#FABA3F", // 노란색
  orange: "#F39200", // 주황색 (경고/강조)
  lightYellow: "#F5DB86", // 연한 노란색
  purple: "#9333EA", // 보라색 - 지표 관리 화면에서 사용
  teal: "#14B8A6", // 청록 (Teal) - 지표 관리 화면에서 사용 후보
} as const;

// 차트 색상 (PALETTE_COLORS와 동일, 명확성을 위한 별칭)
export const CHART_COLORS = {
  darkBlue: "#1B21A6", // 진한 파란색
  blue: "#1E54B8", // 파란색
  yellow: "#FABA3F", // 노란색
  orange: "#F39200", // 주황색
  lightYellow: "#F5DB86", // 연한 노란색
  purple: "#9333EA", // 보라색 - 지표 관리 화면에서 사용
  teal: "#14B8A6", // 청록 (Teal) - 지표 관리 화면에서 사용 후보
} as const;

// 차트 컴포넌트용 색상 배열 (순환 참조용)
export const CHART_COLOR_ARRAY = Object.values(CHART_COLORS);

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
  excellent: "#00A756", // 우수
  good: "#10b981", // 양호
  warning: "#E27531", // 경고
  danger: "#FC3018", // 위험
} as const;

// 상태(달성률) 색상
export const STATUS_COLORS = {
  excellent: "#00A756", // 우수
  warning: "#E27531", // 경고
  danger: "#FC3018", // 위험
  info: "#06b6d4", // 정보
} as const;

// 텍스트 색상
export const TEXT_COLORS = {
  primary: "#111827", // 주요 텍스트
  secondary: "#6B7280", // 보조 텍스트
  disabled: "#9CA3AF", // 비활성화 텍스트
} as const;

// 모든 색상 통합 export
export const COLORS = {
  brand: BRAND_COLORS,
  palette: PALETTE_COLORS,
  chart: CHART_COLORS,
  surface: SURFACE_COLORS,
  trend: TREND_COLORS,
  status: STATUS_COLORS,
  text: TEXT_COLORS,
} as const;
