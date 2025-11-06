import { TrendingUp } from "lucide-react";
import type { MetricOverview } from "@/types/metrics.types";

interface MetricsSummaryProps {
  data: MetricOverview;
}

export const MetricsSummary = ({ data }: MetricsSummaryProps) => {
  const summaryItems = [
    {
      label: "전체 지표",
      value: data.totalMetrics,
      percentage: 30,
    },
    {
      label: "코드분류",
      value: data.codeQualityCount,
      percentage: data.codeQualityRatio,
    },
    {
      label: "지표 분류",
      value: data.reviewQualityCount,
      percentage: data.reviewQualityRatio,
    },
    {
      label: "지표 등록",
      value: data.developmentEfficiencyCount,
      percentage: data.developmentEfficiencyRatio,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {summaryItems.map((item, index) => (
        <div key={index} className="p-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-blue-500">
              <TrendingUp size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {item.value}개
            </div>
            <div className="text-sm text-gray-600">{item.label}</div>
            <div className="text-sm font-semibold text-blue-600">
              {item.percentage}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
