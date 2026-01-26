import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrganizationByTab,
  fetchOrganizationTree,
  fetchOrgChangeHistory,
  fetchOrgTypeSettings,
  updateEvaluationTargetsBulk,
  fetchOrganizationAllMetrics,
  fetchOrganizationBdpiMetrics,
  fetchMetricOrder,
  updateMetricOrder,
} from "@/api/organization";
import type {
  BulkEvaluationTargetRequest,
  MetricOrderResponse,
  UpdateMetricOrderRequest,
} from "@/api/organization";
import type {
  OrganizationCompareResponse,
  OrgHistoryResponse,
  OrgTypeSettingsResponse,
  TabType,
  OrganizationDepartment,
  OrganizationNode,
  ChangeInfo,
  AggregationType,
  FormatType,
  FlatViewType,
} from "@/types/organization.types";

// 개발 환경에서 mockup changes 데이터 주입 여부
const ENABLE_MOCK_CHANGES = import.meta.env.DEV;

// Mockup changes 데이터
const MOCK_DEPT_CHANGES: ChangeInfo[] = [
  {
    changeType: "CREATED",
    changeDate: "2024-12-01",
    category: "GROUP",
    changeDetail: "신규 조직 생성",
    processedBy: "LDAP",
  },
];

const MOCK_MEMBER_CHANGES: ChangeInfo[] = [
  {
    changeType: "JOINED",
    changeDate: "2024-12-15",
    category: "HR",
    changeDetail: "신규 입사",
    processedBy: "LDAP",
  },
];

const MOCK_POLICY_CHANGES: ChangeInfo[] = [
  {
    changeType: "ADD",
    changeDate: "2024-12-10",
    category: "POLICY",
    changeDetail: "개발조직 유형 추가",
    processedBy: "관리자",
  },
];

// 트리에 mockup changes 주입 (일부 노드에만)
const injectMockChanges = (
  nodes: OrganizationDepartment[],
  depth: number = 0,
): OrganizationDepartment[] => {
  return nodes.map((node, index) => {
    const newNode = { ...node };

    // 첫 번째 부문(level 1)에 조직 변경 뱃지 추가
    if (node.level === 1 && index === 0 && !node.changes?.length) {
      newNode.changes = MOCK_DEPT_CHANGES;
    }

    // 첫 번째 실(level 2)에 정책 변경 뱃지 추가
    if (node.level === 2 && index === 0 && !node.changes?.length) {
      newNode.changes = MOCK_POLICY_CHANGES;
    }

    // children 처리
    if (node.children) {
      newNode.children = node.children.map((child, childIndex) => {
        if (child.type === "department") {
          return injectMockChanges(
            [child as OrganizationDepartment],
            depth + 1,
          )[0];
        } else if (child.type === "member") {
          // 첫 번째 멤버에만 인사 변경 뱃지 추가
          if (childIndex === 0 && !child.changes?.length) {
            return { ...child, changes: MOCK_MEMBER_CHANGES };
          }
        }
        return child;
      }) as OrganizationNode[];
    }

    return newNode;
  });
};

// 전체 탭 옵션 타입
export interface AllTabOptions {
  aggregation?: AggregationType;
  format?: FormatType;
  type?: FlatViewType;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  search?: string;
}

// Query Keys
export const organizationTreeKeys = {
  all: ["organizationTree"] as const,
  byMonth: (yearMonth: string) =>
    [...organizationTreeKeys.all, yearMonth] as const,
  byMonthAndTab: (yearMonth: string, tab: TabType, options?: AllTabOptions) =>
    [...organizationTreeKeys.all, yearMonth, tab, options ?? {}] as const,
  tree: (yearMonth: string) =>
    [...organizationTreeKeys.all, "tree", yearMonth] as const,
  changeHistory: (yearMonth: string) =>
    [...organizationTreeKeys.all, "changeHistory", yearMonth] as const,
  orgTypeSettings: (yearMonth: string) =>
    [...organizationTreeKeys.all, "orgTypeSettings", yearMonth] as const,
};

/**
 * 탭별 조직도 트리 조회 Hook
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @param tab - 탭 타입 (all, bdpi, codeQuality, reviewQuality, developmentEfficiency)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @param options - 전체 탭 추가 옵션 (aggregation, format, type 등)
 * @returns React Query 결과 객체
 */
