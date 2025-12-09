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

/**
 * 날짜 문자열을 지정된 형식으로 변환합니다.
 *
 * @param dateString - 변환할 날짜 문자열 (YYYY-MM-DD 형식)
 * @param separator - 구분자 (기본값: ".")
 * @returns 변환된 날짜 문자열 (예: "2025.01.15")
 *
 * @example
 * ```typescript
 * import { formatDateString } from "@/utils/date";
 *
 * formatDateString("2025-01-15");       // Returns: "2025.01.15"
 * formatDateString("2025-01-15", "/");  // Returns: "2025/01/15"
 * formatDateString("2025-01-15", "-");  // Returns: "2025-01-15"
 * ```
 */
export const formatDateString = (
  dateString: string,
  separator: string = "."
): string => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${year}${separator}${month}${separator}${day}`;
};
