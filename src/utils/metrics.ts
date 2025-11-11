import { MetricCategory } from "@/types/metrics.types";

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
