import { create } from "zustand";
import type { PeriodType } from "@/components/ui/DateFilter";

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
   * 코드 리뷰 현황 팝업 열림 상태입니다.
   */
  isCodeReviewModalOpen: boolean;
  /**
   * 조직도 변경 히스토리 팝업 열림 상태입니다.
   */
  isOrgHistoryModalOpen: boolean;
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
   * 코드 리뷰 현황 팝업을 엽니다.
   */
  setCodeReviewModal: (isCodeReviewModalOpen: boolean) => void;
  /**
   * 조직도 변경 히스토리 팝업을
   */
  setOrgHistoryModal: (isOrgHistoryModalOpen: boolean) => void;
}

const initState: DashboardStore = {
  period: "monthly",
  currentDate: new Date(),
  isCodeReviewModalOpen: false,
  isOrgHistoryModalOpen: false,
};

export const useDashboardStore = create<DashboardStore & DashboardAction>(
  (set) => ({
    ...initState,
    setPeriod: (period: PeriodType) => set({ period }),
    setCurrentDate: (date: Date) => set({ currentDate: date }),
    setCodeReviewModal: (isCodeReviewModalOpen: boolean) =>
      set({ isCodeReviewModalOpen }),
    setOrgHistoryModal: (isOrgHistoryModalOpen: boolean) =>
      set({ isOrgHistoryModalOpen }),
  }),
);
