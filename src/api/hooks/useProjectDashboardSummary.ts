import { useQuery } from "@tanstack/react-query";
import { fetchProjectDashboardSummary } from "@/api/projects";
import type { ProjectDashboardSummary } from "@/types/project.types";

// Query Keys
export const projectDashboardSummaryKeys = {
  all: ["projectDashboardSummary"] as const,
  detail: (month: string) =>
    [...projectDashboardSummaryKeys.all, "detail", month] as const,
};

/**
 * 프로젝트 대시보드 요약 데이터 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useProjectDashboardSummary = (
  month: string,
  enabled: boolean = true,
) => {
  return useQuery<ProjectDashboardSummary, Error>({
    queryKey: projectDashboardSummaryKeys.detail(month),
    queryFn: () => fetchProjectDashboardSummary(month),
    enabled: enabled && !!month,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
