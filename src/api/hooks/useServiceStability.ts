import { useQuery } from "@tanstack/react-query";
import { fetchServiceStability } from "@/api/dashboard";
import type { ServiceStabilityMetrics } from "@/types/serviceStability.types";

// Query Keys
export const serviceStabilityKeys = {
  all: ["serviceStability"] as const,
  detail: (month: string) =>
    [...serviceStabilityKeys.all, "detail", month] as const,
};

/**
 * 서비스 안정성 메트릭 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useServiceStability = (month: string, enabled: boolean = true) => {
  return useQuery<ServiceStabilityMetrics, Error>({
    queryKey: serviceStabilityKeys.detail(month),
    queryFn: () => fetchServiceStability(month),
    enabled: enabled && !!month,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
