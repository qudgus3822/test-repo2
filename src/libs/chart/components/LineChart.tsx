import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, CHART_STYLES, CHART_MARGIN } from "../config";

interface DataPoint {
  [key: string]: string | number;
}

interface LineChartProps {
  data: DataPoint[];
  xKey: string;
  yKeys: string[];
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  dashedKeys?: string[]; // 점선으로 표시할 key 배열
  dashedColor?: string; // 점선 색상 (기본값: 회색)
}

/**
 * 라인차트 컴포넌트
 * 시계열 데이터, 지수 추이 등을 표시하는데 사용
 */
export const LineChart = ({
  data,
  xKey,
  yKeys,
  height = 300,
  colors = [CHART_COLORS.primary, CHART_COLORS.secondary],
  showLegend = true,
  showGrid = true,
  dashedKeys = [],
  dashedColor = "#9CA3AF", // gray-400
}: LineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={CHART_MARGIN}>
        {showGrid && <CartesianGrid {...CHART_STYLES.grid} />}
        <XAxis dataKey={xKey} style={CHART_STYLES.axis} />
        <YAxis style={CHART_STYLES.axis} />
        <Tooltip
          contentStyle={CHART_STYLES.tooltip.contentStyle}
          labelStyle={CHART_STYLES.tooltip.labelStyle}
        />
        {showLegend && <Legend />}
        {yKeys.map((key, index) => {
          const isDashed = dashedKeys.includes(key);
          return (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={isDashed ? dashedColor : colors[index % colors.length]}
              strokeWidth={2}
              strokeDasharray={isDashed ? "5 5" : undefined}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          );
        })}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};
