import {
  AreaChart as RechartsAreaChart,
  Area,
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

interface AreaChartProps {
  data: DataPoint[];
  xKey: string;
  yKeys: string[];
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
}

/**
 * 영역 차트 컴포넌트
 * 누적 데이터나 트렌드를 시각화하는데 사용
 */
export const AreaChart = ({
  data,
  xKey,
  yKeys,
  height = 300,
  colors = [CHART_COLORS.primary, CHART_COLORS.secondary],
  showLegend = true,
  showGrid = true,
  stacked = false,
}: AreaChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={CHART_MARGIN}>
        {showGrid && <CartesianGrid {...CHART_STYLES.grid} />}
        <XAxis dataKey={xKey} style={CHART_STYLES.axis} />
        <YAxis style={CHART_STYLES.axis} />
        <Tooltip
          contentStyle={CHART_STYLES.tooltip.contentStyle}
          labelStyle={CHART_STYLES.tooltip.labelStyle}
        />
        {showLegend && <Legend />}
        {yKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId={stacked ? "1" : undefined}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.6}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};
