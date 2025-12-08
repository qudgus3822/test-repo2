/**
 * Date 객체를 YYYY-MM 형식의 문자열로 변환합니다.
 *
 * @param date - 변환할 Date 객체
 * @returns YYYY-MM 형식의 문자열 (예: "2025-01")
 *
 * @example
 * ```typescript
 * import { formatYearMonth } from "@/utils/date";
 *
 * const date = new Date(2025, 0, 15); // 2025년 1월 15일
 * const yearMonth = formatYearMonth(date);
 * // Returns: "2025-01"
 * ```
 */
export const formatYearMonth = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};
