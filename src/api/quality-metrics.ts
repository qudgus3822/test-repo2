import type {
  QualityMetricChartData,
  ProjectMetricsRequest,
  Project,
  Repository,
  Developer,
} from "@/types/quality-metric";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

/**
 * 프로젝트 메트릭 조회
 * @param {ProjectMetricsRequest} request - 프로젝트 메트릭 요청 파라미터
 * @returns {Promise<QualityMetricChartData[]>} 품질 메트릭 차트 데이터 배열
 * @throws {Error} 메트릭 조회 실패 시 에러
 */
export const fetchProjectMetrics = async (
  request: ProjectMetricsRequest
): Promise<QualityMetricChartData[]> => {
  try {
    const params = new URLSearchParams({
      projectId: request.projectId,
      metricType: request.metricType,
      ...(request.startDate && { startDate: request.startDate.toISOString() }),
      ...(request.endDate && { endDate: request.endDate.toISOString() }),
      ...(request.branch && { branch: request.branch }),
    });

    const response = await fetch(`${API_BASE_URL}/quality-metrics/project?${params}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("프로젝트 메트릭 조회 실패");
    }

    const data = await response.json();

    // Date 필드 변환
    return data.map((item: any) => ({
      ...item,
      measurementDate: new Date(item.measurementDate),
    }));
  } catch (error) {
    console.error("프로젝트 메트릭 조회 실패:", error);
    throw error;
  }
};

/**
 * 프로젝트 목록 조회
 * @returns {Promise<Project[]>} 프로젝트 목록
 * @throws {Error} 프로젝트 목록 조회 실패 시 에러
 */
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("프로젝트 목록 조회 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("프로젝트 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 저장소 목록 조회
 * @param {string} projectId - 프로젝트 ID
 * @returns {Promise<Repository[]>} 저장소 목록
 * @throws {Error} 저장소 목록 조회 실패 시 에러
 */
export const fetchRepositories = async (projectId: string): Promise<Repository[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/repositories?projectId=${projectId}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("저장소 목록 조회 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("저장소 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 개발자 목록 조회
 * @returns {Promise<Developer[]>} 개발자 목록
 * @throws {Error} 개발자 목록 조회 실패 시 에러
 */
export const fetchDevelopers = async (): Promise<Developer[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/developers`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("개발자 목록 조회 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("개발자 목록 조회 실패:", error);
    throw error;
  }
};
