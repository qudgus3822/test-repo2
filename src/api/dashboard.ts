import type { CompanyQualityMetrics } from "@/types/companyQuality.types";
import type { ServiceStabilityMetrics } from "@/types/serviceStability.types";
import type { ProductionTrendResponse } from "@/types/productionTrend.types";
import type { GoalAchievementRate } from "@/types/goalAchievement.types";
import type { MetricRankings } from "@/types/metricRankings.types";
import { env } from "@/env";

/**
 * 전사 BDPI 대시보드 데이터 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @returns {Promise<CompanyQualityMetrics>} 전사 BDPI 데이터
 * @throws {Error} 데이터 조회 실패 시 에러
 */
export const fetchCompanyQuality = async (
  month: string,
): Promise<CompanyQualityMetrics> => {
  try {
    const response = await fetch(
      `${env.apiBaseUrl}/dashboard/company-quality?month=${month}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error("전사 BDPI 조회 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("전사 BDPI 조회 실패:", error);
    throw error;
  }
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
  try {
    const response = await fetch(
      `${env.apiBaseUrl}/dashboard/service-stability?month=${month}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error("서비스 안정성 메트릭 조회 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("서비스 안정성 메트릭 조회 실패:", error);
    throw error;
  }
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
  try {
    const response = await fetch(
      `${env.apiBaseUrl}/dashboard/developer-productivity?month=${month}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error("개발 생산성 트렌드 조회 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("개발 생산성 트렌드 조회 실패:", error);
    throw error;
  }
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
  try {
    const response = await fetch(
      `${env.apiBaseUrl}/dashboard/goal-achievement?month=${month}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error("목표 달성률 조회 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("목표 달성률 조회 실패:", error);
    throw error;
  }
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
  try {
    const response = await fetch(
      `${env.apiBaseUrl}/dashboard/metric-rankings?month=${month}&type=${type}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error("지표 순위 조회 실패");
    }

    return await response.json();
  } catch (error) {
    console.error("지표 순위 조회 실패:", error);
    throw error;
  }
};
