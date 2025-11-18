import { useQuery } from "@tanstack/react-query";
import { fetchGoalAchievement } from "@/api/dashboard";
import type { GoalAchievementRate } from "@/types/goalAchievement.types";

// Query Keys
export const goalAchievementKeys = {
  all: ["goalAchievement"] as const,
  detail: (month: string) =>
    [...goalAchievementKeys.all, "detail", month] as const,
};

/**
 * 목표 달성률 조회
 * @param {string} month - YYYY-MM 형식의 월
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useGoalAchievement = (month: string, enabled: boolean = true) => {
  return useQuery<GoalAchievementRate, Error>({
    queryKey: goalAchievementKeys.detail(month),
    queryFn: () => fetchGoalAchievement(month),
    enabled: enabled && !!month,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
