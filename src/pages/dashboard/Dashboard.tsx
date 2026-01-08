import { useEffect } from "react";
import { Cable } from "lucide-react";
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
import type { formatYearMonth } from "@/utils";

const DashboardPage = () => {
  const { period, setPeriod, currentDate, setCurrentDate, setOrgHistoryModal } =
    useDashboardStore((state) => state);

  // 페이지 진입 시 초기화: 당월로 설정
  useEffect(() => {
    setPeriod("monthly");
    setCurrentDate(new Date());
  }, [setPeriod, setCurrentDate]);

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
    </div>
  );
};

export default DashboardPage;
