import { useQuery } from "@tanstack/react-query";
import { fetchOrganizationByTab, fetchOrganizationTree } from "@/api/organization";
import type {
  OrganizationCompareResponse,
  TabType,
} from "@/types/organization.types";

// Query Keys
export const organizationTreeKeys = {
  all: ["organizationTree"] as const,
  byMonth: (yearMonth: string) =>
    [...organizationTreeKeys.all, yearMonth] as const,
  byMonthAndTab: (yearMonth: string, tab: TabType) =>
    [...organizationTreeKeys.all, yearMonth, tab] as const,
  tree: (yearMonth: string) =>
    [...organizationTreeKeys.all, "tree", yearMonth] as const,
};

/**
 * 탭별 조직도 트리 조회 Hook
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @param tab - 탭 타입 (bdpi, codeQuality, reviewQuality, developmentEfficiency)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useOrganizationTree = (
  yearMonth: string,
  tab: TabType = "bdpi",
  enabled: boolean = true,
) => {
  return useQuery<OrganizationCompareResponse, Error>({
    queryKey: organizationTreeKeys.byMonthAndTab(yearMonth, tab),
    queryFn: async () => {
      return fetchOrganizationByTab(yearMonth, tab);
    },
    enabled: enabled && !!yearMonth,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * 월별 조직도 트리 조회 Hook (설정 화면용 - 기본 tree 엔드포인트)
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useOrganizationTreeBasic = (
  yearMonth: string,
  enabled: boolean = true,
) => {
  return useQuery<OrganizationCompareResponse, Error>({
    queryKey: organizationTreeKeys.tree(yearMonth),
    queryFn: async () => {
      return fetchOrganizationTree(yearMonth);
    },
    enabled: enabled && !!yearMonth,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
