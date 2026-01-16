import {
  MetricCategory,
  MetricStatus,
  type MetricsListData,
  type TargetValueMetric,
} from "@/types/metrics.types";
import type { StatusType as ServiceStabilityStatus } from "@/types/serviceStability.types";
import { CheckCircle2, AlertCircle, CircleX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { STATUS_COLORS, TEXT_COLORS, PALETTE_COLORS } from "@/styles/colors";

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
 * 상태 타입 정의 (MetricStatus와 ServiceStabilityStatus 통합)
 */
export type StatusType = MetricStatus | ServiceStabilityStatus;

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
export const getStatusIcon = (status: StatusType | null): LucideIcon => {
  if (!status) return AlertCircle;
  const iconMap: Record<string, LucideIcon> = {
    // MetricStatus (enum 값)
    excellent: CheckCircle2, // EXCELLENT (우수)
    warning: AlertCircle, // WARNING (경고)
    danger: CircleX, // DANGER (위험 - 빨간색 X)
    // ServiceStabilityStatus
    over_achieved: CheckCircle2, // 초과 달성
    achieved: CheckCircle2, // 달성
    not_achieved: CircleX, // 미달성
    // 기존 호환성
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
export const getStatusColor = (status: StatusType | null): string => {
  if (!status) return TEXT_COLORS.secondary;
  const colorMap: Record<string, string> = {
    // MetricStatus (enum 값)
    excellent: STATUS_COLORS.excellent, // EXCELLENT (우수 - 초록색)
    warning: STATUS_COLORS.warning, // WARNING (경고 - 주황색)
    danger: STATUS_COLORS.danger, // DANGER (위험 - 빨간색)
    // ServiceStabilityStatus
    over_achieved: STATUS_COLORS.excellent, // 초과 달성 - 초록색
    achieved: STATUS_COLORS.excellent, // 달성 - 초록색
    not_achieved: STATUS_COLORS.danger, // 미달성 - 빨간색
    // 기존 호환성
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
export const getStatusIconConfig = (status: StatusType | null): StatusIconConfig => {
  if (!status) {
    return {
      icon: AlertCircle,
      color: TEXT_COLORS.secondary,
      bgColor: `${TEXT_COLORS.secondary}20`,
      label: "데이터 없음",
    };
  }
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
    // ServiceStabilityStatus - 초과 달성
    over_achieved: {
      icon: CheckCircle2,
      color: STATUS_COLORS.excellent,
      bgColor: `${STATUS_COLORS.excellent}20`,
      label: "초과달성",
    },
    // 기존 호환성
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

/**
 * MetricsListData를 TargetValueMetric[] 배열로 변환하는 함수
 * [변경: 2026-01-08 13:23, 김병현 수정] MetricsListData -> TargetValueMetric[] 변환 함수로 수정
 * @param metricsListData - 변환할 MetricsListData
 * @param targetCategory - 필터링할 범주 (선택사항)
 * @returns TargetValueMetric[] 배열
 */
export function convertToMetricsListData(
  metricsListData: MetricsListData,
  targetCategory?: MetricCategory,
): TargetValueMetric[] {
  // [변경: 2026-01-08 13:23, 김병현 수정] MetricCategory enum을 string으로 변환하는 헬퍼 함수
  const categoryToString = (category: MetricCategory): string => {
    switch (category) {
      case MetricCategory.CODE_QUALITY:
        return "quality";
      case MetricCategory.REVIEW_QUALITY:
        return "review";
      case MetricCategory.DEVELOPMENT_EFFICIENCY:
        return "efficiency";
      default:
        return "quality";
    }
  };

  // MetricItem을 TargetValueMetric으로 변환
  let metrics = metricsListData.metrics.map((metricItem) => ({
    metricName: metricItem.name,
    category: categoryToString(metricItem.category),
    targetValue: metricItem.targetValue,
    unit: metricItem.unit,
    metricCode: metricItem.metricCode,
  }));

  // targetCategory가 지정된 경우 해당 범주만 필터링
  if (targetCategory) {
    const targetCategoryString = categoryToString(targetCategory);
    metrics = metrics.filter((m) => m.category === targetCategoryString);
  }

  return metrics;
}
