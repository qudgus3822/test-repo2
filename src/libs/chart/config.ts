import {
  CHART_COLORS,
  CHART_COLOR_ARRAY,
} from "@/styles/colors";

/**
 * 차트 공통 설정
 * 모니터링 대시보드에서 사용할 차트의 색상, 스타일 등을 정의
 */

// Color Palette 3 차트 색상 배열 (다중 라인/바 차트용 순환 색상)
export const MULTI_LINE_COLORS = CHART_COLOR_ARRAY;

// 차트 색상 팔레트 (하위 호환성을 위한 개별 색상 매핑)
export const LEGACY_CHART_COLORS = {
  primary: CHART_COLORS.blue, // #1E54B8 - 파란색 (주요 지표)
  secondary: CHART_COLORS.darkBlue, // #1B21A6 - 진한 파란색 (보조 지표)
  success: "#10b981", // 녹색 - 정상/증가
  warning: CHART_COLORS.orange, // #F39200 - 주황색 (경고)
  danger: "#ef4444", // 빨간색 - 위험/감소
  info: "#06b6d4", // 청록색 - 정보
  gray: "#6b7280", // 회색 - 중립
} as const;

// CHART_COLORS를 명명된 형태로 re-export
export { CHART_COLORS };

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
