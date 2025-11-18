import {
  MetricsOverview,
  TargetValueAchievement,
  ServiceStability,
  MetricsRanking,
  ProductivityTrend,
} from "@/components/dashboard";
import { DateFilter } from "@/components/ui/DateFilter";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useDashboardStore } from "@/store/useDashboardStore";
import { usePdfDownload } from "@/hooks";

const DashboardPage = () => {
  const { period, setPeriod, currentDate, setCurrentDate } =
    useDashboardStore((state) => state);
  const { downloadPdf, isGenerating } = usePdfDownload();

  // 날짜를 YYYY-MM 형식으로 변환
  const formattedMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  const handleDownload = () => {
    downloadPdf(
      "dashboard-content",
      "BarcodePlus_Monitoring_Dashboard_2025.pdf",
    );
  };


  return (
    <div className="space-y-6">
      {/* 헤더 - 날짜 필터 */}
      <div>
        <Card className="w-full">
          <div className="w-full flex items-center justify-between gap-4">
            <DateFilter
              period={period}
              onPeriodChange={setPeriod}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
            {/* PDF 다운로드 버튼 */}
            <Button
              variant="primary"
              size="md"
              onClick={handleDownload}
              disabled={isGenerating}
            >
              {isGenerating ? "PDF 생성 중..." : "PDF 내보내기"}
            </Button>
          </div>
        </Card>
      </div>

      <div id="dashboard-content" className="flex gap-6">
        <div className="w-2/3 space-y-6">
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
    </div>
  );
};

export default DashboardPage;
