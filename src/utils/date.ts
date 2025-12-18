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
 * @param dateString - 변환할 날짜 문자열 (YYYY-MM-DD 또는 ISO 8601 형식)
 * @param separator - 구분자 (기본값: ".")
 * @returns 변환된 날짜 문자열 (예: "2025.01.15")
 *
 * @example
 * ```typescript
 * import { formatDateString } from "@/utils/date";
 *
 * formatDateString("2025-01-15");                    // Returns: "2025.01.15"
 * formatDateString("2025-01-15T09:00:00.000Z");      // Returns: "2025.01.15"
 * formatDateString("2025-01-15", "/");               // Returns: "2025/01/15"
 * formatDateString("2025-01-15", "-");               // Returns: "2025-01-15"
 * ```
 */
export const formatDateString = (
  dateString: string,
  separator: string = "."
): string => {
  if (!dateString) return "";
  // ISO 8601 형식 처리: "T" 이전 부분만 사용
  const datePart = dateString.split("T")[0];
  const [year, month, day] = datePart.split("-");
  return `${year}${separator}${month}${separator}${day}`;
};

/**
 * ISO 날짜 문자열을 YYYY.MM.DD HH:mm 형식으로 변환합니다.
 *
 * @param isoDate - ISO 8601 형식의 날짜 문자열 (예: "2025-12-15T09:25:00.005Z")
 * @param fallback - 날짜가 없을 때 반환할 기본값 (기본값: "-")
 * @returns YYYY.MM.DD HH:mm 형식의 문자열 (예: "2025.12.15 09:25")
 *
 * @example
 * ```typescript
 * import { formatDisplayDateTime } from "@/utils/date";
 *
 * formatDisplayDateTime("2025-12-15T09:25:00.005Z");  // Returns: "2025.12.15 18:25" (로컬 시간)
 * formatDisplayDateTime(undefined);                    // Returns: "-"
 * formatDisplayDateTime(null, "N/A");                 // Returns: "N/A"
 * ```
 */
export const formatDisplayDateTime = (
  isoDate?: string | null,
  fallback: string = "-"
): string => {
  if (!isoDate) return fallback;
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};
