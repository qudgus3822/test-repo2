import { useMemo } from "react";
import { LineChart, MULTI_LINE_COLORS } from "@/libs/chart";
import { Card } from "@/components/ui/Card";
import { useDeveloperProductivity } from "@/api/hooks/useDeveloperProductivity";

const chartColors = [...MULTI_LINE_COLORS];

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
              "개발 효율": item.developmentEfficiency,
              "리뷰 품질": item.reviewQuality,
              "BDPI 목표치": item.target,
              "코드 품질": item.codeQuality,
            };
          })
        : [],
    [developerProductivityData],
  );

  const metrics = ["BDPI 평균", "개발 효율", "리뷰 품질", "코드 품질", "목표치"];

  // 로딩 상태
  if (isLoading) {
    return (
      <Card className="w-full h-auto">
        <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card className="w-full">
        <p className="text-red-500">
          {error.message ||
            "개발 생산성 트렌드 데이터를 불러오는데 실패했습니다."}
        </p>
      </Card>
    );
  }

  // 데이터가 없는 경우
  if (!trendData || trendData.length === 0) {
    return (
      <Card className="w-full">
        <p className="text-gray-500">개발 생산성 트렌드 데이터가 없습니다.</p>
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
        yAxisDomain={[0, 100]}
      />
    </Card>
  );
};
