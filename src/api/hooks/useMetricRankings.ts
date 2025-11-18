import { useQuery } from "@tanstack/react-query";
import { fetchMetricRankings } from "@/api/dashboard";
import type { MetricRankings } from "@/types/metricRankings.types";

// Query Keys
export const metricRankingsKeys = {
  all: ["metricRankings"] as const,
  detail: (month: string, type: string = "all") =>
    [...metricRankingsKeys.all, "detail", month, type] as const,
};

/**
 * 지표 순위 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @param {string} type - 필터 타입 (all, growth, warning)
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useMetricRankings = (
  month: string,
  type: string = "all",
  enabled: boolean = true,
) => {
  return useQuery<MetricRankings, Error>({
    queryKey: metricRankingsKeys.detail(month, type),
    queryFn: () => fetchMetricRankings(month, type),
    enabled: enabled && !!month,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
