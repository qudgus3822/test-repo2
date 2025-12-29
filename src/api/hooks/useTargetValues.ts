import { useQuery } from "@tanstack/react-query";
import { fetchTargetValues } from "@/api/metrics";
import type { TargetValuesResponse } from "@/types/metrics.types";

// Query Keys
export const targetValuesKeys = {
  all: ["targetValues"] as const,
  byParams: (category: string, month: string) =>
    [...targetValuesKeys.all, category, month] as const,
};

/**
 * 목표값 조회 Hook
 * @param category - 범주 (quality | review | efficiency)
 * @param month - 조회 연월 (YYYY-MM 형식)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useTargetValues = (
  category: string,
  month: string,
  enabled: boolean = true,
) => {
  return useQuery<TargetValuesResponse, Error>({
    queryKey: targetValuesKeys.byParams(category, month),
    queryFn: () => fetchTargetValues(category, month),
    enabled: enabled && !!category && !!month,
    staleTime: 5 * 60 * 1000, // 5분
  });
};
