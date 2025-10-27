import { useQuery } from "@tanstack/react-query";
import {
  fetchProjectMetrics,
  fetchProjects,
  fetchRepositories,
  fetchDevelopers,
} from "@/api/quality-metrics";
import type {
  ProjectMetricsRequest,
  QualityMetricChartData,
  Project,
  Repository,
  Developer,
} from "@/types/quality-metric";

// Query Keys
export const qualityMetricsKeys = {
  all: ["qualityMetrics"] as const,
  projects: () => [...qualityMetricsKeys.all, "projects"] as const,
  project: (filters: ProjectMetricsRequest) =>
    [...qualityMetricsKeys.all, "project", filters] as const,
  repositories: (projectId: string) =>
    [...qualityMetricsKeys.all, "repositories", projectId] as const,
  developers: () => [...qualityMetricsKeys.all, "developers"] as const,
};

/**
 * 프로젝트 메트릭 조회
 * @param {ProjectMetricsRequest} request - 프로젝트 메트릭 요청 파라미터
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useProjectMetrics = (
  request: ProjectMetricsRequest,
  enabled: boolean = true
) => {
  return useQuery<QualityMetricChartData[], Error>({
    queryKey: qualityMetricsKeys.project(request),
    queryFn: () => fetchProjectMetrics(request),
    enabled: enabled && !!request.projectId,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * 프로젝트 목록 조회
 * @returns React Query 결과 객체
 */
export const useProjects = () => {
  return useQuery<Project[], Error>({
    queryKey: qualityMetricsKeys.projects(),
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 저장소 목록 조회
 * @param {string} projectId - 프로젝트 ID
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useRepositories = (projectId: string, enabled: boolean = true) => {
  return useQuery<Repository[], Error>({
    queryKey: qualityMetricsKeys.repositories(projectId),
    queryFn: () => fetchRepositories(projectId),
    enabled: enabled && !!projectId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 개발자 목록 조회
 * @returns React Query 결과 객체
 */
export const useDevelopers = () => {
  return useQuery<Developer[], Error>({
    queryKey: qualityMetricsKeys.developers(),
    queryFn: fetchDevelopers,
    staleTime: 5 * 60 * 1000, // 5분
  });
};
