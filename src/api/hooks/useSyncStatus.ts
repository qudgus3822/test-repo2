import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchSyncStatus } from "@/api/metrics";
import type { SyncStatusResponse } from "@/types/metrics.types";

// Query Keys
export const syncStatusKeys = {
  all: ["syncStatus"] as const,
};

// Polling 간격 (0.5초) - 집계가 보통 3초 내 완료되므로 빠른 감지 필요
const POLLING_INTERVAL = 0.5 * 1000;

/**
 * 지표 설정 동기화 상태 조회 Hook (0.5초 폴링)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체 (data, isLoading 등)
 */
export const useSyncStatus = (enabled: boolean = true) => {
  const queryClient = useQueryClient();

  // [변경: 2026-01-27 15:35, 김병현 수정] notifyOnChangeProps 추가하여 data 변경 시에만 리렌더링
  const query = useQuery<SyncStatusResponse, Error>({
    queryKey: syncStatusKeys.all,
    queryFn: fetchSyncStatus,
    enabled,
    refetchInterval: POLLING_INTERVAL, // 0.5초마다 폴링
    staleTime: 0, // 항상 최신 데이터 조회
    notifyOnChangeProps: ["data", "error", "isLoading"], // data, error, isLoading 변경 시에만 리렌더링
  });

  // 집계 진행 중 여부 (processing 상태일 때 true)
  const isProcessing = query.data?.status === "processing";

  // [변경: 2026-01-27 16:30, 김병현 수정] 강제로 processing 상태로 설정하는 함수
  // 집계가 폴링 주기보다 빠르게 완료될 때 상태 변화 감지를 위해 사용
  const setProcessing = useCallback(() => {
    queryClient.setQueryData<SyncStatusResponse>(syncStatusKeys.all, {
      status: "processing",
    });
  }, [queryClient]);

  return {
    ...query,
    isProcessing,
    setProcessing,
  };
};
