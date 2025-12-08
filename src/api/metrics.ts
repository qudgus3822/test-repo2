import type { MetricOverview, MetricsListData } from "@/types/metrics.types";
import { apiGet } from "@/libs/fetch";

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
