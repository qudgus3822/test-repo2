import { useState, useEffect } from "react";
import { formatKoreanDateTime } from "@/libs/date/format";

/**
 * 실시간으로 업데이트되는 현재 날짜/시간을 제공하는 커스텀 훅
 *
 * @param updateInterval - 업데이트 간격 (밀리초, 기본값: 60000ms = 1분)
 * @returns 한국 형식으로 포맷된 현재 날짜/시간 문자열
 *
 * @example
 * ```tsx
 * function Header() {
 *   const currentDate = useCurrentDate();
 *   return <div>{currentDate}</div>; // "2024년 1월 15일 오후 2:30"
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 10초마다 업데이트
 * function Clock() {
 *   const currentDate = useCurrentDate(10000);
 *   return <div>{currentDate}</div>;
 * }
 * ```
 */
export function useCurrentDate(updateInterval: number = 60000): string {
  const [currentDate, setCurrentDate] = useState<string>(() =>
    formatKoreanDateTime()
  );

  useEffect(() => {
    // 컴포넌트 마운트 시 즉시 업데이트
    setCurrentDate(formatKoreanDateTime());

    // 정해진 간격마다 날짜 업데이트
    const intervalId = setInterval(() => {
      setCurrentDate(formatKoreanDateTime());
    }, updateInterval);

    // 클린업: 컴포넌트 언마운트 시 interval 제거
    return () => clearInterval(intervalId);
  }, [updateInterval]);

  return currentDate;
}
