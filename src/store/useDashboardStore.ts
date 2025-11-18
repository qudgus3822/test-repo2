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
}

const initState: DashboardStore = {
  period: "monthly",
  currentDate: new Date(),
};

export const useDashboardStore = create<DashboardStore & DashboardAction>(
  (set) => ({
    ...initState,
    setPeriod: (period: PeriodType) => set({ period }),
    setCurrentDate: (date: Date) => set({ currentDate: date }),
  }),
);
