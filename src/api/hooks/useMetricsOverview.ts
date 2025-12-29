import { useQuery } from "@tanstack/react-query";
import { fetchMetricsOverview } from "@/api/metrics";
import type { MetricOverview } from "@/types/metrics.types";

// Query Keys
export const metricsOverviewKeys = {
  all: ["metricsOverview"] as const,
  byMonth: (month: string) => [...metricsOverviewKeys.all, month] as const,
};

/**
 * 지표 현황 조회 Hook
 * @param month - 조회 연월 (YYYY-MM 형식)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useMetricsOverview = (month: string, enabled: boolean = true) => {
  return useQuery<MetricOverview, Error>({
    queryKey: metricsOverviewKeys.byMonth(month),
    queryFn: async () => {
      return fetchMetricsOverview(month);
    },
    enabled: enabled && !!month,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
