import { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { DateFilter } from "@/components/ui/DateFilter";
import { MetricsSummary } from "@/components/metrics/MetricsSummary";
import { GoalAchievement } from "@/components/metrics/GoalAchievement";
import { MetricsTable } from "@/components/metrics/MetricsTable";
import {
  mockMetricOverview,
  mockMetricsGoalAchievement,
  mockCodeQualityMetrics,
} from "@/mocks/metrics.mock";
import { useMetricsStore } from "@/store/useMetricsStore";

const MetricsPage = () => {
  const {
    period,
    setPeriod,
    currentDate,
    setCurrentDate,
    isTargetValueSettingModalOpen,
    isAchievementRateSettingModalOpen,
  } = useMetricsStore((state) => state);

  // 목표값 설정/달성률 설정 모달이 열릴 때 body 스크롤 비활성화
  useEffect(() => {
    if (isTargetValueSettingModalOpen || isAchievementRateSettingModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // 목표값 설정/달성률 설정 팝업이 닫힐 때 원래대로 복원
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isTargetValueSettingModalOpen, isAchievementRateSettingModalOpen]);

  return (
    <div className="space-y-6">
      {/* 헤더 - 날짜 필터 */}
      <div>
        <Card className="w-full">
          <DateFilter
            period={period}
            onPeriodChange={setPeriod}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            showPdfButton={false}
          />
        </Card>
      </div>

      <div className="flex gap-6 md:h-[300px] lg:h-[330px]">
        {/* 지표 현황 */}
        <div className="w-2/3 h-full">
          <Card className="h-full w-full flex items-center">
            <MetricsSummary data={mockMetricOverview} />
          </Card>
        </div>

        {/* 목표 달성률 */}
        <div className="w-1/3 h-full">
          <Card className="w-full h-full">
            <GoalAchievement
              achieved={mockMetricsGoalAchievement.achievedMetrics}
              total={mockMetricsGoalAchievement.totalMetrics}
            />
          </Card>
        </div>
      </div>

      {/* 지표 리스트 */}
      <Card className="w-full">
        <MetricsTable metrics={mockCodeQualityMetrics} />
      </Card>
    </div>
  );
};

export default MetricsPage;
