import { env } from "@/env";
import type { ApiOrganizationCompareResponse } from "@/types/organization.types";

/**
 * 월별 조직도 트리 조회 API
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @returns 조직 트리 데이터
 */
export const fetchOrganizationTree = async (
  yearMonth: string,
): Promise<ApiOrganizationCompareResponse> => {
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
