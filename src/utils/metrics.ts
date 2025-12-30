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
  SECURITY_VULNERABILITIES: "보안취약점수",
  BUG_COUNT: "버그발생수",
  INCIDENT_COUNT: "장애발생수",
  TEST_COVERAGE: "테스트커버리지",
  CODE_DEFECT_DENSITY: "코드결함밀도",
  // 리뷰품질 (12개)
  REVIEW_SPEED: "리뷰속도",
  REVIEW_RESPONSE_RATE: "리뷰요청응답률",
  REVIEW_PARTICIPATION_RATE: "리뷰참여율",
  REVIEW_ACCEPTANCE_RATE: "리뷰제안수용률",
  REVIEW_FEEDBACK_CONCRETENESS: "피드백구체성",
  REVIEW_REQUEST_COUNT: "리뷰요청수",
  REVIEW_PARTICIPATION_COUNT: "리뷰참여수",
  REVIEW_PASS_RATE: "초회통과율",
  REVIEW_PARTICIPATION_NUMBER: "코드리뷰참여수치",
  REVIEW_FEEDBACK_TIME: "피드백반영시간",
  REVIEW_COMPLETION_TIME: "리뷰완료시간",
  REVIEW_REVIEWER_DIVERSE: "리뷰어다양성",
  // 개발효율 (9개)
  PR_SIZE: "MR크기",
  COMMIT_FREQUENCY: "커밋빈도",
  LOC_PER_COMMIT: "커밋당라인수",
  LEAD_TIME: "평균장애해결시간",
  FAILURE_DETECTION_TIME: "장애탐지시간",
  FAILURE_DIAGNOSIS_TIME: "장애진단시간",
  FAILURE_RECOVERY_TIME: "장애복구시간",
  DEPLOYMENT_FREQUENCY: "배포빈도",
  DEPLOYMENT_SUCCESS_RATE: "배포성공률",
};

/**
 * 지표 코드를 `테이블 헤더용 2줄 표시명`으로 매핑하는 객체
 * 80px 컬럼 너비에 맞게 줄바꿈 위치를 지정합니다.
 * 줄바꿈이 필요 없는 짧은 이름은 포함하지 않습니다.
 *
 * @example
 * ```typescript
 * import { METRIC_CODE_DISPLAY_NAMES } from "@/utils/metrics";
 *
 * const displayName = METRIC_CODE_DISPLAY_NAMES["LOC_PER_COMMIT"];
 * // Returns: ["커밋당", "라인수"]
 * ```
 */
export const METRIC_CODE_DISPLAY_NAMES: Record<string, [string, string]> = {
  // 코드품질
  CODE_COMPLEXITY: ["코드", "복잡도"],
  CODE_DUPLICATION: ["코드", "중복률"],
  SECURITY_VULNERABILITIES: ["보안", "취약점수"],
  BUG_COUNT: ["버그", "발생수"],
  INCIDENT_COUNT: ["장애", "발생수"],
  TEST_COVERAGE: ["테스트", "커버리지"],
  CODE_DEFECT_DENSITY: ["코드", "결함밀도"],
  // 리뷰품질
  REVIEW_RESPONSE_RATE: ["리뷰요청", "응답률"],
  REVIEW_PARTICIPATION_RATE: ["리뷰", "참여율"],
  REVIEW_ACCEPTANCE_RATE: ["리뷰제안", "수용률"],
  REVIEW_FEEDBACK_CONCRETENESS: ["피드백", "구체성"],
  REVIEW_REQUEST_COUNT: ["리뷰", "요청수"],
  REVIEW_PARTICIPATION_COUNT: ["리뷰", "참여수"],
  REVIEW_PASS_RATE: ["초회", "통과율"],
  REVIEW_PARTICIPATION_NUMBER: ["코드리뷰", "참여수치"],
  REVIEW_FEEDBACK_TIME: ["피드백", "반영시간"],
  REVIEW_COMPLETION_TIME: ["리뷰", "완료시간"],
  REVIEW_REVIEWER_DIVERSE: ["리뷰어", "다양성"],
  // 개발효율
  LOC_PER_COMMIT: ["커밋당", "라인수"],
  LEAD_TIME: ["평균장애", "해결시간"],
  FAILURE_DETECTION_TIME: ["장애", "탐지시간"],
  FAILURE_DIAGNOSIS_TIME: ["장애", "진단시간"],
  FAILURE_RECOVERY_TIME: ["장애", "복구시간"],
  DEPLOYMENT_SUCCESS_RATE: ["배포", "성공률"],
};

