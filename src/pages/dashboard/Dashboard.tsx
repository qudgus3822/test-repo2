import { useEffect, useState } from "react";
import { Cable, HelpCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import {
  MetricsOverview,
  TargetValueAchievement,
  ServiceStability,
  MetricsRanking,
  ProductivityTrend,
  OrgChangeHistoryModal,
} from "@/components/dashboard";
import { DateFilter } from "@/components/ui/DateFilter";
import { Card } from "@/components/ui/Card";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Button } from "@/components/ui/Button";
import { HelpModal } from "@/components/ui/HelpModal";

// 대시보드 도움말 이미지 목록 - 실제 이미지 파일 경로로 교체
const DASHBOARD_HELP_IMAGES = [
  { src: "/help/dashboard-help-0.png", alt: "대시보드 도움말 1", title: "홈" },
  {
    src: "/help/dashboard-help-1.png",
    alt: "대시보드 도움말 2",
    title: "홈 > BDPI",
  },
  {
    src: "/help/dashboard-help-2.png",
    alt: "대시보드 도움말 3",
    title: "홈 > BDPI",
  },
  {
    src: "/help/dashboard-help-3.png",
    alt: "대시보드 도움말 4",
    title: "홈 > 서비스 안정성",
  },
  {
    src: "/help/dashboard-help-4.png",
    alt: "대시보드 도움말 5",
    title: "홈 > 개발생산성 트렌드",
  },
  {
    src: "/help/dashboard-help-5.png",
    alt: "대시보드 도움말 6",
    title: "홈 > 목표 달성률",
  },
  {
    src: "/help/dashboard-help-6.png",
    alt: "대시보드 도움말 7",
    title: "홈 > 지표순위",
  },
  {
    src: "/help/dashboard-help-7.png",
    alt: "대시보드 도움말 8",
    title: "홈 > 조직도",
  },
  {
    src: "/help/dashboard-help-8.png",
    alt: "대시보드 도움말 9",
    title: "홈 > 상세보기(코드 리뷰 진행 현황)",
  },
  {
    src: "/help/dashboard-help-9.png",
    alt: "대시보드 도움말 10",
    title: "홈 > 튜토리얼",
  },
];
import { companyQualityKeys } from "@/api/hooks/useCompanyQuality";
import { serviceStabilityKeys } from "@/api/hooks/useServiceStability";
import { developerProductivityKeys } from "@/api/hooks/useDeveloperProductivity";
import { goalAchievementKeys } from "@/api/hooks/useGoalAchievement";
import { metricRankingsKeys } from "@/api/hooks/useMetricRankings";

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  // [변경: 2026-01-25 15:30, 김병현 수정] useShallow를 사용하여 store 상태 한번에 선언
  const { period, setPeriod, currentDate, setCurrentDate, setOrgHistoryModal } =
    useDashboardStore(
      useShallow((state) => ({
        period: state.period,
        setPeriod: state.setPeriod,
        currentDate: state.currentDate,
        setCurrentDate: state.setCurrentDate,
        setOrgHistoryModal: state.setOrgHistoryModal,
      })),
    );

  // 페이지 진입 시 초기화: 당월로 설정, 쿼리 캐시 무효화
  useEffect(() => {
    setPeriod("monthly");
    setCurrentDate(new Date());
    // 대시보드 관련 쿼리 캐시 무효화하여 최신 데이터 조회
    queryClient.invalidateQueries({ queryKey: companyQualityKeys.all });
    queryClient.invalidateQueries({ queryKey: serviceStabilityKeys.all });
    queryClient.invalidateQueries({ queryKey: developerProductivityKeys.all });
    queryClient.invalidateQueries({ queryKey: goalAchievementKeys.all });
    queryClient.invalidateQueries({ queryKey: metricRankingsKeys.all });
  }, [setPeriod, setCurrentDate, queryClient]);

  // 날짜를 YYYY-MM 형식으로 변환
  const formattedMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 - 날짜 필터 */}
      <div>
        <Card className="w-full">
          <div className="w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <DateFilter
                period={period}
                onPeriodChange={setPeriod}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
              />
              {/* 조직도 변경 히스토리 팝업 버튼 */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setOrgHistoryModal(true)}
              >
                <Cable className="w-4 h-4" />
              </Button>
            </div>
            {/* 도움말 버튼 */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsHelpModalOpen(true)}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            {/* TODO: Phase2 개발 예정 - PDF 내보내기 버튼
            <Button
              variant="primary"
              size="md"
              onClick={handleDownload}
              disabled={isGenerating}
            >
              {isGenerating ? "PDF 생성 중..." : "PDF 내보내기"}
            </Button>
            */}
          </div>
        </Card>
      </div>

      <div id="dashboard-content" className="flex gap-6">
        <div className="w-2/3 flex flex-col gap-6">
          {/* 메트릭 개요 */}
          <MetricsOverview month={formattedMonth} />

          {/* 서비스 안정성 */}
          <ServiceStability month={formattedMonth} />

          {/* 개발생산성 트렌드 */}
          <ProductivityTrend month={formattedMonth} />
        </div>

        <div className="w-1/3">
          <Card className="w-full h-auto">
            {/* 목표 달성률  */}
            <TargetValueAchievement month={formattedMonth} />

            {/* 구분선-수평선 */}
            <div className="border-t border-[#E2E8F0] my-6"></div>

            {/* 지표 순위 */}
            <MetricsRanking month={formattedMonth} />
          </Card>
        </div>
      </div>

      {/* 조직도 변경 히스토리 모달 */}
      <OrgChangeHistoryModal targetMonth={formattedMonth} />

      {/* 도움말 모달 */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        images={DASHBOARD_HELP_IMAGES}
        title="대시보드 도움말"
      />
    </div>
  );
};

export default DashboardPage;
