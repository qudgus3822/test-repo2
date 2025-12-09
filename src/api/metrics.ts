import type {
  MetricOverview,
  MetricsListData,
  AchievementCriteria,
  AchievementCriteriaUpdateRequest,
  TargetValuesResponse,
  PendingSummaryResponse,
} from "@/types/metrics.types";
import type { GoalAchievementRate } from "@/types/goalAchievement.types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/libs/fetch";

/**
 * 지표 현황 조회 API
 * @param month - 조회 연월 (YYYY-MM 형식)
 * @returns 지표 현황 데이터
 */
export const fetchMetricsOverview = async (
  month: string,
): Promise<MetricOverview> => {
  return apiGet<MetricOverview>(`/metrics/overview?month=${month}`);
};

/**
 * 지표 리스트 조회 API
 * @param month - 조회 연월 (YYYY-MM 형식)
 * @returns 지표 리스트 데이터
 */
export const fetchMetricsList = async (
  month: string,
): Promise<MetricsListData> => {
  return apiGet<MetricsListData>(`/metrics?month=${month}`);
};

/**
 * 목표 달성률 조회 API
 * @param month - 조회 연월 (YYYY-MM 형식)
 * @returns 목표 달성률 데이터
 */
export const fetchGoalAchievement = async (
  month: string,
): Promise<GoalAchievementRate> => {
  return apiGet<GoalAchievementRate>(`/metrics/goal-achievement?month=${month}`);
};

/**
 * 달성률 기준 조회 API
 * @param month - 조회 연월 (YYYY-MM 형식)
 * @returns 달성률 기준 데이터
 */
export const fetchAchievementCriteria = async (
  month: string,
): Promise<AchievementCriteria> => {
  return apiGet<AchievementCriteria>(`/metrics/achievement-criteria?month=${month}`);
};

/**
 * 달성률 기준 저장 API
 * @param data - 저장할 달성률 기준 데이터
 * @returns 저장된 달성률 기준 데이터
 */
export const updateAchievementCriteria = async (
  data: AchievementCriteriaUpdateRequest,
): Promise<AchievementCriteria> => {
  return apiPut<AchievementCriteria>("/metrics/achievement-criteria", data);
};

/**
 * 목표값 조회 API
 * @param category - 범주 (quality | review | efficiency)
 * @param month - 조회 연월 (YYYY-MM 형식)
 * @returns 목표값 데이터
 */
export const fetchTargetValues = async (
  category: string,
  month: string,
): Promise<TargetValuesResponse> => {
  return apiGet<TargetValuesResponse>(`/metrics/target-values?category=${category}&month=${month}`);
};

/**
 * 변경내역 조회 API (Pending Summary)
 * @returns 변경 대기 중인 설정 항목 요약
 */
export const fetchPendingSummary = async (): Promise<PendingSummaryResponse> => {
  return apiGet<PendingSummaryResponse>("/metrics/settings/pending-summary");
};

/**
 * 변경내역 적용 API
 * 대기 중인 모든 설정 변경사항을 확정 적용합니다.
 */
export const applySettingsChanges = async (): Promise<void> => {
  return apiPost<void>("/metrics/settings/apply");
};

/**
 * 변경내역 취소 API
 * 대기 중인 모든 설정 변경사항을 취소합니다.
 */
export const cancelPendingChanges = async (): Promise<void> => {
  return apiDelete<void>("/metrics/settings/pending");
};
