import { useMemo } from "react";
import { DonutChart } from "@/libs/chart";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TREND_COLORS, BRAND_COLORS, CHART_COLORS } from "@/styles/colors";
import downIcon from "@/assets/icons/down_icon_red.svg";
import upIcon from "@/assets/icons/up_icon_green.svg";
import { useCompanyQuality } from "@/api/hooks/useCompanyQuality";
import { Tooltip } from "../ui/Tooltip";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface MetricsOverviewProps {
  month: string; // YYYY-MM 형식
}

/**
 * 메트릭 개요 컴포넌트
 * 전사 BDPI 평균(텍스트)과 주요 지표들(도넛 차트)을 표시
 */
export const MetricsOverview = ({ month }: MetricsOverviewProps) => {
  // React Query로 전사 BDPI 데이터 조회
  const {
    data: companyQualityData,
    isLoading,
    error,
  } = useCompanyQuality(month);

  // 전사 BDPI 평균 계산
  const bdpiAverage = useMemo(
    () =>
      companyQualityData
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
        : null,
    [companyQualityData],
  );

  // 차트 메트릭 계산
  const chartMetrics = useMemo(
    () =>
      companyQualityData
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
              color: CHART_COLORS.lightYellow,
            },
          ]
        : null,
    [companyQualityData],
  );

  // 로딩, 에러, 데이터 없음 상태
  if (isLoading || error || !bdpiAverage || !chartMetrics) {
    return (
      <Card className="w-full h-auto">
        <div className="flex items-center justify-center h-40">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="text-gray-500">수집된 전사 BDPI 데이터가 없습니다.</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 전사 BDPI 평균 (텍스트 표시) */}
        <div className="flex items-center justify-center border-r border-[#E2E8F0] pr-6">
          <div className="flex flex-col items-center w-full">
            <div className="text-center mb-2">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {bdpiAverage.value}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-gray-700">
                  {bdpiAverage.label}
                </div>
                <Tooltip
                  content={
                    "BDPI는 코드품질, 리뷰품질, 개발효율의 점수를 동일 가중치로 평균한 지표입니다."
                  }
                  color="#6B7280"
                  maxWidth={250}
                  arrowPosition="top-[15px]"
                >
                  <Info
                    className="w-4 h-4 cursor-pointer"
                    style={{ color: bdpiAverage.color }}
                  />
                </Tooltip>
              </div>
            </div>
            {bdpiAverage.trend && (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-700">
                  전월대비
                </span>
                <div
                  className="flex items-center gap-1 text-sm font-medium"
                  style={{
                    color: bdpiAverage.trend.isPositive
                      ? TREND_COLORS.increase
                      : TREND_COLORS.decrease,
                  }}
                >
                  <span>
                    {bdpiAverage.trend.isPositive ? (
                      <img src={upIcon} alt="up" />
                    ) : (
                      <img src={downIcon} alt="down" />
                    )}
                  </span>
                  <span>{Math.abs(bdpiAverage.trend.value)}%</span>
                </div>
              </div>
            )}{" "}
          </div>
        </div>

        {/* 차트 메트릭 (도넛 차트 표시) */}
        {chartMetrics.map((metric) => (
          <div key={metric.id} className="flex items-center justify-center">
            <DonutChart
              value={metric.value}
              maxValue={100}
              color={metric.color}
              label={metric.label}
              sublabel={metric.sublabel}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