/**
 * 지표 코드를 `설명`으로 매핑하는 객체
 */
export const METRIC_CODE_DESCRIPTIONS: Record<string, string> = {
  // 코드품질 (9개)
  TECH_DEBT: "코드의 기술적 부채를 측정하여 유지보수 비용을 평가합니다.",
  CODE_COMPLEXITY: "코드의 복잡도를 측정하여 유지보수성을 평가합니다.",
  CODE_DUPLICATION: "중복된 코드의 비율을 측정합니다.",
  CODE_SMELL: "잠재적 문제가 있는 코드 패턴의 수를 측정합니다.",
  SECURITY_VULNERABILITIES: "보안 취약점의 수를 측정합니다.",
  BUG_COUNT: "발견된 버그의 수를 측정합니다.",
  INCIDENT_COUNT: "발생한 장애의 수를 측정합니다.",
  TEST_COVERAGE: "테스트로 검증된 코드의 비율을 측정합니다.",
  CODE_DEFECT_DENSITY: "코드 1,000줄당 결함 수를 측정합니다.",
  // 리뷰품질 (12개)
  REVIEW_SPEED: "코드 리뷰 처리 속도를 측정합니다.",
  REVIEW_RESPONSE_RATE: "리뷰 요청에 대한 응답률을 측정합니다.",
  REVIEW_PARTICIPATION_RATE: "코드 리뷰 참여율을 측정합니다.",
  REVIEW_ACCEPTANCE_RATE: "리뷰 제안의 수용률을 측정합니다.",
  REVIEW_FEEDBACK_CONCRETENESS: "리뷰 피드백의 구체성을 측정합니다.",
  REVIEW_REQUEST_COUNT: "리뷰 요청 횟수를 측정합니다.",
  REVIEW_PARTICIPATION_COUNT: "리뷰 참여 횟수를 측정합니다.",
  REVIEW_PASS_RATE: "첫 번째 리뷰에서 통과한 비율을 측정합니다.",
  REVIEW_PARTICIPATION_NUMBER: "코드 리뷰 참여 수치를 측정합니다.",
  REVIEW_FEEDBACK_TIME: "피드백 반영에 걸린 시간을 측정합니다.",
  REVIEW_COMPLETION_TIME: "리뷰 완료까지 걸린 시간을 측정합니다.",
  REVIEW_REVIEWER_DIVERSE: "리뷰어의 다양성을 측정합니다.",
  // 개발효율 (9개)
  PR_SIZE: "MR(Merge Request)의 크기를 측정합니다.",
  COMMIT_FREQUENCY: "커밋 빈도를 측정합니다.",
  LOC_PER_COMMIT: "커밋당 코드 라인 수를 측정합니다.",
  LEAD_TIME: "장애 해결에 걸린 평균 시간을 측정합니다.",
  FAILURE_DETECTION_TIME: "장애 탐지에 걸린 시간을 측정합니다.",
  FAILURE_DIAGNOSIS_TIME: "장애 진단에 걸린 시간을 측정합니다.",
  FAILURE_RECOVERY_TIME: "장애 복구에 걸린 시간을 측정합니다.",
  DEPLOYMENT_FREQUENCY: "배포 빈도를 측정합니다.",
  DEPLOYMENT_SUCCESS_RATE: "배포 성공률을 측정합니다.",
};

