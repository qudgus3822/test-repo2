import { useQuery } from "@tanstack/react-query";
import { fetchLastAggregatedAt } from "@/api/metrics";
import { formatKoreanDateTime } from "@/libs/date/format";

/**
 * 마지막 집계 시간을 조회하는 훅
 * API 조회 실패 시 현재 시간을 fallback으로 반환
 *
 * @returns 한국 형식으로 포맷된 마지막 집계 시간 문자열
 */
export function useLastAggregatedAt() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["lastAggregatedAt"],
    queryFn: fetchLastAggregatedAt,
    staleTime: 1000 * 60 * 5, // 5분
    retry: 3,
  });

  // API 성공 시 응답값 포맷, 실패 시 현재 시간 반환
  const formattedDate = (() => {
    if (isLoading) {
      return formatKoreanDateTime();
    }

    if (isError || !data?.lastAggregatedAt) {
      return formatKoreanDateTime();
    }

    return formatKoreanDateTime(new Date(data.lastAggregatedAt));
  })();

  return {
    formattedDate,
    isLoading,
    isError,
    rawDate: data?.lastAggregatedAt,
    refetch,
  };
}
