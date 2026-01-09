import { useQuery } from "@tanstack/react-query";
import { fetchWeightSettings } from "@/api/metrics";
import type { WeightSettingsResponse } from "@/types/metrics.types";

// Query Keys
export const weightSettingsKeys = {
  all: ["weightSettings"] as const,
  byMonth: (month: string) => [...weightSettingsKeys.all, month] as const,
};

/**
 * 비율 설정 조회 Hook
 * @param month - 조회 연월 (YYYY-MM 형식)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useWeightSettings = (month: string, enabled: boolean = true, pending : boolean = false) => {
  return useQuery<WeightSettingsResponse, Error>({
    queryKey: weightSettingsKeys.byMonth(month),
    queryFn: () => fetchWeightSettings(month, pending),
    enabled,
    staleTime: 0, // 항상 최신 데이터 조회
  });
};
