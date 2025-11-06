/**
 * 차트 공통 설정
 * 모니터링 대시보드에서 사용할 차트의 색상, 스타일 등을 정의
 */

// 차트 색상 팔레트 (모니터링 대시보드용)
export const CHART_COLORS = {
  primary: "#3b82f6", // 파란색 - 주요 지표
  secondary: "#8b5cf6", // 보라색 - 보조 지표
  success: "#10b981", // 녹색 - 정상/증가
  warning: "#f59e0b", // 주황색 - 경고
  danger: "#ef4444", // 빨간색 - 위험/감소
  info: "#06b6d4", // 청록색 - 정보
  gray: "#6b7280", // 회색 - 중립
} as const;

// 다중 라인 차트용 색상 배열
export const MULTI_LINE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.info,
] as const;

// 차트 기본 스타일
export const CHART_STYLES = {
  // 툴팁 스타일
  tooltip: {
    contentStyle: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    },
    labelStyle: {
      color: "#374151",
      fontWeight: 600,
    },
  },

  // 그리드 스타일
  grid: {
    stroke: "#e5e7eb",
    strokeDasharray: "3 3",
  },

  // 축 스타일
  axis: {
    stroke: "#9ca3af",
    fontSize: 12,
  },
} as const;

// 차트 기본 마진
export const CHART_MARGIN = {
  top: 20,
  right: 30,
  left: 20,
  bottom: 20,
} as const;

// 반응형 차트 높이
export const CHART_HEIGHTS = {
  small: 200,
  medium: 300,
  large: 400,
} as const;