export const useOrganizationTree = (
  yearMonth: string,
  tab: TabType = "bdpi",
  enabled: boolean = true,
  options?: AllTabOptions,
) => {
  return useQuery<OrganizationCompareResponse, Error>({
    queryKey: organizationTreeKeys.byMonthAndTab(yearMonth, tab, options),
    queryFn: async () => {
      let response: OrganizationCompareResponse;

      // "all" 탭일 경우 전체 지표 API 호출
      if (tab === "all") {
        response = await fetchOrganizationAllMetrics({
          yearMonth,
          aggregation: options?.aggregation ?? "avg",
          format: options?.format ?? "tree",
          type: options?.type,
          sortBy: options?.sortBy,
          order: options?.order,
          page: options?.page,
          limit: options?.limit,
          search: options?.search,
        });
      }
      // "bdpi" 탭일 경우 BDPI 지표 API 호출 (options 유무 상관없이)
      else if (tab === "bdpi") {
        response = await fetchOrganizationBdpiMetrics({
          yearMonth,
          aggregation: options?.aggregation ?? "avg",
          format: options?.format ?? "tree",
          type: options?.type,
          search: options?.search,
        });
      }
      // 그 외 탭은 기존 API 호출
      else {
        response = await fetchOrganizationByTab(yearMonth, tab);
      }

      // 개발 환경에서 mockup changes 데이터 주입
      if (ENABLE_MOCK_CHANGES && response.tree) {
        response = {
          ...response,
          tree: injectMockChanges(response.tree),
        };
      }

      return response;
    },
    enabled: enabled && !!yearMonth,
    staleTime: 2 * 60 * 1000, // 2분
    // [변경: 2026-01-25 17:10, 김병현 수정] TODO: 반드시 삭제 - 임시 조직 순서 정렬
    select: (data) => {
      const TEAM_ORDER = [
        "규제기술실",
        "코어플랫폼개발실",
        "서비스BE개발실",
        "웹FE개발실",
        "모바일 APP개발실",
        "플랫폼실",
        "Data/AI실",
        "IT지원실",
        "SRE팀",
        "모두플랫폼개발실",
      ];

      // [변경: 2026-01-26 00:00, 김병현 수정] tree와 items 모두 정렬 적용
      if (data.tree) {
        data.tree.forEach((dept) => {
          if (dept.children) {
            dept.children.sort((a, b) => {
              const aIndex = TEAM_ORDER.indexOf(a.name);
              const bIndex = TEAM_ORDER.indexOf(b.name);
              // 목록에 없는 팀은 맨 뒤로
              if (aIndex === -1 && bIndex === -1) return 0;
              if (aIndex === -1) return 1;
              if (bIndex === -1) return -1;
              return aIndex - bIndex;
            });
          }
        });
      }

      // format=list 응답 (items)에도 정렬 적용
      if (data.items) {
        data.items.sort((a, b) => {
          const aIndex = TEAM_ORDER.indexOf(a.name);
          const bIndex = TEAM_ORDER.indexOf(b.name);
          // 목록에 없는 항목은 맨 뒤로
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
      }

      return data;
    },
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
    // [변경: 2026-01-25 17:10, 김병현 수정] TODO: 반드시 삭제 - 임시 조직 순서 정렬
    select: (data) => {
      const TEAM_ORDER = [
        "규제기술실",
        "코어플랫폼개발실",
        "서비스BE개발실",
        "웹FE개발실",
        "모바일 APP개발실",
        "플랫폼실",
        "Data/AI실",
        "IT지원실",
        "SRE팀",
        "모두플랫폼개발실",
      ];

      if (data.tree) {
        data.tree.forEach((dept) => {
          if (dept.children) {
            dept.children.sort((a, b) => {
              const aIndex = TEAM_ORDER.indexOf(a.name);
              const bIndex = TEAM_ORDER.indexOf(b.name);
              // 목록에 없는 팀은 맨 뒤로
              if (aIndex === -1 && bIndex === -1) return 0;
              if (aIndex === -1) return 1;
              if (bIndex === -1) return -1;
              return aIndex - bIndex;
            });
          }
        });
      }

      return data;
    },
  });
};

/**
 * 조직도 변경 이력 조회 Hook
 * @param yearMonth - 조회 연월 (YYYY-MM 형식), 미입력시 전체 기간 조회
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useOrgChangeHistory = (
  yearMonth?: string,
  enabled: boolean = true,
) => {
  return useQuery<OrgHistoryResponse, Error>({
    queryKey: organizationTreeKeys.changeHistory(yearMonth ?? "all"),
    queryFn: async () => {
      return fetchOrgChangeHistory(yearMonth);
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * 조직 유형 설정 조회 Hook
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useOrgTypeSettings = (
  yearMonth: string,
  enabled: boolean = true,
) => {
  return useQuery<OrgTypeSettingsResponse, Error>({
    queryKey: organizationTreeKeys.orgTypeSettings(yearMonth),
    queryFn: async () => {
      return fetchOrgTypeSettings(yearMonth);
    },
    enabled: enabled && !!yearMonth,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * 개발조직 포함/제외 일괄 변경 Mutation Hook
 * @returns React Query Mutation 결과 객체
 */
export const useUpdateEvaluationTargetsBulk = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, BulkEvaluationTargetRequest>({
    mutationFn: updateEvaluationTargetsBulk,
    onSuccess: () => {
      // 조직 관련 쿼리 무효화하여 최신 데이터 다시 조회
      queryClient.invalidateQueries({ queryKey: organizationTreeKeys.all });
    },
  });
};

// 지표 순서 Query Key
export const metricOrderKeys = {
  all: ["metricOrder"] as const,
};

/**
 * 지표 순서 조회 Hook
 * @returns React Query 결과 객체
 */
export const useMetricOrder = () => {
  return useQuery<MetricOrderResponse, Error>({
    queryKey: metricOrderKeys.all,
    queryFn: fetchMetricOrder,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 지표 순서 변경 Mutation Hook
 * @returns React Query Mutation 결과 객체
 */
export const useUpdateMetricOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<MetricOrderResponse, Error, UpdateMetricOrderRequest>({
    mutationFn: ({ fromIndex, toIndex }) =>
      updateMetricOrder(fromIndex, toIndex),
    onSuccess: (data) => {
      // API 응답으로 지표 순서 캐시 업데이트
      queryClient.setQueryData<MetricOrderResponse>(metricOrderKeys.all, data);
      // 조회 API 재호출은 필터 변경 시에만 수행 (Organization.tsx에서 처리)
    },
  });
};
