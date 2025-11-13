import { useQuery } from "@tanstack/react-query";
import {
  fetchCompanyQuality,
  fetchServiceStability,
  fetchDeveloperProductivity,
  fetchGoalAchievement,
  fetchMetricRankings,
} from "@/api/dashboard";
import type { CompanyQualityMetrics } from "@/types/companyQuality.types";
import type { ServiceStabilityMetrics } from "@/types/serviceStability.types";
import type { ProductionTrendResponse } from "@/types/productionTrend.types";
import type { GoalAchievementRate } from "@/types/goalAchievement.types";
import type { MetricRankings } from "@/types/metricRankings.types";

// Query Keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  companyQuality: (month: string) =>
    [...dashboardKeys.all, "companyQuality", month] as const,
  serviceStability: (month: string) =>
    [...dashboardKeys.all, "serviceStability", month] as const,
  developerProductivity: (month: string) =>
    [...dashboardKeys.all, "developerProductivity", month] as const,
  goalAchievement: (month: string) =>
    [...dashboardKeys.all, "goalAchievement", month] as const,
  metricRankings: (month: string, type: string) =>
    [...dashboardKeys.all, "metricRankings", month, type] as const,
};

/**
 * 전사 BDPI 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useCompanyQuality = (month: string, enabled: boolean = true) => {
  return useQuery<CompanyQualityMetrics, Error>({
    queryKey: dashboardKeys.companyQuality(month),
    queryFn: () => fetchCompanyQuality(month),
    enabled: enabled && !!month,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 서비스 안정성 메트릭 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useServiceStability = (month: string, enabled: boolean = true) => {
  return useQuery<ServiceStabilityMetrics, Error>({
    queryKey: dashboardKeys.serviceStability(month),
    queryFn: () => fetchServiceStability(month),
    enabled: enabled && !!month,
    staleTime: 5 * 60 * 1000, // 5분
  });
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
    queryKey: dashboardKeys.developerProductivity(month),
    queryFn: () => fetchDeveloperProductivity(month),
    enabled: enabled && !!month,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 목표 달성률 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useGoalAchievement = (month: string, enabled: boolean = true) => {
  return useQuery<GoalAchievementRate, Error>({
    queryKey: dashboardKeys.goalAchievement(month),
    queryFn: () => fetchGoalAchievement(month),
    enabled: enabled && !!month,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 지표 순위 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @param {string} type - 필터 타입 (all, growth, warning)
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useMetricRankings = (
  month: string,
  type: string = "all",
  enabled: boolean = true,
) => {
  return useQuery<MetricRankings, Error>({
    queryKey: dashboardKeys.metricRankings(month, type),
    queryFn: () => fetchMetricRankings(month, type),
    enabled: enabled && !!month,
    staleTime: 5 * 60 * 1000, // 5분
  });
};
