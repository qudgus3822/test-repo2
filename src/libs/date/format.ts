/**
 * 날짜 포맷팅 유틸리티 모듈
 * 다양한 날짜 포맷을 제공하는 재사용 가능한 함수들
 */

/**
 * 한국 로케일 날짜 포맷 옵션
 */
export const KOREAN_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

/**
 * 한국 로케일 시간 포맷 옵션
 */
export const KOREAN_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

/**
 * 날짜를 한국 형식으로 포맷팅
 * @param date - 포맷팅할 Date 객체 (기본값: 현재 시간)
 * @returns "2024년 1월 15일" 형식의 문자열
 * @example
 * formatKoreanDate() // "2024년 1월 15일"
 * formatKoreanDate(new Date('2024-12-25')) // "2024년 12월 25일"
 */
export function formatKoreanDate(date: Date = new Date()): string {
  return date.toLocaleDateString("ko-KR", KOREAN_DATE_FORMAT);
}

/**
 * 시간을 한국 형식으로 포맷팅
 * @param date - 포맷팅할 Date 객체 (기본값: 현재 시간)
 * @returns "오후 2:30" 형식의 문자열
 * @example
 * formatKoreanTime() // "오후 2:30"
 * formatKoreanTime(new Date('2024-01-15T14:30:00')) // "오후 2:30"
 */
export function formatKoreanTime(date: Date = new Date()): string {
  return date.toLocaleTimeString("ko-KR", KOREAN_TIME_FORMAT);
}

/**
 * 날짜와 시간을 한국 형식으로 포맷팅
 * @param date - 포맷팅할 Date 객체 (기본값: 현재 시간)
 * @returns "2024년 1월 15일 오후 2:30" 형식의 문자열
 * @example
 * formatKoreanDateTime() // "2024년 1월 15일 오후 2:30"
 * formatKoreanDateTime(new Date('2024-12-25T14:30:00')) // "2024년 12월 25일 오후 2:30"
 */
export function formatKoreanDateTime(date: Date = new Date()): string {
  const dateStr = formatKoreanDate(date);
  const timeStr = formatKoreanTime(date);
  return `${dateStr} ${timeStr}`;
}
