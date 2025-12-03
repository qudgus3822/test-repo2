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

// 프로필 아바타 색상 (이름 기반 색상 결정에 사용)
export const AVATAR_COLORS = {
  amber: "#F59E0B",
  emerald: "#10B981",
  blue: "#3B82F6",
  violet: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
} as const;

// 아바타 색상 배열 (순환 참조용)
export const AVATAR_COLOR_ARRAY = Object.values(AVATAR_COLORS);

// 이름에서 아바타 색상 결정 헬퍼 함수
export const getAvatarColor = (name: string): string => {
  const index = name.charCodeAt(0) % AVATAR_COLOR_ARRAY.length;
  return AVATAR_COLOR_ARRAY[index];
};

// 조직비교 점수 색상 (달성률 기반)
export const SCORE_COLORS = {
  excellent: "#91D470", // 80% 이상 (초록)
  good: "#FBFFBD", // 70% ~ 80% 미만 (연한 노란색)
  danger: "#F38752", // 70% 미만 (주황)
  none: "#F3F4F6", // 데이터 없음 (회색)
} as const;

// 조직비교 상태 뱃지 색상 (ApiMemberStatus 기준)
export const STATUS_BADGE_COLORS = {
  ACTIVE: { bg: "#DBEAFE", text: "#2563EB" }, // 재직 (blue-100, blue-600)
  JOINED: { bg: "#F3E8FF", text: "#7C3AED" }, // 입사 (purple-100, purple-600)
  RESIGNED: { bg: "#FEE2E2", text: "#DC2626" }, // 퇴사 (red-100, red-600)
  ON_LEAVE: { bg: "#F3F4F6", text: "#4B5563" }, // 휴직 (gray-100, gray-600)
  RETURNED: { bg: "#EDE9FE", text: "#7C3AED" }, // 복직 (violet-100, violet-600)
  TRANSFERRED_IN: { bg: "#FEF3C7", text: "#D97706" }, // 이동후 (amber-100, amber-600)
  TRANSFERRED_OUT: { bg: "#FEF3C7", text: "#D97706" }, // 이동전 (amber-100, amber-600)
  CHANGED_ROLE: { bg: "#DBEAFE", text: "#2563EB" }, // 직급변경 (blue-100, blue-600)
  CHANGED_POSITION: { bg: "#DBEAFE", text: "#2563EB" }, // 직책변경 (blue-100, blue-600)
  default: { bg: "#F3F4F6", text: "#4B5563" }, // 기본 (gray-100, gray-600)
} as const;

// 변경 유형 뱃지 색상 (ApiMemberStatus, ApiDepartmentStatus, ApiPolicyStatus)
export const CHANGE_TYPE_BADGE_COLORS = {
  // ApiMemberStatus
  CHANGED_ROLE: "#5B6CFF", // 직책변경 (파란색)
  CHANGED_POSITION: "#0063AC", // 직급변경 (파란색)
  TRANSFERRED_OUT: "#DA9604", // 이동전 (주황색)
  TRANSFERRED_IN: "#DA9604", // 이동후 (주황색)
  JOINED: "#7B88FF", // 입사 (보라색)
  RESIGNED: "#7B7B7B", // 퇴사 (회색)
  ON_LEAVE: "#A7A7A7", // 휴직 (연회색)
  RETURNED: "#AD89B3", // 복직 (연보라색)
  // ApiDepartmentStatus
  CREATED: "#7B88FF", // 생성 (보라색)
  DELETED: "#FF6A6A", // 삭제 (빨간색)
  RENAMED: "#90A1B9", // 변경 (연회색)
  // ApiPolicyStatus
  ADD: "#5B6CFF", // 추가 (보라색)
  EXCLUDE: "#90A1B9", // 제외 (회색)
  // 기본값
  default: "#6B7280", // 기본 (회색)
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
  avatar: AVATAR_COLORS,
  score: SCORE_COLORS,
  statusBadge: STATUS_BADGE_COLORS,
  changeTypeBadge: CHANGE_TYPE_BADGE_COLORS,
} as const;
