import { MetricCategory, MetricStatus } from "@/types/metrics.types";
import type { ThresholdType } from "@/types/serviceStability.types";
import { CheckCircle2, AlertCircle, CircleX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { STATUS_COLORS, TEXT_COLORS, PALETTE_COLORS } from "@/styles/colors";

// ================================
// 지표 코드 → 지표명 매핑
// ================================

/**
 * 지표 코드를 `화면 노출 지표명`으로 매핑하는 객체
 *
 * @example
 * ```typescript
 * import { METRIC_CODE_NAMES } from "@/utils/metrics";
 *
 * const name = METRIC_CODE_NAMES["TECH_DEBT"];
 * // Returns: "기술부채"
 * ```
 */
export const METRIC_CODE_NAMES: Record<string, string> = {
  // 코드품질 (9개)
  TECH_DEBT: "기술부채",
  CODE_COMPLEXITY: "코드복잡도",
  CODE_DUPLICATION: "코드중복률",
  CODE_SMELL: "코드스멜",
  TEST_COVERAGE: "테스트커버리지",
  SECURITY_VULNERABILITIES: "보안취약점수",
  CODE_DEFECT_DENSITY: "코드결함밀도",
  BUG_COUNT: "버그발생수",
  INCIDENT_COUNT: "장애발생수",
  // 리뷰품질 (12개)
  REVIEW_SPEED: "리뷰속도",
  REVIEW_RESPONSE_RATE: "리뷰요청응답률",
  REVIEW_PARTICIPATION_RATE: "리뷰참여율",
  REVIEW_ACCEPTANCE_RATE: "리뷰제안수용률",
  REVIEW_FEEDBACK_CONCRETENESS: "피드백구체성",
  REVIEW_REVIEWER_DIVERSE: "리뷰어다양성",
  REVIEW_REQUEST_COUNT: "리뷰요청수",
  REVIEW_PARTICIPATION_COUNT: "리뷰참여수",
  REVIEW_PASS_RATE: "초회통과율",
  REVIEW_PARTICIPATION_NUMBER: "코드리뷰참여수치",
  REVIEW_FEEDBACK_TIME: "피드백반영시간",
  REVIEW_COMPLETION_TIME: "리뷰완료시간",
  // 개발효율 (9개)
  DEPLOYMENT_FREQUENCY: "배포빈도",
  COMMIT_FREQUENCY: "커밋빈도",
  LEAD_TIME: "평균장애해결시간",
  FAILURE_DETECTION_TIME: "장애탐지시간",
  FAILURE_DIAGNOSIS_TIME: "장애진단시간",
  FAILURE_RECOVERY_TIME: "장애복구시간",
  DEPLOYMENT_SUCCESS_RATE: "배포성공률",
  MR_SIZE: "MR크기",
  CODE_LINE_COUNT_PER_COMMIT: "커밋당라인수",
};

/**
 * 지표 코드별 정렬 순서를 정의하는 객체
 * 숫자가 작을수록 먼저 표시됩니다.
 *
 * @example
 * ```typescript
 * import { METRIC_CODE_ORDER } from "@/utils/metrics";
 *
 * const order = METRIC_CODE_ORDER["TECH_DEBT"];
 * // Returns: 1
 * ```
 */
export const METRIC_CODE_ORDER: Record<string, number> = {
  // 코드품질 (1-9)
  TECH_DEBT: 1, // 기술부채
  CODE_COMPLEXITY: 2, // 코드복잡도
  CODE_DUPLICATION: 3, // 코드중복률
  CODE_SMELL: 4, // 코드스멜
  SECURITY_VULNERABILITIES: 5, // 보안취약점수
  BUG_COUNT: 6, // 버그발생수
  INCIDENT_COUNT: 7, // 장애발생수
  TEST_COVERAGE: 8, // 테스트커버리지
  CODE_DEFECT_DENSITY: 9, // 코드결함밀도
  // 리뷰품질 (10-21)
  REVIEW_SPEED: 10, // 리뷰속도
  REVIEW_RESPONSE_RATE: 11, // 리뷰요청응답률
  REVIEW_PARTICIPATION_RATE: 12, // 리뷰참여율
  REVIEW_ACCEPTANCE_RATE: 13, // 리뷰제안수용률
  REVIEW_FEEDBACK_CONCRETENESS: 14, // 피드백구체성
  REVIEW_REQUEST_COUNT: 15, // 리뷰요청수
  REVIEW_PARTICIPATION_COUNT: 16, // 리뷰참여수
  REVIEW_PASS_RATE: 17, // 초회통과율
  REVIEW_PARTICIPATION_NUMBER: 18, // 코드리뷰참여수치
  REVIEW_FEEDBACK_TIME: 19, // 피드백반영시간
  REVIEW_COMPLETION_TIME: 20, // 리뷰완료시간
  REVIEW_REVIEWER_DIVERSE: 21, // 리뷰어다양성
  // 개발효율 (22-30)
  MR_SIZE: 22, // MR크기
  COMMIT_FREQUENCY: 23, // 커밋빈도
  CODE_LINE_COUNT_PER_COMMIT: 24, // 커밋당라인수
  LEAD_TIME: 25, // 평균장애해결시간
  FAILURE_DETECTION_TIME: 26, // 장애탐지시간
  FAILURE_DIAGNOSIS_TIME: 27, // 장애진단시간
  FAILURE_RECOVERY_TIME: 28, // 장애복구시간
  DEPLOYMENT_FREQUENCY: 29, // 배포빈도
  DEPLOYMENT_SUCCESS_RATE: 30, // 배포성공률
};

/**
 * 지표 코드의 정렬 순서를 반환합니다.
 *
 * @param metricCode - 지표 코드 (예: "TECH_DEBT")
 * @returns 정렬 순서 (매핑이 없는 경우 999 반환)
 *
 * @example
 * ```typescript
 * import { getMetricOrder } from "@/utils/metrics";
 *
 * const order = getMetricOrder("TECH_DEBT");
 * // Returns: 1
 * ```
 */
export const getMetricOrder = (metricCode: string): number => {
  return METRIC_CODE_ORDER[metricCode] ?? 999;
};

/**
 * 지표 배열을 정의된 순서대로 정렬합니다.
 *
 * @param metrics - 정렬할 지표 배열
 * @param getCode - 지표 객체에서 코드를 추출하는 함수 (기본값: item.metricCode)
 * @returns 정렬된 지표 배열
 *
 * @example
 * ```typescript
 * import { sortMetricsByOrder } from "@/utils/metrics";
 *
 * const sorted = sortMetricsByOrder(metrics);
 * // 또는 커스텀 키 사용
 * const sorted = sortMetricsByOrder(metrics, (item) => item.code);
 * ```
 */
export const sortMetricsByOrder = <T extends { metricCode?: string }>(
  metrics: T[],
  getCode?: (item: T) => string,
): T[] => {
  return [...metrics].sort((a, b) => {
    const codeA = getCode ? getCode(a) : a.metricCode ?? "";
    const codeB = getCode ? getCode(b) : b.metricCode ?? "";
    return getMetricOrder(codeA) - getMetricOrder(codeB);
  });
};

/**
 * 지표 코드를 한글 지표명으로 변환합니다.
 *
 * @param metricCode - 지표 코드 (예: "TECH_DEBT")
 * @returns 한글 지표명 또는 원본 코드 (매핑이 없는 경우)
 *
 * @example
 * ```typescript
 * import { getMetricName } from "@/utils/metrics";
 *
 * const name = getMetricName("TECH_DEBT");
 * // Returns: "기술부채"
 * ```
 */
export const getMetricName = (metricCode: string): string => {
  return METRIC_CODE_NAMES[metricCode] || metricCode;
};

/**
 * MetricCategory enum을 한글 라벨로 변환합니다.
 *
 * @param category - MetricCategory enum 값 또는 문자열
 * @returns 한글 라벨 문자열
 *
 * @example
 * ```typescript
 * import { getCategoryLabel } from "@/utils/metrics";
 * import { MetricCategory } from "@/types/metrics.types";
 *
 * const label1 = getCategoryLabel(MetricCategory.CODE_QUALITY);
 * // Returns: "코드품질"
 *
 * const label2 = getCategoryLabel("review_quality");
 * // Returns: "리뷰품질"
 * ```
 */
export const getCategoryLabel = (category: MetricCategory | string): string => {
  const labels: Record<string, string> = {
    quality: "코드품질",
    review: "리뷰품질",
    efficiency: "개발효율",
  };
  return labels[category] || category;
};

/**
 * MetricCategory에 따른 스타일(색상, 테두리, 배경색)을 반환합니다.
 *
 * @param category - MetricCategory enum 값
 * @returns 스타일 객체 (color, borderColor, bgColor)
 *
 * @example
 * ```typescript
 * import { getCategoryStyle } from "@/utils/metrics";
 * import { MetricCategory } from "@/types/metrics.types";
 *
 * const style = getCategoryStyle(MetricCategory.CODE_QUALITY);
 * // Returns: { color: "#3B82F6", borderColor: "#3B82F6", bgColor: "#EFF6FF" }
 * ```
 */
export const getCategoryStyle = (category: MetricCategory) => {
  switch (category) {
    case MetricCategory.CODE_QUALITY:
      return {
        color: PALETTE_COLORS.blue,
        borderColor: PALETTE_COLORS.blue,
        //bgColor: "#EFF6FF",
      };
    case MetricCategory.REVIEW_QUALITY:
      return {
        color: PALETTE_COLORS.orange,
        borderColor: PALETTE_COLORS.orange,
        //bgColor: "#FFF7ED",
      };
    case MetricCategory.DEVELOPMENT_EFFICIENCY:
      return {
        color: PALETTE_COLORS.purple,
        borderColor: PALETTE_COLORS.purple,
        //bgColor: "#FAF5FF",
      };
    default:
      return {
        color: "#6B7280",
        borderColor: "#D1D5DB",
        //bgColor: "#F9FAFB",
      };
  }
};

/**
 * 상태 타입 정의 (MetricStatus와 ThresholdType 통합)
 */
export type StatusType = MetricStatus | ThresholdType;

/**
 * 상태 아이콘 설정 인터페이스
 */
export interface StatusIconConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
}

