import { env } from "@/env";
import type {
  OrganizationCompareResponse,
  TabType,
} from "@/types/organization.types";

/**
 * 탭 타입별 API 엔드포인트 매핑
 */
const TAB_ENDPOINT_MAP: Record<TabType, string> = {
  bdpi: "bdpi",
  codeQuality: "code-quality",
  reviewQuality: "review-quality",
  developmentEfficiency: "efficiency",
};

/**
 * 월별 조직도 트리 조회 API (기본 - tree 엔드포인트)
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @returns 조직 트리 데이터
 */
export const fetchOrganizationTree = async (
  yearMonth: string,
): Promise<OrganizationCompareResponse> => {
  const response = await fetch(
    `${env.apiBaseUrl}/departments/monthly/tree?yearMonth=${yearMonth}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "조직도 조회 실패");
  }

  return response.json();
};

/**
 * 탭별 조직 지표 데이터 조회 API
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @param tab - 탭 타입 (bdpi, codeQuality, reviewQuality, developmentEfficiency)
 * @returns 조직 트리 데이터 (탭별 지표 포함)
 */
export const fetchOrganizationByTab = async (
  yearMonth: string,
  tab: TabType,
): Promise<OrganizationCompareResponse> => {
  const endpoint = TAB_ENDPOINT_MAP[tab];
  const response = await fetch(
    `${env.apiBaseUrl}/departments/monthly/${endpoint}?yearMonth=${yearMonth}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `${tab} 데이터 조회 실패`);
  }

  return response.json();
};
