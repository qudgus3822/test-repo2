import { useQuery } from "@tanstack/react-query";
import {
  fetchUserManagement,
  type UserManagementResponse,
  type UserManagementParams,
} from "@/api/users";

// Query Keys
export const userManagementKeys = {
  all: ["userManagement"] as const,
  list: (params: UserManagementParams) =>
    [...userManagementKeys.all, params] as const,
};

/**
 * 사용자 관리 목록 조회 Hook
 * @param params - 요청 파라미터 (page, limit, search, status, sortBy, order)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useUserManagement = (
  params: UserManagementParams = {},
  enabled: boolean = true
) => {
  return useQuery<UserManagementResponse, Error>({
    queryKey: userManagementKeys.list(params),
    queryFn: () => fetchUserManagement(params),
    enabled,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
