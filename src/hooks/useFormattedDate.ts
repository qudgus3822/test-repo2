import { useMemo } from "react";
import { formatKoreanDateTime, formatKoreanDate, formatKoreanTime } from "@/libs/date/format";

/**
 * 날짜 포맷 타입
 */
export type DateFormatType = "dateTime" | "date" | "time";

/**
 * useFormattedDate 옵션
 */
export interface UseFormattedDateOptions {
  /**
   * 포맷 타입
   * - "dateTime": 날짜와 시간 모두 표시 (기본값)
   * - "date": 날짜만 표시
   * - "time": 시간만 표시
   */
  format?: DateFormatType;
}

/**
 * 주어진 날짜를 한국 형식으로 포맷팅하는 커스텀 훅
 *
 * 날짜가 변경될 때만 재계산하여 성능을 최적화합니다.
 *
 * @param date - 포맷팅할 Date 객체
 * @param options - 포맷 옵션
 * @returns 한국 형식으로 포맷된 날짜/시간 문자열
 *
 * @example
 * ```tsx
 * function OrderItem({ order }) {
 *   const orderDate = useFormattedDate(order.createdAt);
 *   return <div>주문일: {orderDate}</div>; // "주문일: 2024년 1월 15일 오후 2:30"
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 날짜만 표시
 * function DateOnly({ date }) {
 *   const formattedDate = useFormattedDate(date, { format: "date" });
 *   return <div>{formattedDate}</div>; // "2024년 1월 15일"
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 시간만 표시
 * function TimeOnly({ date }) {
 *   const formattedTime = useFormattedDate(date, { format: "time" });
 *   return <div>{formattedTime}</div>; // "오후 2:30"
 * }
 * ```
 */
export function useFormattedDate(
  date: Date,
  options: UseFormattedDateOptions = {}
): string {
  const { format = "dateTime" } = options;

  const formattedDate = useMemo(() => {
    switch (format) {
      case "date":
        return formatKoreanDate(date);
      case "time":
        return formatKoreanTime(date);
      case "dateTime":
      default:
        return formatKoreanDateTime(date);
    }
  }, [date, format]);

  return formattedDate;
}
