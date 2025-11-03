import { DonutChart } from "@/libs/chart";
import { Info } from "lucide-react";

interface BdpiAverage {
  value: number;
  label: string;
  sublabel: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface ChartMetric {
  id: string;
  value: number;
  label: string;
  sublabel: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface MetricsOverviewProps {
  bdpiAverage: BdpiAverage;
  chartMetrics: ChartMetric[];
}

/**
 * 메트릭 개요 컴포넌트
 * 전사 BDPI 평균(텍스트)과 주요 지표들(도넛 차트)을 표시
 */
export const MetricsOverview = ({
  bdpiAverage,
  chartMetrics,
}: MetricsOverviewProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-[#E2E8F0]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 전사 BDPI 평균 (텍스트 표시) */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center w-full">
            <div className="text-center mb-2">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {bdpiAverage.value}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-gray-700">
                  {bdpiAverage.label}
                </div>
                <Info
                  className="w-4 h-4"
                  style={{ color: bdpiAverage.color }}
                />
              </div>
            </div>
            {bdpiAverage.trend && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  bdpiAverage.trend.isPositive
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <span>{bdpiAverage.trend.isPositive ? "↑" : "↓"}</span>
                <span>{Math.abs(bdpiAverage.trend.value)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* 차트 메트릭 (도넛 차트 표시) */}
        {chartMetrics.map((metric) => (
          <div key={metric.id} className="flex items-center justify-center">
            <DonutChart
              value={metric.value}
              maxValue={100}
              color={metric.color}
              label={metric.label}
              sublabel={metric.sublabel}
              trend={metric.trend}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
