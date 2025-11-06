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
      <Card>
        <DateFilter
          period={period}
          onPeriodChange={setPeriod}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          showPdfButton={false}
        />
      </Card>

      <div className="flex gap-6">
        {/* 지표 현황 */}
        <div className="w-2/3 space-y-6">
          <Card>
            <MetricsSummary data={mockMetricOverview} />
          </Card>
        </div>

        {/* 목표 달성률 */}
        <div className="w-1/3 space-y-6">
          <GoalAchievement
            achieved={mockMetricsGoalAchievement.achievedMetrics}
            total={mockMetricsGoalAchievement.totalMetrics}
          />
        </div>
      </div>

      {/* 지표 리스트 */}
      <MetricsTable metrics={mockCodeQualityMetrics} />
    </div>
  );
};

export default MetricsPage;
