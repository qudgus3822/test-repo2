import { apiGet } from "@/libs/fetch";

// 사용자 정보 타입
export interface UserItem {
  id: string;
  employeeID: string;
  name: string;
  departmentName: string;
  personalTitle: string;
  title: string;
  role: string;
  status: string;
  registeredAt: string;
}

// 사용자 관리 목록 응답 타입
export interface UserManagementResponse {
  data: UserItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 사용자 관리 목록 요청 파라미터 타입
export interface UserManagementParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

/**
 * 사용자 관리 목록 조회 API
 * @param params - API 요청 파라미터
 * @returns 사용자 목록 및 페이지네이션 정보
 */
export const fetchUserManagement = async (
  params: UserManagementParams = {}
): Promise<UserManagementResponse> => {
  const {
    page = 1,
    limit = 200,
    search,
    status,
    sortBy,
    order,
  } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));

  if (search) queryParams.append("search", search);
  if (status) queryParams.append("status", status);
  if (sortBy) queryParams.append("sortBy", sortBy);
  if (order) queryParams.append("order", order);

  return apiGet<UserManagementResponse>(
    `/users/management?${queryParams.toString()}`
  );
};