/**
 * MetricStatus 또는 ThresholdType에 따른 아이콘을 반환합니다.
 *
 * @param status - MetricStatus 또는 ThresholdType
 * @returns Lucide 아이콘 컴포넌트
 *
 * @example
 * ```typescript
 * import { getStatusIcon } from "@/utils/metrics";
 * import { MetricStatus } from "@/types/metrics.types";
 *
 * const Icon = getStatusIcon(MetricStatus.ACHIEVED);
 * // Returns: CheckCircle2
 * ```
 */
export const getStatusIcon = (status: StatusType): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    // MetricStatus (enum 값)
    excellent: CheckCircle2, // EXCELLENT (우수)
    warning: AlertCircle, // WARNING (경고)
    danger: CircleX, // DANGER (위험 - 빨간색 X)
    // 기존 호환성을 위한 매핑
    achieved: CheckCircle2,
    not_achieved: CircleX,
    // ThresholdType
    good: CheckCircle2,
  };
  return iconMap[status] || AlertCircle;
};

/**
 * MetricStatus 또는 ThresholdType에 따른 색상을 반환합니다.
 *
 * @param status - MetricStatus 또는 ThresholdType
 * @returns 색상 hex 코드
 *
 * @example
 * ```typescript
 * import { getStatusColor } from "@/utils/metrics";
 * import { MetricStatus } from "@/types/metrics.types";
 *
 * const color = getStatusColor(MetricStatus.ACHIEVED);
 * // Returns: "#10b981"
 * ```
 */
