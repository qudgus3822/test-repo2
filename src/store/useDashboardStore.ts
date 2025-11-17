import { create } from "zustand";
import type { PeriodType } from "@/components/ui/DateFilter";
import type { CompanyQualityMetrics } from "@/types/companyQuality.types";
import type { ServiceStabilityMetrics } from "@/types/serviceStability.types";
import type { ProductionTrendResponse } from "@/types/productionTrend.types";
import type { GoalAchievementRate } from "@/types/goalAchievement.types";
import type { MetricRankings } from "@/types/metricRankings.types";

/**
 * 대시보드 API별 에러 타입
 */
export type DashboardErrors = {
  companyQuality: string | null;
  serviceStability: string | null;
  developerProductivity: string | null;
  goalAchievement: string | null;
  metricRankings: string | null;
};

interface DashboardStore {
  /**
   * 기간 유형입니다. (월별/분기별/반기별)
   */
  period: PeriodType;
  /**
   * 현재 선택된 날짜입니다.
   */
  currentDate: Date;
  /**
   * 전사 BDPI 데이터 입니다.
   */
  companyQualityData: CompanyQualityMetrics;
  /**
   * 서비스 안정성 데이터 입니다.
   */
  serviceStabilityData: ServiceStabilityMetrics | null;
  /**
   * 개발 생산성 트렌드 데이터 입니다.
   */
  developerProductivityData: ProductionTrendResponse | null;
  /**
   * 목표 달성률 데이터 입니다.
   */
  goalAchievementData: GoalAchievementRate | null;
  /**
   * 지표 순위 데이터 입니다.
   */
  metricRankingsData: MetricRankings | null;
  /**
   * 전체 로딩 상태입니다.
   */
  isLoading: boolean;
  /**
   * API별 에러 상태입니다.
   */
  errors: DashboardErrors;
}

interface DashboardAction {
  /**
   * 기간 유형을 설정합니다.
   */
  setPeriod: (period: PeriodType) => void;
  /**
   * 현재 선택된 날짜를 설정합니다.
   */
  setCurrentDate: (date: Date) => void;
  /**
   * 전사 BDPI 데이터를 설정합니다.
   */
  setCompanyQualityData: (companyQualityData: CompanyQualityMetrics) => void;
  /**
   * 서비스 안정성 데이터를 설정합니다.
   */
  setServiceStabilityData: (
    serviceStabilityData: ServiceStabilityMetrics | null,
  ) => void;
  /**
   * 개발 생산성 트렌드 데이터를 설정합니다.
   */
  setDeveloperProductivityData: (
    developerProductivityData: ProductionTrendResponse | null,
  ) => void;
  /**
   * 목표 달성률 데이터를 설정합니다.
   */
  setGoalAchievementData: (
    goalAchievementData: GoalAchievementRate | null,
  ) => void;
  /**
   * 지표 순위 데이터를 설정합니다.
   */
  setMetricRankingsData: (metricRankingsData: MetricRankings | null) => void;
  /**
   * 로딩 상태를 설정합니다.
   */
  setIsLoading: (isLoading: boolean) => void;
  /**
   * 특정 API의 에러를 설정합니다.
   */
  setError: (key: keyof DashboardErrors, error: string | null) => void;
  /**
   * 모든 에러를 초기화합니다.
   */
  clearErrors: () => void;
}

const initState: DashboardStore = {
  period: "monthly",
  currentDate: new Date(),
  companyQualityData: {
    month: "",
    bdpiAverage: 0,
    bdpiChange: 0,
    codeQuality: {
      score: 0,
      achievedMetrics: 0,
      totalMetrics: 0,
    },
    reviewQuality: {
      score: 0,
      achievedMetrics: 0,
      totalMetrics: 0,
    },
    developmentEfficiency: {
      score: 0,
      achievedMetrics: 0,
      totalMetrics: 0,
    },
  },
  serviceStabilityData: null,
  developerProductivityData: null,
  goalAchievementData: null,
  metricRankingsData: null,
  isLoading: false,
  errors: {
    companyQuality: null,
    serviceStability: null,
    developerProductivity: null,
    goalAchievement: null,
    metricRankings: null,
  },
};

export const useDashboardStore = create<DashboardStore & DashboardAction>(
  (set) => ({
    ...initState,
    setPeriod: (period: PeriodType) => set({ period }),
    setCurrentDate: (date: Date) => set({ currentDate: date }),
    setCompanyQualityData: (companyQualityData: CompanyQualityMetrics) =>
      set({ companyQualityData }),
    setServiceStabilityData: (
      serviceStabilityData: ServiceStabilityMetrics | null,
    ) => set({ serviceStabilityData }),
    setDeveloperProductivityData: (
      developerProductivityData: ProductionTrendResponse | null,
    ) => set({ developerProductivityData }),
    setGoalAchievementData: (goalAchievementData: GoalAchievementRate | null) =>
      set({ goalAchievementData }),
    setMetricRankingsData: (metricRankingsData: MetricRankings | null) =>
      set({ metricRankingsData }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (key: keyof DashboardErrors, error: string | null) =>
      set((state) => ({
        errors: {
          ...state.errors,
          [key]: error,
        },
      })),
    clearErrors: () =>
      set({
        errors: {
          companyQuality: null,
          serviceStability: null,
          developerProductivity: null,
          goalAchievement: null,
          metricRankings: null,
        },
      }),
  }),
);
