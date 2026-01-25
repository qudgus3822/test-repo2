import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchProjectDashboard } from "@/api/projects";
import type {
  ProjectDashboardResponse,
  ProjectDashboardParams,
  ProjectDashboardItem,
} from "@/types/project.types";

/** 무한 스크롤용 파라미터 (page 제외) */
export type ProjectDashboardInfiniteParams = Omit<
  ProjectDashboardParams,
  "page"
>;

// Query Keys
export const projectDashboardKeys = {
  all: ["projectDashboard"] as const,
  list: (params: ProjectDashboardParams) =>
    [...projectDashboardKeys.all, "list", params] as const,
  infinite: (params: ProjectDashboardInfiniteParams) =>
    [...projectDashboardKeys.all, "infinite", params] as const,
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

/** 무한 스크롤 기본 페이지 크기 */
const DEFAULT_PAGE_LIMIT = 10;

/**
 * 프로젝트 대시보드 무한 스크롤 조회
 * @param {ProjectDashboardInfiniteParams} params - 조회 파라미터 (page 제외)
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query Infinite 결과 객체
 */
export const useProjectDashboardInfinite = (
  params: ProjectDashboardInfiniteParams,
  enabled: boolean = true,
) => {
  const limit = params.limit ?? DEFAULT_PAGE_LIMIT;

  return useInfiniteQuery<
    ProjectDashboardResponse,
    Error,
    { pages: ProjectDashboardResponse[]; pageParams: number[] },
    ReturnType<typeof projectDashboardKeys.infinite>,
    number
  >({
    queryKey: projectDashboardKeys.infinite(params),
    queryFn: ({ pageParam }) =>
      fetchProjectDashboard({ ...params, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: enabled && !!params.month,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * 무한 스크롤 결과에서 전체 프로젝트 목록 추출
 */
export const flattenProjectPages = (
  pages: ProjectDashboardResponse[] | undefined,
): ProjectDashboardItem[] => {
  if (!pages) return [];
  return pages.flatMap((page) => page.data);
};
