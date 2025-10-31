import { CircularChart } from "@/libs/chart";

interface Metric {
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
  metrics: Metric[];
}

/**
 * 메트릭 개요 컴포넌트
 * 주요 지표들을 원형 차트로 표시
 */
export const MetricsOverview = ({ metrics }: MetricsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="bg-white p-6 rounded-lg border border-gray-200 flex items-center justify-center"
        >
          <CircularChart
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
  );
};
