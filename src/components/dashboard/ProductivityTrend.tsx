import { LineChart, MULTI_LINE_COLORS } from "@/libs/chart";
import { Card } from "@/components/ui/Card";

const chartColors = [...MULTI_LINE_COLORS];

interface DataPoint {
  month: string;
  [key: string]: string | number;
}

interface ProductivityTrendProps {
  data: DataPoint[];
  metrics: string[];
}

/**
 * 개발생산성 트렌드 차트 컴포넌트
 */
export const ProductivityTrend = ({
  data,
  metrics,
}: ProductivityTrendProps) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        개발생산성 트렌드
      </h3>
      <LineChart
        data={data}
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
