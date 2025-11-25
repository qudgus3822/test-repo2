import { BarChart3 } from "lucide-react";
import { PALETTE_COLORS } from "@/styles/colors";
import type { MetricOverview } from "@/types/metrics.types";

interface MetricsSummaryProps {
  data: MetricOverview;
}

export const MetricsSummary = ({ data }: MetricsSummaryProps) => {
  const summaryItems = [
    {
      label: "전체 지표",
      value: data.totalMetrics,
      icon: BarChart3,
      iconColor: PALETTE_COLORS.darkBlue,
    },
    {
      label: "코드품질",
      value: data.codeQualityCount,
      icon: BarChart3,
      iconColor: PALETTE_COLORS.blue,
    },
    {
      label: "리뷰품질",
      value: data.reviewQualityCount,
      icon: BarChart3,
      iconColor: PALETTE_COLORS.orange,
    },
    {
      label: "개발 효율",
      value: data.developmentEfficiencyCount,
      icon: BarChart3,
      iconColor: PALETTE_COLORS.purple,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">지표 현황</h3>
      <div className="flex-1 flex items-center">
        <div className="w-full grid grid-cols-4 gap-4">
          {summaryItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div>
                  <Icon
                    className="w-10 h-10 flex-shrink-0"
                    style={{ color: item.iconColor }}
                  />
                </div>
                <div className="text-lg md:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 flex-shrink-0 whitespace-nowrap">
                  {item.value}개
                </div>
                <div className="text-md text-gray-600">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
