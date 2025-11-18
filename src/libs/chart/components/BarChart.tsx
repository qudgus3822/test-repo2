import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CHART_STYLES,
  CHART_MARGIN,
  MULTI_LINE_COLORS,
} from "../config";

interface DataPoint {
  [key: string]: string | number;
}

interface BarChartProps {
  data: DataPoint[];
  xKey: string;
  yKeys: string[];
  height?: number;
  colors?: readonly string[];
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
  horizontal?: boolean;
}

/**
 * 바 차트 컴포넌트
 * 카테고리별 비교, 월별 데이터 등을 표시하는데 사용
 */
export const BarChart = ({
  data,
  xKey,
  yKeys,
  height = 300,
  colors = MULTI_LINE_COLORS,
  showLegend = true,
  showGrid = true,
  stacked = false,
  horizontal = false,
}: BarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={CHART_MARGIN}
        layout={horizontal ? "vertical" : "horizontal"}
      >
        {showGrid && <CartesianGrid {...CHART_STYLES.grid} />}
        {horizontal ? (
          <>
            <XAxis type="number" style={CHART_STYLES.axis} />
            <YAxis dataKey={xKey} type="category" style={CHART_STYLES.axis} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} style={CHART_STYLES.axis} />
            <YAxis style={CHART_STYLES.axis} />
          </>
        )}
        <Tooltip
          contentStyle={CHART_STYLES.tooltip.contentStyle}
          labelStyle={CHART_STYLES.tooltip.labelStyle}
        />
        {showLegend && <Legend />}
        {yKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            stackId={stacked ? "1" : undefined}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
