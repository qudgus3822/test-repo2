import { create } from "zustand";
import type { PeriodType } from "@/components/ui/DateFilter";

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
   * 목표값 설정 모달이 열려있는지 여부입니다.
   */
  isTargetValueSettingModalOpen: boolean;
  /**
   * 달성률 설정 모달이 열려있는지 여부입니다.
   */
  isAchievementRateSettingModalOpen: boolean;
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
}

const initState: MetricsStore = {
  period: "monthly",
  currentDate: new Date(),
  activeTab: "all",
  isTargetValueSettingModalOpen: false,
  isAchievementRateSettingModalOpen: false,
};

export const useMetricsStore = create<MetricsStore & MetricsAction>((set) => ({
  ...initState,
  setPeriod: (period: PeriodType) => set({ period }),
  setCurrentDate: (date: Date) => set({ currentDate: date }),
  setActiveTab: (tab: TabType) => set({ activeTab: tab }),
  setIsTargetValueSettingModalOpen: (isTargetValueSettingModalOpen: boolean) =>
    set({ isTargetValueSettingModalOpen }),
  setIsAchievementRateSettingModalOpen: (
    isAchievementRateSettingModalOpen: boolean,
  ) => set({ isAchievementRateSettingModalOpen }),
}));
