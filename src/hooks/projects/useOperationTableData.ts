import { useMemo } from "react";
import {
  useProjectDashboardInfinite,
  flattenProjectPages,
} from "@/api/hooks/useProjectDashboard";
import type { OperationItem } from "@/types/project.types";

/**
 * 운영(OPR2) 테이블 데이터 훅
 * - API 호출 + 데이터 변환 + 무한 스크롤 상태 관리
 */
export const useOperationTableData = (month: string, enabled: boolean) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useProjectDashboardInfinite(
    { month, classification: "OPR2_NON_TF", limit: 10 },
    enabled,
  );

  const items: OperationItem[] = useMemo(() => {
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
  }, [data?.pages]);

  return {
    items,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };
};
