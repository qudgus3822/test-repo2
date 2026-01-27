import { useQuery } from "@tanstack/react-query";
import { fetchSyncStatus } from "@/api/metrics";
import type { SyncStatusResponse } from "@/types/metrics.types";

// Query Keys
export const syncStatusKeys = {
  all: ["syncStatus"] as const,
};

// Polling 간격 (1초)
const POLLING_INTERVAL = 0.5 * 1000;

/**
 * 지표 설정 동기화 상태 조회 Hook (10초 폴링)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체 (data, isLoading 등)
 */
export const useSyncStatus = (enabled: boolean = true) => {
  const query = useQuery<SyncStatusResponse, Error>({
    queryKey: syncStatusKeys.all,
    queryFn: fetchSyncStatus,
    enabled,
    refetchInterval: POLLING_INTERVAL, // 10초마다 폴링
    staleTime: 0, // 항상 최신 데이터 조회
  });

  // 집계 진행 중 여부 (processing 상태일 때 true)
  const isProcessing = query.data?.status === "processing";

  return {
    ...query,
    isProcessing,
  };
};
