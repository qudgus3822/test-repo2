import { useQuery } from "@tanstack/react-query";
import { fetchMetricsPreview } from "@/api/metrics";
import type { MetricsListData } from "@/types/metrics.types";

// Query Keys
export const metricsPreviewKeys = {
  all: ["metricsPreview"] as const,
};

/**
 * 지표 기준 설정 미리보기 조회 Hook
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useMetricsPreview = (enabled: boolean = true) => {
  return useQuery<MetricsListData, Error>({
    queryKey: metricsPreviewKeys.all,
    queryFn: fetchMetricsPreview,
    enabled,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
