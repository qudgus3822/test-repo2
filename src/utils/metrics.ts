import { MetricCategory, MetricStatus } from "@/types/metrics.types";
import type { ThresholdType } from "@/types/serviceStability.types";
import {
  CheckCircle2,
  TriangleAlert,
  AlertCircle,
  CircleX,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { STATUS_COLORS, TEXT_COLORS } from "@/styles/colors";

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
    code_quality: "코드품질",
    review_quality: "리뷰품질",
    development_efficiency: "개발효율",
  };
  return labels[category] || category;
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
    // MetricStatus
    achieved: CheckCircle2,
    warning: AlertCircle,
    not_achieved: CircleX,
    // ThresholdType
    excellent: CheckCircle2,
    good: CheckCircle2,
    danger: TriangleAlert,
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
    // MetricStatus
    achieved: STATUS_COLORS.excellent, // 초록색
    warning: STATUS_COLORS.warning, // 주황색
    not_achieved: STATUS_COLORS.danger, // 빨간색
    // ThresholdType
    excellent: STATUS_COLORS.excellent, // 초록색
    good: STATUS_COLORS.excellent, // 초록색
    danger: STATUS_COLORS.danger, // 빨간색
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