/**
 * 지표 코드를 `목표값 표시 문자열`로 매핑하는 객체
 */
export const METRIC_CODE_TARGETS: Record<string, string> = {
  // 코드품질 (9개)
  TECH_DEBT: "60분 이하",
  CODE_COMPLEXITY: "15 이하",
  CODE_DUPLICATION: "5% 이하",
  CODE_SMELL: "10개 이하",
  SECURITY_VULNERABILITIES: "0개",
  BUG_COUNT: "5개 이하",
  INCIDENT_COUNT: "0개",
  TEST_COVERAGE: "80% 이상",
  CODE_DEFECT_DENSITY: "1.0 이하",
  // 리뷰품질 (12개)
  REVIEW_SPEED: "3600초 이하",
  REVIEW_RESPONSE_RATE: "90% 이상",
  REVIEW_PARTICIPATION_RATE: "80% 이상",
  REVIEW_ACCEPTANCE_RATE: "70% 이상",
  REVIEW_FEEDBACK_CONCRETENESS: "80% 이상",
  REVIEW_REQUEST_COUNT: "10개 이상",
  REVIEW_PARTICIPATION_COUNT: "5개 이상",
  REVIEW_PASS_RATE: "70% 이상",
  REVIEW_PARTICIPATION_NUMBER: "80점 이상",
  REVIEW_FEEDBACK_TIME: "60분 이하",
  REVIEW_COMPLETION_TIME: "120분 이하",
  REVIEW_REVIEWER_DIVERSE: "80점 이상",
  // 개발효율 (9개)
  PR_SIZE: "400 LOC 이하",
  COMMIT_FREQUENCY: "5회 이상",
  LOC_PER_COMMIT: "200 LOC 이하",
  LEAD_TIME: "3600초 이하",
  FAILURE_DETECTION_TIME: "600초 이하",
  FAILURE_DIAGNOSIS_TIME: "1200초 이하",
  FAILURE_RECOVERY_TIME: "1800초 이하",
  DEPLOYMENT_FREQUENCY: "10개 이상",
  DEPLOYMENT_SUCCESS_RATE: "95% 이상",
};

/**
 * 지표 코드를 `단위(unit)`로 매핑하는 객체
 *
 * @example
 * ```typescript
 * import { METRIC_CODE_UNITS } from "@/utils/metrics";
 *
 * const unit = METRIC_CODE_UNITS["TECH_DEBT"];
 * // Returns: "일"
 * ```
 */
