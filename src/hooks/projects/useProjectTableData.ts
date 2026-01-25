import { useMemo } from "react";
import {
  useProjectDashboardInfinite,
  flattenProjectPages,
} from "@/api/hooks/useProjectDashboard";
import type { ProjectItem } from "@/types/project.types";

/**
 * TF 프로젝트 테이블 데이터 훅
 * - API 호출 + 데이터 변환 + 무한 스크롤 상태 관리
 */
export const useProjectTableData = (month: string, enabled: boolean) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useProjectDashboardInfinite(
    { month, classification: "TF", limit: 15 },
    enabled,
  );

  const projects: ProjectItem[] = useMemo(() => {
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
      bugCount: project.bugCount,
      incidentCount: project.incidentCount,
      avgResolutionTime: project.mttr,
      avgDetectionTime: project.mttd,
      avgDiagnosisTime: project.timeToCauseIdentification,
      avgRecoveryTime: project.timeToRepair,
      createdAt: project.createdAt ?? "",
    }));
  }, [data?.pages]);

  return {
    projects,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };
};
