import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { DateFilter, type PeriodType } from "@/components/ui/DateFilter";
import { MetricsSummary } from "@/components/metrics/MetricsSummary";
import { GoalAchievement } from "@/components/metrics/GoalAchievement";
import { MetricsTable } from "@/components/metrics/MetricsTable";
import {
  mockMetricOverview,
  mockMetricsGoalAchievement,
  mockCodeQualityMetrics,
} from "@/mocks/metrics.mock";

const MetricsPage = () => {
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [currentDate, setCurrentDate] = useState(new Date());

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
