import { useId } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Info } from "lucide-react";
import { TREND_COLORS, CHART_COLORS } from "@/styles/colors";
import { Tooltip } from "@/components/ui/Tooltip";

// 그라데이션 설정 타입
interface GradientConfig {
  startColor: string;
  endColor: string;
  id?: string;
}

interface DonutChartProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradient?: GradientConfig;
  backgroundColor?: string;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  /** 데이터가 없을 때 표시할 라벨 (예: "-%") */
  noDataLabel?: string;
  /** [변경: 2026-01-27 15:00, 임도휘 수정] 라벨 옆 인포메이션 툴팁 내용 */
  labelTooltip?: string;
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
  color = CHART_COLORS.blue, // #1E54B8
  gradient,
  backgroundColor = "#e5e7eb",
  label,
  sublabel,
  showPercentage = false,
  trend,
  noDataLabel,
  labelTooltip,
}: DonutChartProps) => {
  const uniqueId = useId();
  const percentage = (value / maxValue) * 100;
  const clampedValue = Math.min(value, maxValue);
  const data = [
    { name: "value", value: clampedValue },
    { name: "remaining", value: maxValue - clampedValue },
  ];

  // 그라데이션 ID 생성 (React useId 사용으로 SSR 호환 및 고유성 보장)
  const gradientId = gradient?.id || `donut-gradient${uniqueId}`;
  const fillColor = gradient ? `url(#${gradientId})` : color;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
          <PieChart width={size} height={size}>
            {/* 그라데이션 정의 */}
            {gradient && (
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={gradient.startColor} />
                  <stop offset="100%" stopColor={gradient.endColor} />
                </linearGradient>
              </defs>
            )}
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
              <Cell fill={fillColor} />
              <Cell fill={backgroundColor} />
            </Pie>
          </PieChart>

        {/* 중앙 값 표시 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900">
            {noDataLabel
              ? noDataLabel
              : showPercentage
                ? `${percentage.toFixed(1)}%`
                : value.toFixed(1)}
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
          {/* [변경: 2026-01-27 15:00, 임도휘 수정] 라벨 옆 인포메이션 툴팁 추가 */}
          {/* [변경: 2026-01-27 15:20, 임도휘 수정] 도넛차트와 라벨 중앙 정렬 (툴팁 아이콘 제외) */}
          <div className="relative inline-flex items-center">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            {labelTooltip && (
              <span className="absolute left-full ml-1 flex items-center">
                <Tooltip content={labelTooltip} color="#6B7280" maxWidth={340} direction="bottom">
                  <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                </Tooltip>
              </span>
            )}
          </div>
          {sublabel && (
            <div className="flex justify-center">
              <span className="text-xs text-gray-500">{sublabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
