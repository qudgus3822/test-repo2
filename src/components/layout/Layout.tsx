import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useSyncStatus } from "@/api/hooks/useSyncStatus";
// [변경: 2026-01-27 16:00, 김병현 수정] 전역 데이터 리로딩을 위한 Query Keys import
import { companyQualityKeys } from "@/api/hooks/useCompanyQuality";
import { serviceStabilityKeys } from "@/api/hooks/useServiceStability";
import { developerProductivityKeys } from "@/api/hooks/useDeveloperProductivity";
import { goalAchievementKeys } from "@/api/hooks/useGoalAchievement";
import { metricRankingsKeys } from "@/api/hooks/useMetricRankings";
import { metricsListKeys } from "@/api/hooks/useMetricsList";
import { achievementCriteriaKeys } from "@/api/hooks/useAchievementCriteria";
import { metricsOverviewKeys } from "@/api/hooks/useMetricsOverview";
import { organizationTreeKeys } from "@/api/hooks/useOrganizationTree";
import { projectDashboardKeys } from "@/api/hooks/useProjectDashboard";
import { projectDashboardSummaryKeys } from "@/api/hooks/useProjectDashboardSummary";

export default function Layout() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isProcessing } = useSyncStatus();
  const prevIsProcessingRef = useRef(isProcessing);

  // [변경: 2026-01-27 16:00, 김병현 수정] 집계 완료 시 (isProcessing: true → false) 전역 데이터 리로딩
  useEffect(() => {
    // 이전에 processing 상태였다가 완료된 경우에만 invalidate
    if (prevIsProcessingRef.current && !isProcessing) {
      // Dashboard 페이지 관련 쿼리
      queryClient.invalidateQueries({ queryKey: companyQualityKeys.all });
      queryClient.invalidateQueries({ queryKey: serviceStabilityKeys.all });
      queryClient.invalidateQueries({
        queryKey: developerProductivityKeys.all,
      });
      queryClient.invalidateQueries({ queryKey: goalAchievementKeys.all });
      queryClient.invalidateQueries({ queryKey: metricRankingsKeys.all });
      queryClient.invalidateQueries({ queryKey: metricsOverviewKeys.all });

      // Metrics 페이지 관련 쿼리
      queryClient.invalidateQueries({ queryKey: metricsListKeys.all });
      queryClient.invalidateQueries({ queryKey: achievementCriteriaKeys.all });

      // Organization 페이지 관련 쿼리
      queryClient.invalidateQueries({ queryKey: organizationTreeKeys.all });

      // Projects 페이지 관련 쿼리
      queryClient.invalidateQueries({ queryKey: projectDashboardKeys.all });
      queryClient.invalidateQueries({
        queryKey: projectDashboardSummaryKeys.all,
      });

      // Header의 최근 업데이트 시간 갱신
      queryClient.invalidateQueries({ queryKey: ["lastAggregatedAt"] });
    }
    prevIsProcessingRef.current = isProcessing;
  }, [isProcessing, queryClient]);

  // [변경: 2026-01-19 18:30, 김병현 수정] /organization 페이지만 고정 높이 적용
  const isFixHeight = location.pathname === "/organization";

  return (
    // [변경: 2026-01-19 00:00, 김병현 수정] 100vh 고정 높이로 변경하여 화면 전체 스크롤 방지 (Dashboard 제외)
    <div
      className={
        isFixHeight
          ? "h-screen overflow-hidden bg-gray-50"
          : "min-h-screen bg-gray-50"
      }
    >
      {/* Header */}
      <Header />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`ml-16 lg:ml-[200px] xl:ml-[260px] pt-20 transition-all duration-300 ${
          isFixHeight ? "h-[calc(100vh)] overflow-hidden" : "min-h-screen"
        }`}
      >
        <div
          className={`p-8 ${
            isFixHeight ? "h-full overflow-hidden flex flex-col" : ""
          }`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
