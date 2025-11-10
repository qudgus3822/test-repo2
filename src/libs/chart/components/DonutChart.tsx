import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TREND_COLORS, PALETTE_COLORS } from "@/styles/colors";

interface DonutChartProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * 도넛 차트 컴포넌트
 * 중앙에 값을 표시하는 도넛 형태의 차트
 */
export const DonutChart = ({
  value,
  maxValue = 100,
  size = 160,
  strokeWidth = 16,
  color = PALETTE_COLORS.blue, // #1E54B8
  backgroundColor = "#e5e7eb",
  label,
  sublabel,
  showPercentage = false,
  trend,
}: DonutChartProps) => {
  const percentage = (value / maxValue) * 100;
  const data = [
    { name: "value", value: value },
    { name: "remaining", value: maxValue - value },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={size / 2 - strokeWidth}
              outerRadius={size / 2}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill={backgroundColor} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* 중앙 값 표시 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900">
            {showPercentage ? `${percentage.toFixed(1)}%` : value.toFixed(1)}
          </div>
          {trend && (
            <div
              className="flex items-center gap-1 text-sm font-medium"
              style={{
                color: trend.isPositive
                  ? TREND_COLORS.increase
                  : TREND_COLORS.decrease,
              }}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* 라벨 */}
      {label && (
        <div className="mt-3 text-center">
          <div className="text-sm font-medium text-gray-900">{label}</div>
          {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
        </div>
      )}
    </div>
  );
};
