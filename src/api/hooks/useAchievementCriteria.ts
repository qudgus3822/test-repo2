import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAchievementCriteria,
  updateAchievementCriteria,
} from "@/api/metrics";
import type {
  AchievementCriteria,
  AchievementCriteriaUpdateRequest,
} from "@/types/metrics.types";

// Query Keys
export const achievementCriteriaKeys = {
  all: ["achievementCriteria"] as const,
  byMonth: (month: string) => [...achievementCriteriaKeys.all, month] as const,
};

/**
 * 달성률 기준 조회 Hook
 * @param month - 조회 연월 (YYYY-MM 형식)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useAchievementCriteria = (
  month: string,
  enabled: boolean = true,
) => {
  return useQuery<AchievementCriteria, Error>({
    queryKey: achievementCriteriaKeys.byMonth(month),
    queryFn: () => fetchAchievementCriteria(month),
    enabled: enabled && !!month,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 달성률 기준 저장 Hook
 * @returns React Query mutation 객체
 */
export const useUpdateAchievementCriteria = () => {
  const queryClient = useQueryClient();

  return useMutation<AchievementCriteria, Error, AchievementCriteriaUpdateRequest>({
    mutationFn: updateAchievementCriteria,
    onSuccess: (data) => {
      // 해당 월의 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: achievementCriteriaKeys.byMonth(data.appliedMonth),
      });
    },
  });
};
