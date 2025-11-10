import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_STYLES, MULTI_LINE_COLORS } from "../config";

interface DataPoint {
  [key: string]: string | number;
}

interface RadarChartProps {
  data: DataPoint[];
  angleKey: string;
  dataKeys: string[];
  height?: number;
  colors?: readonly string[];
  showLegend?: boolean;
}

/**
 * 레이더(다각형) 차트 컴포넌트
 * 여러 지표를 다각형 모양으로 비교하는데 사용
 */
export const RadarChart = ({
  data,
  angleKey,
  dataKeys,
  height = 400,
  colors = MULTI_LINE_COLORS,
  showLegend = true,
}: RadarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={data}>
        <PolarGrid stroke={CHART_STYLES.grid.stroke} />
        <PolarAngleAxis dataKey={angleKey} style={CHART_STYLES.axis} />
        <PolarRadiusAxis style={CHART_STYLES.axis} />
        <Tooltip
          contentStyle={CHART_STYLES.tooltip.contentStyle}
          labelStyle={CHART_STYLES.tooltip.labelStyle}
        />
        {showLegend && <Legend />}
        {dataKeys.map((key, index) => (
          <Radar
            key={key}
            name={key}
            dataKey={key}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.6}
          />
        ))}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};
