import { useMemo } from "react";
import {
  useProjectDashboardInfinite,
  flattenProjectPages,
} from "@/api/hooks/useProjectDashboard";
import type { OperationItem } from "@/types/project.types";
import { getMockOpr2Dashboard } from "@/mocks/projects.mock";

// VITE_USE_MOCK_DATA=true 이면 실제 데이터 뒤에 mock 데이터를 추가
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

/**
 * 운영(OPR2) 테이블 데이터 훅
 * - API 호출 + 데이터 변환 + 무한 스크롤 상태 관리
 */
export const useOperationTableData = (month: string, enabled: boolean) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProjectDashboardInfinite(
      { month, classification: "OPR2_NON_TF", limit: 15 },
      enabled,
    );

  const items: OperationItem[] = useMemo(() => {
    const flatData = flattenProjectPages(data?.pages);
    const apiItems = flatData.map((project) => ({
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

    // [변경: 2026-03-18 00:00, 김병현 수정] mock 모드: 실제 데이터 뒤에 mock 데이터 추가
    if (USE_MOCK) {
      const mockData = getMockOpr2Dashboard(month);
      const mockItems = mockData.data.map((project) => ({
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
      return [...apiItems, ...mockItems];
    }

    return apiItems;
  }, [data?.pages, month]);

  return {
    items,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };
};
