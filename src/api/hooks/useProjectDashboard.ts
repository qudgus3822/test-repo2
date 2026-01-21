import { useQuery } from "@tanstack/react-query";
import { fetchProjectDashboard } from "@/api/projects";
import type {
  ProjectDashboardResponse,
  ProjectDashboardParams,
} from "@/types/project.types";

// Query Keys
export const projectDashboardKeys = {
  all: ["projectDashboard"] as const,
  list: (params: ProjectDashboardParams) =>
    [...projectDashboardKeys.all, "list", params] as const,
};

/**
 * 프로젝트 대시보드 목록 데이터 조회
 * @param {ProjectDashboardParams} params - 조회 파라미터
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useProjectDashboard = (
  params: ProjectDashboardParams,
  enabled: boolean = true,
) => {
  return useQuery<ProjectDashboardResponse, Error>({
    queryKey: projectDashboardKeys.list(params),
    queryFn: () => fetchProjectDashboard(params),
    enabled: enabled && !!params.month,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
