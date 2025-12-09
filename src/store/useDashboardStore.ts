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
  openCodeReviewModal: () => void;
  /**
   * 코드 리뷰 현황 팝업을 닫습니다.
   */
  closeCodeReviewModal: () => void;
}

const initState: DashboardStore = {
  period: "monthly",
  currentDate: new Date(),
  isCodeReviewModalOpen: false,
};

export const useDashboardStore = create<DashboardStore & DashboardAction>(
  (set) => ({
    ...initState,
    setPeriod: (period: PeriodType) => set({ period }),
    setCurrentDate: (date: Date) => set({ currentDate: date }),
    openCodeReviewModal: () => set({ isCodeReviewModalOpen: true }),
    closeCodeReviewModal: () => set({ isCodeReviewModalOpen: false }),
  }),
);
