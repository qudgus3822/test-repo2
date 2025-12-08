import type { CompanyQualityMetrics } from "@/types/companyQuality.types";
import type { ServiceStabilityMetrics } from "@/types/serviceStability.types";
import type { ProductionTrendResponse } from "@/types/productionTrend.types";
import type { GoalAchievementRate } from "@/types/goalAchievement.types";
import type { MetricRankings } from "@/types/metricRankings.types";
import { apiGet } from "@/libs/fetch";

/**
 * 전사 BDPI 대시보드 데이터 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @returns {Promise<CompanyQualityMetrics>} 전사 BDPI 데이터
 * @throws {Error} 데이터 조회 실패 시 에러
 */
export const fetchCompanyQuality = async (
  month: string,
): Promise<CompanyQualityMetrics> => {
  return apiGet<CompanyQualityMetrics>(`/dashboard/company-quality?month=${month}`);
};

/**
 * 서비스 안정성 메트릭 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @returns {Promise<ServiceStabilityMetrics>} 서비스 안정성 메트릭 데이터
 * @throws {Error} 데이터 조회 실패 시 에러
 */
export const fetchServiceStability = async (
  month: string,
): Promise<ServiceStabilityMetrics> => {
  return apiGet<ServiceStabilityMetrics>(`/dashboard/service-stability?month=${month}`);
};

/**
 * 개발 생산성 트렌드 조회 (최근 6개월)
 * @param {string} month - YYYY-MM 형식의 월
 * @returns {Promise<ProductionTrendResponse>} 개발 생산성 트렌드 데이터
 * @throws {Error} 데이터 조회 실패 시 에러
 */
export const fetchDeveloperProductivity = async (
  month: string,
): Promise<ProductionTrendResponse> => {
  return apiGet<ProductionTrendResponse>(`/dashboard/developer-productivity?month=${month}`);
};

/**
 * 목표 달성률 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @returns {Promise<GoalAchievementRate>} 목표 달성률 데이터
 * @throws {Error} 데이터 조회 실패 시 에러
 */
export const fetchGoalAchievement = async (
  month: string,
): Promise<GoalAchievementRate> => {
  return apiGet<GoalAchievementRate>(`/dashboard/goal-achievement?month=${month}`);
};

/**
 * 지표 순위 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @param {string} type - 필터 타입 (all, growth, warning)
 * @returns {Promise<MetricRankings>} 지표 순위 데이터
 * @throws {Error} 데이터 조회 실패 시 에러
 */
export const fetchMetricRankings = async (
  month: string,
  type: string = "all",
): Promise<MetricRankings> => {
  return apiGet<MetricRankings>(`/dashboard/metric-rankings?month=${month}&type=${type}`);
};
