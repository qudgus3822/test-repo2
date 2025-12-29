import type {
  QualityMetricChartData,
  ProjectMetricsRequest,
  Project,
  Repository,
  Developer,
} from "@/types/quality-metric";
import { apiGet } from "@/libs/fetch";

/**
 * 프로젝트 메트릭 조회
 * @param {ProjectMetricsRequest} request - 프로젝트 메트릭 요청 파라미터
 * @returns {Promise<QualityMetricChartData[]>} 품질 메트릭 차트 데이터 배열
 * @throws {Error} 메트릭 조회 실패 시 에러
 */
export const fetchProjectMetrics = async (
  request: ProjectMetricsRequest
): Promise<QualityMetricChartData[]> => {
  const params = new URLSearchParams({
    projectId: request.projectId,
    metricType: request.metricType,
    ...(request.startDate && { startDate: request.startDate.toISOString() }),
    ...(request.endDate && { endDate: request.endDate.toISOString() }),
    ...(request.branch && { branch: request.branch }),
  });

  const data = await apiGet<(Omit<QualityMetricChartData, 'measurementDate'> & { measurementDate: string })[]>(
    `/quality-metrics/project?${params}`
  );

  // Date 필드 변환
  return data.map((item) => ({
    ...item,
    measurementDate: new Date(item.measurementDate),
  }));
};

/**
 * 프로젝트 목록 조회
 * @returns {Promise<Project[]>} 프로젝트 목록
 * @throws {Error} 프로젝트 목록 조회 실패 시 에러
 */
export const fetchProjects = async (): Promise<Project[]> => {
  return apiGet<Project[]>("/projects");
};

/**
 * 저장소 목록 조회
 * @param {string} projectId - 프로젝트 ID
 * @returns {Promise<Repository[]>} 저장소 목록
 * @throws {Error} 저장소 목록 조회 실패 시 에러
 */
export const fetchRepositories = async (projectId: string): Promise<Repository[]> => {
  return apiGet<Repository[]>(`/repositories?projectId=${projectId}`);
};

/**
 * 개발자 목록 조회
 * @returns {Promise<Developer[]>} 개발자 목록
 * @throws {Error} 개발자 목록 조회 실패 시 에러
 */
export const fetchDevelopers = async (): Promise<Developer[]> => {
  return apiGet<Developer[]>("/developers");
};
