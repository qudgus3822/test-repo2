import { useMemo } from "react";
import {
  useProjectDashboardInfinite,
  flattenProjectPages,
} from "@/api/hooks/useProjectDashboard";
import type { OperationItem } from "@/types/project.types";
import { getMockOpr2Dashboard } from "@/mocks/projects.mock";

// VITE_USE_MOCK_DATA=true 이면 mock 데이터 사용
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

/**
 * 운영(OPR2) 테이블 데이터 훅
 * - API 호출 + 데이터 변환 + 무한 스크롤 상태 관리
 */
export const useOperationTableData = (month: string, enabled: boolean) => {
  // mock 모드일 때 API 훅은 비활성화
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProjectDashboardInfinite(
      { month, classification: "OPR2_NON_TF", limit: 15 },
      enabled && !USE_MOCK,
    );

  const items: OperationItem[] = useMemo(() => {
    // mock 데이터 반환
    if (USE_MOCK) {
      const mockData = getMockOpr2Dashboard(month);
      return mockData.data.map((project) => ({
        id: project.projectId,
        name: project.epicSummary,
        epicId: project.epicKey,
        epicUrl: `https://bithumbcorp.atlassian.net/browse/${project.epicKey}`,
        activeTicketCount: project.activeTicketCount,
        updatedCount: project.updatedCount,
        completedCount: project.completedCount,
        createdCount: project.createdCount,
        createdAt: project.createdAt ?? "",
      }));
    }

    const flatData = flattenProjectPages(data?.pages);
    return flatData.map((project) => ({
      id: project.projectId,
      name: project.epicSummary,
      epicId: project.epicKey,
      epicUrl: `https://bithumbcorp.atlassian.net/browse/${project.epicKey}`,
      activeTicketCount: project.activeTicketCount,
      updatedCount: project.updatedCount,
      completedCount: project.completedCount,
      createdCount: project.createdCount,
      createdAt: project.createdAt ?? "",
    }));
  }, [data?.pages, month]);

  return {
    items,
    // mock 모드에서는 로딩/페이지네이션 없음
    isLoading: USE_MOCK ? false : isLoading,
    hasNextPage: USE_MOCK ? false : hasNextPage,
    isFetchingNextPage: USE_MOCK ? false : isFetchingNextPage,
    fetchNextPage,
  };
};
