import { useMemo } from "react";
import { LineChart, MULTI_LINE_COLORS } from "@/libs/chart";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useDeveloperProductivity } from "@/api/hooks/useDeveloperProductivity";

const chartColors = [...MULTI_LINE_COLORS];

const metrics = ["BDPI 평균", "코드품질", "리뷰품질", "개발효율", "목표치"];

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

  // 최근 6개월 날짜 생성 함수
  const generateLast6Months = (baseMonth: string) => {
    const [year, monthNum] = baseMonth.split("-").map(Number);
    const months: string[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(year, monthNum - 1 - i, 1);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      months.push(`${y}-${m}`);
    }

    return months;
  };

  // 개발생산성 트렌드 데이터 가공 (최근 6개월, 없는 데이터는 0으로 채움)
  const trendData = useMemo(() => {
    const last6Months = generateLast6Months(month);

    // API 데이터를 month 기준으로 맵핑
    const dataMap = new Map(
      developerProductivityData?.map((item) => [item.month, item]) ?? [],
    );

    return last6Months.map((monthKey) => {
      const [year, monthNum] = monthKey.split("-");
      const item = dataMap.get(monthKey);
      const hasData = !!item;

      return {
        month: `${year}년 ${parseInt(monthNum)}월`,
        "BDPI 평균": item?.bdpiAverage,
        "코드품질": item?.quality,
        "리뷰품질": item?.review,
        "개발효율": item?.efficiency,
        "목표치": item?.target,
        _hasData: hasData, // 데이터 존재 여부 플래그
      };
    });
  }, [developerProductivityData, month]);

  // 툴팁 값 포맷터 (데이터 없는 경우 "-" 표시)
  const tooltipValueFormatter = (
    value: number,
    _key: string,
    dataPoint: Record<string, string | number | boolean | undefined>,
  ) => {
    if (!dataPoint._hasData) {
      return "-";
    }
    return value === 0 ? "-" : value;
  };

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
        <div className="grid grid-cols-1 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            개발생산성 트렌드
          </h3>
          <div className="flex items-center justify-center min-h-[87px]">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <p className="text-gray-500">수집된 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-auto">
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
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
          tooltipValueFormatter={tooltipValueFormatter}
        />
      </div>
    </Card>
  );
};
