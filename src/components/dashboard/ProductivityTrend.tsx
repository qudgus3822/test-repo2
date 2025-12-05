import { useMemo } from "react";
import { LineChart, MULTI_LINE_COLORS } from "@/libs/chart";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useDeveloperProductivity } from "@/api/hooks/useDeveloperProductivity";

const chartColors = [...MULTI_LINE_COLORS];

const metrics = ["BDPI 평균", "코드 품질", "리뷰 품질", "개발 효율", "목표치"];

interface ProductivityTrendProps {
  month: string;
}

/**
 * 개발생산성 트렌드 차트 컴포넌트
 */
export const ProductivityTrend = ({ month }: ProductivityTrendProps) => {
  const {
    data: developerProductivityData,
    isLoading,
    error,
  } = useDeveloperProductivity(month);

  // 개발생산성 트렌드 데이터 가공
  const trendData = useMemo(
    () =>
      developerProductivityData
        ? developerProductivityData.trends.map((item) => {
            const [year, monthNum] = item.month.split("-");
            return {
              month: `${year}년 ${parseInt(monthNum)}월`, // '2025-05' -> '2025년 5월'
              "BDPI 평균": item.bdpiAverage,
              "코드 품질": item.codeQuality,
              "리뷰 품질": item.reviewQuality,
              "개발 효율": item.developmentEfficiency,
              "목표치": item.target,
            };
          })
        : [],
    [developerProductivityData],
  );

  // yAxisDomain 계산 (데이터의 최소값, 최대값)
  const yAxisDomain = useMemo((): [number, number] => {
    if (!trendData || trendData.length === 0) {
      return [0, 100];
    }

    const allValues = trendData.flatMap((item) =>
      metrics
        .map((metric) => item[metric as keyof typeof item])
        .filter((val) => val != null),
    );

    if (allValues.length === 0) {
      return [0, 100];
    }

    const dataMin = Math.min(...allValues.map(Number)) - 5;
    const dataMax = Math.max(...allValues.map(Number)) + 5;

    return [dataMin, dataMax];
  }, [trendData]);

  // 로딩, 에러, 데이터 없음 상태
  if (isLoading || error || !trendData || trendData.length === 0) {
    return (
      <Card className="w-full h-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          개발생산성 트렌드
        </h3>
        <div className="flex items-center justify-center min-h-[87px]">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="text-gray-500">수집된 데이터가 없습니다.</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        개발생산성 트렌드
      </h3>
      <LineChart
        data={trendData}
        xKey="month"
        yKeys={metrics}
        height={350}
        colors={chartColors}
        showLegend={true}
        showGrid={true}
        dashedKeys={["목표치"]}
        yAxisDomain={yAxisDomain}
      />
    </Card>
  );
};
