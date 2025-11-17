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
import { usePdfDownload, useDashboardDataFetch } from "@/hooks";

const DashboardPage = () => {
  const {
    period,
    setPeriod,
    currentDate,
    setCurrentDate,
    companyQualityData,
    serviceStabilityData,
    developerProductivityData,
    goalAchievementData,
    metricRankingsData,
    isLoading,
    errors,
  } = useDashboardStore((state) => state);
  const { downloadPdf, isGenerating } = usePdfDownload();

  // 날짜를 YYYY-MM 형식으로 변환
  const formattedMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  // 대시보드 데이터 fetch (custom hook으로 분리)
  useDashboardDataFetch(formattedMonth);

  const handleDownload = () => {
    downloadPdf(
      "dashboard-content",
      "BarcodePlus_Monitoring_Dashboard_2025.pdf",
    );
  };

  // 초기 로딩 중일 때 표시
  if (isLoading && !companyQualityData.month) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 전사 BDPI 평균 (store의 companyQualityData 사용)
  const bdpiAverage = companyQualityData.month
    ? {
        value: companyQualityData.bdpiAverage,
        label: "전사 BDPI 평균",
        sublabel: "평균 확보율",
        color: BRAND_COLORS.secondary,
        trend: {
          value: Math.abs(companyQualityData.bdpiChange),
          isPositive: companyQualityData.bdpiChange > 0,
        },
      }
    : null;

  // 차트 메트릭 (store의 companyQualityData 사용)
  const chartMetrics = companyQualityData.month
    ? [
        {
          id: "code",
          value: companyQualityData.codeQuality.score,
          label: "코드 품질",
          sublabel: `${companyQualityData.codeQuality.achievedMetrics}/${companyQualityData.codeQuality.totalMetrics}건 달성`,
          color: CHART_COLORS.blue,
        },
        {
          id: "review",
          value: companyQualityData.reviewQuality.score,
          label: "리뷰 품질",
          sublabel: `${companyQualityData.reviewQuality.achievedMetrics}/${companyQualityData.reviewQuality.totalMetrics}건 달성`,
          color: CHART_COLORS.yellow,
        },
        {
          id: "efficiency",
          value: companyQualityData.developmentEfficiency.score,
          label: "개발 효율",
          sublabel: `${companyQualityData.developmentEfficiency.achievedMetrics}/${companyQualityData.developmentEfficiency.totalMetrics}건 달성`,
          color: CHART_COLORS.orange,
        },
      ]
    : null;

  // 서비스 안정성 (store의 serviceStabilityData 사용)
  const stabilityMetrics = serviceStabilityData
    ? [
        {
          id: "deployment",
          label: serviceStabilityData.deploymentFrequency.metricName,
          value: `${serviceStabilityData.deploymentFrequency.value}회`,
          target: `${serviceStabilityData.deploymentFrequency.targetValue}회`,
          trend: {
            value: Math.abs(
              serviceStabilityData.deploymentFrequency.changeRate,
            ),
            isPositive:
              serviceStabilityData.deploymentFrequency.changeRate > 0,
          },
          status: serviceStabilityData.deploymentFrequency.threshold,
          iconColor:
            GOAL_STATUS_COLORS[
              serviceStabilityData.deploymentFrequency.threshold
            ],
        },
        {
          id: "success",
          label: serviceStabilityData.deploymentSuccessRate.metricName,
          value: `${serviceStabilityData.deploymentSuccessRate.value}%`,
          target: `${serviceStabilityData.deploymentSuccessRate.targetValue}%`,
          trend: {
            value: Math.abs(
              serviceStabilityData.deploymentSuccessRate.changeRate,
            ),
            isPositive:
              serviceStabilityData.deploymentSuccessRate.changeRate > 0,
          },
          status: serviceStabilityData.deploymentSuccessRate.threshold,
          iconColor:
            GOAL_STATUS_COLORS[
              serviceStabilityData.deploymentSuccessRate.threshold
            ],
        },
        {
          id: "mttr",
          label: serviceStabilityData.mttr.metricName,
          value: `${serviceStabilityData.mttr.value}시간`,
          target: `${serviceStabilityData.mttr.targetValue}시간 이하`,
          trend: {
            value: Math.abs(serviceStabilityData.mttr.changeRate),
            isPositive: serviceStabilityData.mttr.changeRate > 0,
          },
          status: serviceStabilityData.mttr.threshold,
          iconColor: GOAL_STATUS_COLORS[serviceStabilityData.mttr.threshold],
        },
        {
          id: "mttd",
          label: serviceStabilityData.mttd.metricName,
          value: `${serviceStabilityData.mttd.value}시간`,
          target: `${serviceStabilityData.mttd.targetValue}시간 이하`,
          trend: {
            value: Math.abs(serviceStabilityData.mttd.changeRate),
            isPositive: serviceStabilityData.mttd.changeRate > 0,
          },
          status: serviceStabilityData.mttd.threshold,
          iconColor: GOAL_STATUS_COLORS[serviceStabilityData.mttd.threshold],
        },
        {
          id: "incidents",
          label: serviceStabilityData.incidentCount.metricName,
          value: `${serviceStabilityData.incidentCount.value}건`,
          target: `${serviceStabilityData.incidentCount.targetValue}건 이하`,
          trend: {
            value: Math.abs(serviceStabilityData.incidentCount.changeRate),
            isPositive: serviceStabilityData.incidentCount.changeRate > 0,
          },
          status: serviceStabilityData.incidentCount.threshold,
          iconColor:
            GOAL_STATUS_COLORS[serviceStabilityData.incidentCount.threshold],
        },
      ]
    : null;

  // 우수 지표 (store의 metricRankingsData 사용)
  const topGainers = metricRankingsData?.growth
    ? metricRankingsData.growth.map((item) => ({
        rank: item.rank,
        name: item.metricName,
        change: item.changeRate,
      }))
    : [];

  // 위험 지표 (store의 metricRankingsData 사용)
  const topLosers = metricRankingsData?.warning
    ? metricRankingsData.warning.map((item) => ({
        rank: item.rank,
        name: item.metricName,
        change: item.changeRate,
      }))
    : [];

  // 개발생산성 트렌드 (store의 developerProductivityData 사용)
  const trendData = developerProductivityData
    ? developerProductivityData.trends.map((item) => {
        const [year, month] = item.month.split("-");
        return {
          month: `${year}년 ${parseInt(month)}월`, // '2025-05' -> '2025년 5월'
          "BDPI 평균": item.bdpiAverage,
          "개발 효율": item.developmentEfficiency,
          "리뷰 품질": item.reviewQuality,
          "BDPI 목표치": item.target,
          "코드 품질": item.codeQuality,
        };
      })
    : null;

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
          {errors.companyQuality ? (
            <Card className="w-full">
              <p className="text-red-500">{errors.companyQuality}</p>
            </Card>
          ) : (
            bdpiAverage &&
            chartMetrics && (
              <MetricsOverview
                bdpiAverage={bdpiAverage}
                chartMetrics={chartMetrics}
              />
            )
          )}

          {/* 서비스 안정성 */}
          {errors.serviceStability ? (
            <Card className="w-full">
              <p className="text-red-500">{errors.serviceStability}</p>
            </Card>
          ) : (
            stabilityMetrics && <ServiceStability metrics={stabilityMetrics} />
          )}

          {/* 개발생산성 트렌드 */}
          {errors.developerProductivity ? (
            <Card className="w-full">
              <p className="text-red-500">{errors.developerProductivity}</p>
            </Card>
          ) : (
            trendData && (
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
            )
          )}
        </div>

        <div className="w-1/3">
          <Card className="w-full h-auto">
            {/* 목표 달성률  */}
            {errors.goalAchievement ? (
              <p className="text-red-500">{errors.goalAchievement}</p>
            ) : (
              goalAchievementData && (
                <TargetValueAchievement
                  achieved={goalAchievementData.achievedMetrics}
                  total={goalAchievementData.totalMetrics}
                />
              )
            )}

            {/* 구분선-수평선 */}
            {!errors.goalAchievement &&
              !errors.metricRankings &&
              goalAchievementData &&
              (topGainers.length > 0 || topLosers.length > 0) && (
                <div className="border-t border-[#E2E8F0] my-6"></div>
              )}

            {/* 지표 순위 */}
            {errors.metricRankings ? (
              <p className="text-red-500">{errors.metricRankings}</p>
            ) : (
              (topGainers.length > 0 || topLosers.length > 0) && (
                <MetricsRanking topGainers={topGainers} topLosers={topLosers} />
              )
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
