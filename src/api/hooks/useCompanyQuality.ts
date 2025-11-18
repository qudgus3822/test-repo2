import { useQuery } from "@tanstack/react-query";
import { fetchCompanyQuality } from "@/api/dashboard";
import type { CompanyQualityMetrics } from "@/types/companyQuality.types";

// Query Keys
export const companyQualityKeys = {
  all: ["companyQuality"] as const,
  detail: (month: string) =>
    [...companyQualityKeys.all, "detail", month] as const,
};

/**
 * 전사 BDPI 데이터 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useCompanyQuality = (month: string, enabled: boolean = true) => {
  return useQuery<CompanyQualityMetrics, Error>({
    queryKey: companyQualityKeys.detail(month),
    queryFn: () => fetchCompanyQuality(month),
    enabled: enabled && !!month,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
