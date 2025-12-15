import type {
  OrganizationCompareResponse,
  OrgHistoryResponse,
  OrgTypeSettingsResponse,
  TabType,
} from "@/types/organization.types";
import { apiGet } from "@/libs/fetch";

/**
 * 탭 타입별 API 엔드포인트 매핑
 * - UI 탭 ID (codeQuality 등) → API 엔드포인트 (quality 등)
 */
const TAB_ENDPOINT_MAP: Record<TabType, string> = {
  bdpi: "bdpi",
  codeQuality: "quality",
  reviewQuality: "review",
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
  return apiGet<OrganizationCompareResponse>(`/departments/monthly/tree?yearMonth=${yearMonth}`);
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
  return apiGet<OrganizationCompareResponse>(`/departments/monthly/${endpoint}?yearMonth=${yearMonth}`);
};

/**
 * 조직도 변경 이력 조회 API
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @returns 변경 이력 데이터
 */
export const fetchOrgChangeHistory = async (
  yearMonth: string,
): Promise<OrgHistoryResponse> => {
  return apiGet<OrgHistoryResponse>(`/departments/change-history?yearMonth=${yearMonth}`);
};

/**
 * 조직 유형 설정 조회 API
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @returns 조직 유형 설정 트리 데이터
 */
export const fetchOrgTypeSettings = async (
  yearMonth: string,
): Promise<OrgTypeSettingsResponse> => {
  return apiGet<OrgTypeSettingsResponse>(`/departments/org-type-settings?yearMonth=${yearMonth}`);
};
