import { create } from "zustand";
import type { PeriodType } from "@/components/ui/DateFilter";
import type { MetricItem } from "@/types/metrics.types";
import type { AchievementRateFilterType } from "@/components/ui/AchievementRateFilter";
import type { TabType } from "@/types/organization.types";

// 달성률 기본값 상수
export const DEFAULT_EXCELLENT_THRESHOLD = 80;
export const DEFAULT_DANGER_THRESHOLD = 70;

// TabType을 re-export (하위 호환성)
export type { TabType } from "@/types/organization.types";

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
   * 비율 설정 모달이 열려있는지 여부입니다.
   */
  isMetricRateSettingModalOpen: boolean;
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
  /**
   * 목표값 / 달성률 / 비율 설정에서 변경사항이 있는지 여부입니다. (변경사항 반영 버튼 활성화 여부)
   */
  isSettingsChanged: boolean;
  /**
   * 변경사항 반영 확인 모달이 열려있는지 여부입니다.
   */
  isSettingsChangeConfirmModalOpen: boolean;
  /**
   * 변경사항 초기화 확인 모달이 열려있는지 여부입니다.
   */
  isSettingsResetConfirmModalOpen: boolean;
  /**
   * 지표 기준 설정 모달이 열려있는지 여부입니다.
   */
  isMetricStandardSettingModalOpen: boolean;
  /**
   * 변경된 목표값 개수입니다.
   */
  changedTargetValueCount: number;
  /**
   * 변경된 달성률 개수입니다.
   */
  changedAchievementRateCount: number;
  /**
   * 변경된 비율설정 개수입니다. (코드품질, 리뷰품질, 개발효율)
   */
  changedRatioCount: {
    codeQuality: number;
    reviewQuality: number;
    developmentEfficiency: number;
  };
  /**
   * 집계 진행 중 여부입니다.
   */
  isAggregating: boolean;
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
   * 비율 설정 모달을 엽니다.
   */
  setIsMetricRateSettingModalOpen: (
    isMetricRateSettingModalOpen: boolean,
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
  /**
   * 변경사항이 있는지 여부를 설정합니다.
   */
  setIsSettingsChanged: (isSettingsChanged: boolean) => void;
  /**
   * 변경사항 반영 확인 모달을 엽니다.
   */
  setIsSettingsChangeConfirmModalOpen: (
    isSettingsChangeConfirmModalOpen: boolean,
  ) => void;
  /**
   * 변경사항 초기화 확인 모달을 엽니다.
   */
  setIsSettingsResetConfirmModalOpen: (
    isSettingsResetConfirmModalOpen: boolean,
  ) => void;
  /**
   * 지표 기준 설정 모달을 엽니다.
   */
  setIsMetricStandardSettingModalOpen: (
    isMetricStandardSettingModalOpen: boolean,
  ) => void;
  /**
   * 변경된 목표값 개수를 설정합니다.
   */
  setChangedTargetValueCount: (count: number) => void;
  /**
   * 변경된 달성률 개수를 설정합니다.
   */
  setChangedAchievementRateCount: (count: number) => void;
  /**
   * 변경된 비율설정 개수를 설정합니다.
   */
  setChangedRatioCount: (ratioCount: {
    codeQuality: number;
    reviewQuality: number;
    developmentEfficiency: number;
  }) => void;
  /**
   * 집계 진행 중 여부를 설정합니다.
   */
  setIsAggregating: (isAggregating: boolean) => void;
}

const initState: MetricsStore = {
  period: "monthly",
  currentDate: new Date(),
  activeTab: "bdpi",
  achievementRateFilter: "all",
  isTargetValueSettingModalOpen: false,
  isAchievementRateSettingModalOpen: false,
  isMetricRateSettingModalOpen: false,
  achievementRateExcellentThreshold: DEFAULT_EXCELLENT_THRESHOLD,
  achievementRateWarningThreshold: 0,
  achievementRateDangerThreshold: DEFAULT_DANGER_THRESHOLD,
  isMetricsDetailModalOpen: false,
  selectedMetric: null,
  isSettingsChanged: false,
  isSettingsChangeConfirmModalOpen: false,
  isSettingsResetConfirmModalOpen: false,
  isMetricStandardSettingModalOpen: false,
  changedTargetValueCount: 0,
  changedAchievementRateCount: 0,
  changedRatioCount: {
    codeQuality: 0,
    reviewQuality: 0,
    developmentEfficiency: 0,
  },
  isAggregating: false,
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
  setIsMetricRateSettingModalOpen: (isMetricRateSettingModalOpen: boolean) =>
    set({ isMetricRateSettingModalOpen }),
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
  setIsSettingsChanged: (isSettingsChanged: boolean) =>
    set({ isSettingsChanged }),
  setIsSettingsChangeConfirmModalOpen: (
    isSettingsChangeConfirmModalOpen: boolean,
  ) => set({ isSettingsChangeConfirmModalOpen }),
  setIsSettingsResetConfirmModalOpen: (
    isSettingsResetConfirmModalOpen: boolean,
  ) => set({ isSettingsResetConfirmModalOpen }),
  setIsMetricStandardSettingModalOpen: (
    isMetricStandardSettingModalOpen: boolean,
  ) => set({ isMetricStandardSettingModalOpen }),
  setChangedTargetValueCount: (count: number) =>
    set({ changedTargetValueCount: count }),
  setChangedAchievementRateCount: (count: number) =>
    set({ changedAchievementRateCount: count }),
  setChangedRatioCount: (ratioCount: {
    codeQuality: number;
    reviewQuality: number;
    developmentEfficiency: number;
  }) => set({ changedRatioCount: ratioCount }),
  setIsAggregating: (isAggregating: boolean) => set({ isAggregating }),
}));