export const getStatusColor = (status: StatusType): string => {
  const colorMap: Record<string, string> = {
    // MetricStatus (enum 값)
    excellent: STATUS_COLORS.excellent, // EXCELLENT (우수 - 초록색)
    warning: STATUS_COLORS.warning, // WARNING (경고 - 주황색)
    danger: STATUS_COLORS.danger, // DANGER (위험 - 빨간색)
    // 기존 호환성을 위한 매핑
    achieved: STATUS_COLORS.excellent, // 초록색
    not_achieved: STATUS_COLORS.danger, // 빨간색
    // ThresholdType
    good: STATUS_COLORS.excellent, // 초록색
  };
  return colorMap[status] || TEXT_COLORS.secondary; // 기본값: 회색
};

/**
 * MetricStatus 또는 ThresholdType에 따른 아이콘, 색상, 배경색을 반환합니다.
 *
 * @param status - MetricStatus 또는 ThresholdType
 * @returns 아이콘 설정 객체 (아이콘, 색상, 배경색, 라벨)
 *
 * @example
 * ```typescript
 * import { getStatusIconConfig } from "@/utils/metrics";
 * import { MetricStatus } from "@/types/metrics.types";
 *
 * const config = getStatusIconConfig(MetricStatus.ACHIEVED);
 * const Icon = config.icon;
 * // Returns: { icon: CheckCircle2, color: "#10b981", bgColor: "#10b98120", label: "달성" }
 * ```
 */
