import {
  MetricsOverview,
  TargetValueAchievement,
  ServiceStability,
  MetricsRanking,
  ProductivityTrend,
} from "@/components/dashboard";
import { CHART_COLORS } from "@/libs/chart";
import { DateFilter } from "@/components/ui/DateFilter";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GOAL_STATUS_COLORS, BRAND_COLORS } from "@/styles/colors";
import { useDashboardStore } from "@/store/useDashboardStore";
import { usePdfDownload } from "@/hooks";
import {
  useCompanyQuality,
  useServiceStability,
  useDeveloperProductivity,
  useGoalAchievement,
  useMetricRankings,
} from "@/api/hooks/useDashboard";

const DashboardPage = () => {
  const { period, setPeriod, currentDate, setCurrentDate } = useDashboardStore(
    (state) => state,
  );
  const { downloadPdf, isGenerating } = usePdfDownload();

  // 날짜를 YYYY-MM 형식으로 변환
  const formattedMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  // 모든 대시보드 데이터 조회
  const {
    data: companyQuality,
    isLoading: isLoadingCompanyQuality,
    error: errorCompanyQuality,
  } = useCompanyQuality(formattedMonth);
  const {
    data: serviceStability,
    isLoading: isLoadingServiceStability,
    error: errorServiceStability,
  } = useServiceStability(formattedMonth);
  const {
    data: developerProductivity,
    isLoading: isLoadingDeveloperProductivity,
    error: errorDeveloperProductivity,
  } = useDeveloperProductivity(formattedMonth);
  const {
    data: goalAchievement,
    isLoading: isLoadingGoalAchievement,
    error: errorGoalAchievement,
  } = useGoalAchievement(formattedMonth);
  const {
    data: metricRankings,
    isLoading: isLoadingMetricRankings,
    error: errorMetricRankings,
  } = useMetricRankings(formattedMonth);

  const handleDownload = () => {
    downloadPdf(
      "dashboard-content",
      "BarcodePlus_Monitoring_Dashboard_2025.pdf",
    );
  };

  // 전체 로딩 상태 확인
  const isLoading =
    isLoadingCompanyQuality ||
    isLoadingServiceStability ||
    isLoadingDeveloperProductivity ||
    isLoadingGoalAchievement ||
    isLoadingMetricRankings;

  // 에러 확인
  const error =
    errorCompanyQuality ||
    errorServiceStability ||
    errorDeveloperProductivity ||
    errorGoalAchievement ||
    errorMetricRankings;

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 발생 시 표시
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다: {error.message}
        </p>
      </div>
    );
  }

  // 데이터가 없을 때 표시
  if (
    !companyQuality ||
    !serviceStability ||
    !developerProductivity ||
    !goalAchievement ||
    !metricRankings
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>데이터가 없습니다.</p>
      </div>
    );
  }

  // 전사 BDPI 평균
  const bdpiAverage = {
    value: companyQuality.bdpiAverage,
    label: "전사 BDPI 평균",
    sublabel: "평균 확보율",
    color: BRAND_COLORS.secondary,
    trend: {
      value: Math.abs(companyQuality.bdpiChange),
      isPositive: companyQuality.bdpiChange > 0,
    },
  };

  // 차트 메트릭
  const chartMetrics = [
    {
      id: "code",
      value: companyQuality.codeQuality.score,
      label: "코드 품질",
      sublabel: `${companyQuality.codeQuality.achievedMetrics}/${companyQuality.codeQuality.totalMetrics}건 달성`,
      color: CHART_COLORS.blue,
    },
    {
      id: "review",
      value: companyQuality.reviewQuality.score,
      label: "리뷰 품질",
      sublabel: `${companyQuality.reviewQuality.achievedMetrics}/${companyQuality.reviewQuality.totalMetrics}건 달성`,
      color: CHART_COLORS.yellow,
    },
    {
      id: "efficiency",
      value: companyQuality.developmentEfficiency.score,
      label: "개발 효율",
      sublabel: `${companyQuality.developmentEfficiency.achievedMetrics}/${companyQuality.developmentEfficiency.totalMetrics}건 달성`,
      color: CHART_COLORS.orange,
    },
  ];

  // 서비스 안정성
  const stabilityMetrics = [
    {
      id: "deployment",
      label: serviceStability.deploymentFrequency.metricName,
      value: `${serviceStability.deploymentFrequency.value}회`,
      target: `${serviceStability.deploymentFrequency.targetValue}회`,
      trend: {
        value: Math.abs(serviceStability.deploymentFrequency.changeRate),
        isPositive: serviceStability.deploymentFrequency.changeRate > 0,
      },
      status: serviceStability.deploymentFrequency.threshold,
      iconColor:
        GOAL_STATUS_COLORS[serviceStability.deploymentFrequency.threshold],
    },
    {
      id: "success",
      label: serviceStability.deploymentSuccessRate.metricName,
      value: `${serviceStability.deploymentSuccessRate.value}%`,
      target: `${serviceStability.deploymentSuccessRate.targetValue}%`,
      trend: {
        value: Math.abs(serviceStability.deploymentSuccessRate.changeRate),
        isPositive: serviceStability.deploymentSuccessRate.changeRate > 0,
      },
      status: serviceStability.deploymentSuccessRate.threshold,
      iconColor:
        GOAL_STATUS_COLORS[serviceStability.deploymentSuccessRate.threshold],
    },
    {
      id: "mttr",
      label: serviceStability.mttr.metricName,
      value: `${serviceStability.mttr.value}시간`,
      target: `${serviceStability.mttr.targetValue}시간 이하`,
      trend: {
        value: Math.abs(serviceStability.mttr.changeRate),
        isPositive: serviceStability.mttr.changeRate > 0,
      },
      status: serviceStability.mttr.threshold,
      iconColor: GOAL_STATUS_COLORS[serviceStability.mttr.threshold],
    },
    {
      id: "mttd",
      label: serviceStability.mttd.metricName,
      value: `${serviceStability.mttd.value}시간`,
      target: `${serviceStability.mttd.targetValue}시간 이하`,
      trend: {
        value: Math.abs(serviceStability.mttd.changeRate),
        isPositive: serviceStability.mttd.changeRate > 0,
      },
      status: serviceStability.mttd.threshold,
      iconColor: GOAL_STATUS_COLORS[serviceStability.mttd.threshold],
    },
    {
      id: "incidents",
      label: serviceStability.incidentCount.metricName,
      value: `${serviceStability.incidentCount.value}건`,
      target: `${serviceStability.incidentCount.targetValue}건 이하`,
      trend: {
        value: Math.abs(serviceStability.incidentCount.changeRate),
        isPositive: serviceStability.incidentCount.changeRate > 0,
      },
      status: serviceStability.incidentCount.threshold,
      iconColor: GOAL_STATUS_COLORS[serviceStability.incidentCount.threshold],
    },
  ];

  // 우수 지표
  const topGainers =
    metricRankings.growth?.map((item) => ({
      rank: item.rank,
      name: item.metricName,
      change: item.changeRate,
    })) || [];

  // 위험 지표
  const topLosers =
    metricRankings.warning?.map((item) => ({
      rank: item.rank,
      name: item.metricName,
      change: item.changeRate,
    })) || [];

  // 개발생산성 트렌드
  const trendData = developerProductivity.trends.map((item) => {
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
          <Card className="w-full h-auto">
            {/* 목표 달성률  */}
            <TargetValueAchievement
              achieved={goalAchievement.achievedMetrics}
              total={goalAchievement.totalMetrics}
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
