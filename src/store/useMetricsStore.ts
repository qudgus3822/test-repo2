import { create } from "zustand";
import type { PeriodType } from "@/components/ui/DateFilter";
import type { MetricItem } from "@/types/metrics.types";
import type { AchievementRateFilterType } from "@/components/ui/AchievementRateFilter";

// 달성률 기본값 상수
export const DEFAULT_EXCELLENT_THRESHOLD = 80;
export const DEFAULT_DANGER_THRESHOLD = 70;

export type TabType =
  | "all"
  | "codeQuality"
  | "reviewQuality"
  | "developmentEfficiency";

interface MetricsStore {
  /**
   * 기간 유형입니다. (월별/분기별/반기별)
   */
  period: PeriodType;
  /**
   * 현재 선택된 날짜입니다.
   */
  currentDate: Date;
  /**
   * 활성 탭입니다.
   */
  activeTab: TabType;
  /**
   * 달성률 필터입니다.
   */
  achievementRateFilter: AchievementRateFilterType;
  /**
   * 목표값 설정 모달이 열려있는지 여부입니다.
   */
  isTargetValueSettingModalOpen: boolean;
  /**
   * 달성률 설정 모달이 열려있는지 여부입니다.
   */
  isAchievementRateSettingModalOpen: boolean;
  /**
   * 달성률 우수 기준값입니다.
   */
  achievementRateExcellentThreshold: number;
  /**
   * 달성률 경고 기준값입니다.
   */
  achievementRateWarningThreshold: number;
  /**
   * 달성률 위험 기준값입니다.
   */
  achievementRateDangerThreshold: number;
  /**
   * 지표 상세 모달이 열려있는지 여부입니다.
   */
  isMetricsDetailModalOpen: boolean;
  /**
   * 선택된 지표입니다.
   */
  selectedMetric: MetricItem | null;
}

interface MetricsAction {
  /**
   * 기간 유형을 설정합니다.
   */
  setPeriod: (period: PeriodType) => void;
  /**
   * 현재 선택된 날짜를 설정합니다.
   */
  setCurrentDate: (date: Date) => void;
  /**
   * 활성 탭을 설정합니다.
   */
  setActiveTab: (tab: TabType) => void;
  /**
   * 달성률 필터를 설정합니다.
   */
  setAchievementRateFilter: (filter: AchievementRateFilterType) => void;
  /**
   * 목표값 설정 모달을 엽니다.
   */
  setIsTargetValueSettingModalOpen: (
    isTargetValueSettingModalOpen: boolean,
  ) => void;
  /**
   * 달성률 설정 모달을 엽니다.
   */
  setIsAchievementRateSettingModalOpen: (
    isAchievementRateSettingModalOpen: boolean,
  ) => void;
  /**
   * 달성률 우수 기준값을 설정합니다.
   */
  setAchievementRateExcellentThreshold: (threshold: number) => void;
  /**
   * 달성률 경고 기준값을 설정합니다.
   */
  setAchievementRateWarningThreshold: (threshold: number) => void;
  /**
   * 달성률 위험 기준값을 설정합니다.
   */
  setAchievementRateDangerThreshold: (threshold: number) => void;
  /**
   * 지표 상세 모달을 엽니다.
   */
  setIsMetricsDetailModalOpen: (isMetricsDetailModalOpen: boolean) => void;
  /**
   * 선택된 지표를 설정합니다.
   */
  setSelectedMetric: (metric: MetricItem | null) => void;
}

const initState: MetricsStore = {
  period: "monthly",
  currentDate: new Date(),
  activeTab: "all",
  achievementRateFilter: "all",
  isTargetValueSettingModalOpen: false,
  isAchievementRateSettingModalOpen: false,
  achievementRateExcellentThreshold: DEFAULT_EXCELLENT_THRESHOLD,
  achievementRateWarningThreshold: 0,
  achievementRateDangerThreshold: DEFAULT_DANGER_THRESHOLD,
  isMetricsDetailModalOpen: false,
  selectedMetric: null,
};

export const useMetricsStore = create<MetricsStore & MetricsAction>((set) => ({
  ...initState,
  setPeriod: (period: PeriodType) => set({ period }),
  setCurrentDate: (date: Date) => set({ currentDate: date }),
  setActiveTab: (tab: TabType) => set({ activeTab: tab }),
  setAchievementRateFilter: (filter: AchievementRateFilterType) =>
    set({ achievementRateFilter: filter }),
  setIsTargetValueSettingModalOpen: (isTargetValueSettingModalOpen: boolean) =>
    set({ isTargetValueSettingModalOpen }),
  setIsAchievementRateSettingModalOpen: (
    isAchievementRateSettingModalOpen: boolean,
  ) => set({ isAchievementRateSettingModalOpen }),
  setAchievementRateExcellentThreshold: (threshold: number) =>
    set({ achievementRateExcellentThreshold: threshold }),
  setAchievementRateWarningThreshold: (threshold: number) =>
    set({ achievementRateWarningThreshold: threshold }),
  setAchievementRateDangerThreshold: (threshold: number) =>
    set({ achievementRateDangerThreshold: threshold }),
  setIsMetricsDetailModalOpen: (isMetricsDetailModalOpen: boolean) =>
    set({ isMetricsDetailModalOpen }),
  setSelectedMetric: (metric: MetricItem | null) =>
    set({ selectedMetric: metric }),
}));