export const METRIC_CODE_UNITS: Record<string, string> = {
  // 코드품질 (9개)
  TECH_DEBT: "분", // 기술부채
  CODE_COMPLEXITY: "점", // 코드복잡도
  CODE_DUPLICATION: "%", // 코드중복률
  CODE_SMELL: "개", // 코드스멜
  SECURITY_VULNERABILITIES: "개", // 보안취약점수
  BUG_COUNT: "개", // 버그발생수
  INCIDENT_COUNT: "개", // 장애발생수
  TEST_COVERAGE: "%", // 테스트커버리지
  CODE_DEFECT_DENSITY: "/KLOC", // 코드결함밀도
  // 리뷰품질 (12개)
  REVIEW_SPEED: "초", // 리뷰속도
  REVIEW_RESPONSE_RATE: "%", // 리뷰요청응답률
  REVIEW_PARTICIPATION_RATE: "%", // 리뷰참여율
  REVIEW_ACCEPTANCE_RATE: "%", // 리뷰제안수용률
  REVIEW_FEEDBACK_CONCRETENESS: "%", // 피드백구체성
  REVIEW_REQUEST_COUNT: "개", // 리뷰요청수
  REVIEW_PARTICIPATION_COUNT: "개", // 리뷰참여수
  REVIEW_PASS_RATE: "%", // 초회통과율
  REVIEW_PARTICIPATION_NUMBER: "점", // 리뷰참여수치
  REVIEW_FEEDBACK_TIME: "분", // 피드백반영시간
  REVIEW_COMPLETION_TIME: "분", // 리뷰완료시간
  REVIEW_REVIEWER_DIVERSE: "점", // 리뷰어다양성
  // 개발효율 (9개)
  PR_SIZE: "LOC", // MR크기
  COMMIT_FREQUENCY: "회", // 커밋빈도
  LOC_PER_COMMIT: "LOC", // 커밋당라인수
  LEAD_TIME: "초", // 평균장애해결시간
  FAILURE_DETECTION_TIME: "초", // 장애탐지시간
  FAILURE_DIAGNOSIS_TIME: "초", // 장애진단시간
  FAILURE_RECOVERY_TIME: "초", // 장애복구시간
  DEPLOYMENT_FREQUENCY: "개", // 배포빈도
  DEPLOYMENT_SUCCESS_RATE: "%", // 배포성공률
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
  // 코드품질 (1-9) - METRIC_CODE_NAMES 순서와 동일
  TECH_DEBT: 1,
  CODE_COMPLEXITY: 2,
  CODE_DUPLICATION: 3,
  CODE_SMELL: 4,
  SECURITY_VULNERABILITIES: 5,
  BUG_COUNT: 6,
  INCIDENT_COUNT: 7,
  TEST_COVERAGE: 8,
  CODE_DEFECT_DENSITY: 9,
  // 리뷰품질 (10-21) - METRIC_CODE_NAMES 순서와 동일
  REVIEW_SPEED: 10,
  REVIEW_RESPONSE_RATE: 11,
  REVIEW_PARTICIPATION_RATE: 12,
  REVIEW_ACCEPTANCE_RATE: 13,
  REVIEW_FEEDBACK_CONCRETENESS: 14,
  REVIEW_REQUEST_COUNT: 15,
  REVIEW_PARTICIPATION_COUNT: 16,
  REVIEW_PASS_RATE: 17,
  REVIEW_PARTICIPATION_NUMBER: 18,
  REVIEW_FEEDBACK_TIME: 19,
  REVIEW_COMPLETION_TIME: 20,
  REVIEW_REVIEWER_DIVERSE: 21,
  // 개발효율 (22-30) - METRIC_CODE_NAMES 순서와 동일
  PR_SIZE: 22,
  COMMIT_FREQUENCY: 23,
  LOC_PER_COMMIT: 24,
  LEAD_TIME: 25,
  FAILURE_DETECTION_TIME: 26,
  FAILURE_DIAGNOSIS_TIME: 27,
  FAILURE_RECOVERY_TIME: 28,
  DEPLOYMENT_FREQUENCY: 29,
  DEPLOYMENT_SUCCESS_RATE: 30,
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
 * 지표 코드를 단위(unit)로 변환합니다.
 *
 * @param metricCode - 지표 코드 (예: "TECH_DEBT")
 * @returns 단위 문자열 또는 빈 문자열 (매핑이 없는 경우)
 *
 * @example
 * ```typescript
 * import { getMetricUnit } from "@/utils/metrics";
 *
 * const unit = getMetricUnit("TECH_DEBT");
 * // Returns: "일"
 *
 * const unit2 = getMetricUnit("TEST_COVERAGE");
 * // Returns: "%"
 * ```
 */
export const getMetricUnit = (metricCode: string): string => {
  return METRIC_CODE_UNITS[metricCode] ?? "";
};

/**
 * 지표 코드에 해당하는 설명을 반환합니다.
 */
export const getMetricDescription = (metricCode: string): string => {
  return METRIC_CODE_DESCRIPTIONS[metricCode] ?? "";
};

/**
 * 지표 코드에 해당하는 목표값 문자열을 반환합니다.
 */
export const getMetricTarget = (metricCode: string): string => {
  return METRIC_CODE_TARGETS[metricCode] ?? "";
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
