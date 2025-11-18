import { useQuery } from "@tanstack/react-query";
import { fetchDeveloperProductivity } from "@/api/dashboard";
import type { ProductionTrendResponse } from "@/types/productionTrend.types";

// Query Keys
export const developerProductivityKeys = {
  all: ["developerProductivity"] as const,
  detail: (month: string) =>
    [...developerProductivityKeys.all, "detail", month] as const,
};

/**
 * 개발 생산성 트렌드 조회 (최근 6개월)
 * @param {string} month - YYYY-MM 형식의 월
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useDeveloperProductivity = (
  month: string,
  enabled: boolean = true,
) => {
  return useQuery<ProductionTrendResponse, Error>({
    queryKey: developerProductivityKeys.detail(month),
    queryFn: () => fetchDeveloperProductivity(month),
    enabled: enabled && !!month,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
