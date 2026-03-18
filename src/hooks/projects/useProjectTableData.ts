import { useMemo } from "react";
import {
  useProjectDashboardInfinite,
  flattenProjectPages,
} from "@/api/hooks/useProjectDashboard";
import type { ProjectItem } from "@/types/project.types";
import { getMockTfProjectDashboard } from "@/mocks/projects.mock";

// VITE_USE_MOCK_DATA=true 이면 실제 데이터 뒤에 mock 데이터를 추가
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

/**
 * TF 프로젝트 테이블 데이터 훅
 * - API 호출 + 데이터 변환 + 무한 스크롤 상태 관리
 */
export const useProjectTableData = (month: string, enabled: boolean) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProjectDashboardInfinite(
      { month, classification: "TF", limit: 15 },
      enabled,
    );

  const projects: ProjectItem[] = useMemo(() => {
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
      bugCount: project.bugCount,
      incidentCount: project.incidentCount,
      avgResolutionTime: project.mttr,
      avgDetectionTime: project.mttd,
      avgDiagnosisTime: project.timeToCauseIdentification,
      avgRecoveryTime: project.timeToRepair,
      createdAt: project.createdAt ?? "",
    }));

    // [변경: 2026-03-18 00:00, 김병현 수정] mock 모드: 실제 데이터 뒤에 mock 데이터 추가
    if (USE_MOCK) {
      const mockData = getMockTfProjectDashboard(month);
      const mockItems = mockData.data.map((project) => ({
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
      return [...apiItems, ...mockItems];
    }

    return apiItems;
  }, [data?.pages, month]);

  return {
    projects,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };
};
