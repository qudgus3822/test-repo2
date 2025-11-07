import {
  MetricsOverview,
  GoalAchievement,
  ServiceStability,
  MetricsRanking,
  ProductivityTrend,
} from "@/components/dashboard";
import { CHART_COLORS } from "@/libs/chart";
import { DateFilter } from "@/components/ui/DateFilter";
import { Card } from "@/components/ui/Card";
import { GOAL_STATUS_COLORS, BRAND_COLORS } from "@/styles/colors";
import {
  mockCompanyQuality,
  mockServiceStability,
  mockProductionTrend,
  mockGoalAchievement,
  mockMetricRankings,
} from "@/api/mocks/dashboard";
import { useDashboardStore } from "@/store/useDashboardStore";

const DashboardPage = () => {
  const { period, setPeriod, currentDate, setCurrentDate } = useDashboardStore(
    (state) => state,
  );

  // 전사 BDPI 평균 (목업 데이터 사용)
  const bdpiAverage = {
    value: mockCompanyQuality.bdpiAverage,
    label: "전사 BDPI 평균",
    sublabel: "평균 확보율",
    color: BRAND_COLORS.secondary,
    trend: {
      value: Math.abs(mockCompanyQuality.bdpiChange),
      isPositive: mockCompanyQuality.bdpiChange > 0,
    },
  };

  // 차트 메트릭 (목업 데이터 사용)
  const chartMetrics = [
    {
      id: "code",
      value: mockCompanyQuality.codeQuality.score,
      label: "코드 품질",
      sublabel: `${mockCompanyQuality.codeQuality.achievedMetrics}/${mockCompanyQuality.codeQuality.totalMetrics}건 달성`,
      color: CHART_COLORS.success,
    },
    {
      id: "review",
      value: mockCompanyQuality.reviewQuality.score,
      label: "리뷰 품질",
      sublabel: `${mockCompanyQuality.reviewQuality.achievedMetrics}/${mockCompanyQuality.reviewQuality.totalMetrics}건 달성`,
      color: CHART_COLORS.warning,
    },
    {
      id: "efficiency",
      value: mockCompanyQuality.developmentEfficiency.score,
      label: "개발 효율",
      sublabel: `${mockCompanyQuality.developmentEfficiency.achievedMetrics}/${mockCompanyQuality.developmentEfficiency.totalMetrics}건 달성`,
      color: CHART_COLORS.info,
    },
  ];

  // 서비스 안정성 (목업 데이터 사용)
  const stabilityMetrics = [
    {
      id: "deployment",
      label: mockServiceStability.deploymentFrequency.metricName,
      value: `${mockServiceStability.deploymentFrequency.value}회`,
      target: `${mockServiceStability.deploymentFrequency.targetValue}회`,
      trend: {
        value: Math.abs(mockServiceStability.deploymentFrequency.changeRate),
        isPositive: mockServiceStability.deploymentFrequency.changeRate > 0,
      },
      status: mockServiceStability.deploymentFrequency.threshold,
      iconColor:
        GOAL_STATUS_COLORS[mockServiceStability.deploymentFrequency.threshold],
    },
    {
      id: "success",
      label: mockServiceStability.deploymentSuccessRate.metricName,
      value: `${mockServiceStability.deploymentSuccessRate.value}%`,
      target: `${mockServiceStability.deploymentSuccessRate.targetValue}%`,
      trend: {
        value: Math.abs(mockServiceStability.deploymentSuccessRate.changeRate),
        isPositive: mockServiceStability.deploymentSuccessRate.changeRate > 0,
      },
      status: mockServiceStability.deploymentSuccessRate.threshold,
      iconColor:
        GOAL_STATUS_COLORS[
          mockServiceStability.deploymentSuccessRate.threshold
        ],
    },
    {
      id: "mttr",
      label: mockServiceStability.mttr.metricName,
      value: `${mockServiceStability.mttr.value}시간`,
      target: `${mockServiceStability.mttr.targetValue}시간 이하`,
      trend: {
        value: Math.abs(mockServiceStability.mttr.changeRate),
        isPositive: mockServiceStability.mttr.changeRate > 0,
      },
      status: mockServiceStability.mttr.threshold,
      iconColor: GOAL_STATUS_COLORS[mockServiceStability.mttr.threshold],
    },
    {
      id: "mttd",
      label: mockServiceStability.mttd.metricName,
      value: `${mockServiceStability.mttd.value}시간`,
      target: `${mockServiceStability.mttd.targetValue}시간 이하`,
      trend: {
        value: Math.abs(mockServiceStability.mttd.changeRate),
        isPositive: mockServiceStability.mttd.changeRate > 0,
      },
      status: mockServiceStability.mttd.threshold,
      iconColor: GOAL_STATUS_COLORS[mockServiceStability.mttd.threshold],
    },
    {
      id: "incidents",
      label: mockServiceStability.incidentCount.metricName,
      value: `${mockServiceStability.incidentCount.value}건`,
      target: `${mockServiceStability.incidentCount.targetValue}건 이하`,
      trend: {
        value: Math.abs(mockServiceStability.incidentCount.changeRate),
        isPositive: mockServiceStability.incidentCount.changeRate > 0,
      },
      status: mockServiceStability.incidentCount.threshold,
      iconColor:
        GOAL_STATUS_COLORS[mockServiceStability.incidentCount.threshold],
    },
  ];

  // 우수 지표 (목업 데이터 사용)
  const topGainers = mockMetricRankings.growth.map((item) => ({
    rank: item.rank,
    name: item.metricName,
    change: item.changeRate,
  }));

  // 위험 지표 (목업 데이터 사용)
  const topLosers = mockMetricRankings.warning.map((item) => ({
    rank: item.rank,
    name: item.metricName,
    change: item.changeRate,
  }));

  // 개발생산성 트렌드 (목업 데이터 사용)
  const trendData = mockProductionTrend.trendData.map((item) => {
    const [year, month] = item.month.split("-");
    return {
      month: `${year}년 ${parseInt(month)}월`, // '2025-05' -> '2025년 5월'
      "BDPI 평균": item.bdpiAverage,
      "개발 효율": item.developmentEfficiency,
      "리뷰 품질": item.reviewQuality,
      "BDPI 목표치": item.target,
      "코드 품질": item.codeQuality,
    };
  });

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
          />
        </Card>
      </div>

      <div className="flex gap-6">
        <div className="w-2/3 space-y-6">
          {/* 메트릭 개요 */}
          <MetricsOverview
            bdpiAverage={bdpiAverage}
            chartMetrics={chartMetrics}
          />
          {/* 서비스 안정성 */}
          <ServiceStability metrics={stabilityMetrics} />

          {/* 개발생산성 트렌드 */}
          <ProductivityTrend
            data={trendData}
            metrics={[
              "BDPI 평균",
              "개발 효율",
              "리뷰 품질",
              "코드 품질",
              "목표치",
            ]}
          />
        </div>

        <div className="w-1/3">
          <Card className="w-full h-full">
            {/* 목표 달성률 */}
            <GoalAchievement
              achieved={mockGoalAchievement.achievedMetrics}
              total={mockGoalAchievement.totalMetrics}
            />

            {/* 구분선-수평선 */}
            <div className="border-t border-[#E2E8F0] my-6"></div>

            {/* 지표 순위 */}
            <MetricsRanking topGainers={topGainers} topLosers={topLosers} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
