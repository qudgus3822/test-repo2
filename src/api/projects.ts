import type {
  ProjectDashboardSummary,
  ProjectDashboardResponse,
  ProjectDashboardParams,
} from "@/types/project.types";
import { apiGet } from "@/libs/fetch";

/**
 * 프로젝트 대시보드 요약 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @returns {Promise<ProjectDashboardSummary>} 프로젝트 대시보드 요약 데이터
 * @throws {Error} 데이터 조회 실패 시 에러
 */
export const fetchProjectDashboardSummary = async (
  month: string,
): Promise<ProjectDashboardSummary> => {
  return apiGet<ProjectDashboardSummary>(
    `/projects/dashboard/summary?month=${month}`,
  );
};

/**
 * 프로젝트 대시보드 목록 조회
 * @param {ProjectDashboardParams} params - 조회 파라미터
 * @returns {Promise<ProjectDashboardResponse>} 프로젝트 목록 데이터
 * @throws {Error} 데이터 조회 실패 시 에러
 */
export const fetchProjectDashboard = async (
  params: ProjectDashboardParams,
): Promise<ProjectDashboardResponse> => {
  const queryParams = new URLSearchParams({ month: params.month });

  if (params.classification) {
    queryParams.set("classification", params.classification);
  }
  if (params.search) {
    queryParams.set("search", params.search);
  }
  if (params.page !== undefined) {
    queryParams.set("page", String(params.page));
  }
  if (params.limit !== undefined) {
    queryParams.set("limit", String(params.limit));
  }

  return apiGet<ProjectDashboardResponse>(
    `/projects/dashboard?${queryParams.toString()}`,
  );
};
