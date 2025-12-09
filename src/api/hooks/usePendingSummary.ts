import { useQuery } from "@tanstack/react-query";
import { fetchPendingSummary } from "@/api/metrics";
import type { PendingSummaryResponse } from "@/types/metrics.types";

// Query Keys
export const pendingSummaryKeys = {
  all: ["pendingSummary"] as const,
};

/**
 * 변경내역 조회 Hook (Pending Summary)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const usePendingSummary = (enabled: boolean = true) => {
  return useQuery<PendingSummaryResponse, Error>({
    queryKey: pendingSummaryKeys.all,
    queryFn: fetchPendingSummary,
    enabled,
    staleTime: 0, // 항상 최신 데이터 조회
  });
};
