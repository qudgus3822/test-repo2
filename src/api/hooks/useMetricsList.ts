import { useQuery } from "@tanstack/react-query";
import { fetchMetricsList } from "@/api/metrics";
import type { MetricsListData } from "@/types/metrics.types";

// Query Keys
export const metricsListKeys = {
  all: ["metricsList"] as const,
  byMonth: (month: string) => [...metricsListKeys.all, month] as const,
};

/**
 * 지표 리스트 조회 Hook
 * @param month - 조회 연월 (YYYY-MM 형식)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useMetricsList = (month: string, enabled: boolean = true) => {
  return useQuery<MetricsListData, Error>({
    queryKey: metricsListKeys.byMonth(month),
    queryFn: async () => {
      return fetchMetricsList(month);
    },
    enabled: enabled && !!month,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