export const getStatusIconConfig = (status: StatusType): StatusIconConfig => {
  const configMap: Record<string, StatusIconConfig> = {
    // MetricStatus - 지표 상태 (달성률)
    achieved: {
      icon: CheckCircle2,
      color: STATUS_COLORS.excellent,
      bgColor: `${STATUS_COLORS.excellent}20`,
      label: "달성",
    },
    warning: {
      icon: AlertCircle,
      color: STATUS_COLORS.warning,
      bgColor: `${STATUS_COLORS.warning}20`,
      label: "주의",
    },
    not_achieved: {
      icon: CircleX,
      color: STATUS_COLORS.danger,
      bgColor: `${STATUS_COLORS.danger}20`,
      label: "미달성",
    },
    // ThresholdType - 목표 달성 상태
    excellent: {
      icon: CheckCircle2,
      color: STATUS_COLORS.excellent,
      bgColor: `${STATUS_COLORS.excellent}20`,
      label: "우수",
    },
    good: {
      icon: CheckCircle2,
      color: STATUS_COLORS.excellent,
      bgColor: `${STATUS_COLORS.excellent}20`,
      label: "양호",
    },
    danger: {
      icon: CircleX,
      color: STATUS_COLORS.danger,
      bgColor: `${STATUS_COLORS.danger}20`,
      label: "위험",
    },
  };
  return (
    configMap[status] || {
      icon: AlertCircle,
      color: TEXT_COLORS.secondary,
      bgColor: `${TEXT_COLORS.secondary}20`,
      label: "알 수 없음",
    }
  );
};

/**
 * 달성률과 기준값을 기반으로 지표의 상태를 계산합니다.
 *
 * @param achievementRate - 지표의 달성률 (%)
 * @param excellentThreshold - 우수 기준값 (%)
 * @param dangerThreshold - 위험 기준값 (%)
 * @returns 계산된 MetricStatus (excellent/warning/danger)
 *
 * @example
 * ```typescript
 * import { calculateMetricStatus } from "@/utils/metrics";
 *
 * // 달성률 90%, 우수 기준 80%, 위험 기준 50%
 * const status = calculateMetricStatus(90, 80, 50);
 * // Returns: MetricStatus.EXCELLENT
 *
 * // 달성률 65%, 우수 기준 80%, 위험 기준 50%
 * const status2 = calculateMetricStatus(65, 80, 50);
 * // Returns: MetricStatus.WARNING
 *
 * // 달성률 30%, 우수 기준 80%, 위험 기준 50%
 * const status3 = calculateMetricStatus(30, 80, 50);
 * // Returns: MetricStatus.DANGER
 * ```
 */
export const calculateMetricStatus = (
  achievementRate: number,
  excellentThreshold: number,
  dangerThreshold: number,
): MetricStatus => {
  if (achievementRate >= excellentThreshold) {
    return MetricStatus.EXCELLENT;
  }
  if (achievementRate >= dangerThreshold) {
    return MetricStatus.WARNING;
  }
  return MetricStatus.DANGER;
};
