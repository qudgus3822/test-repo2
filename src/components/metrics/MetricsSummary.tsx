import { AlertTriangle, BarChart3 } from "lucide-react";
import { CHANGE_COLORS, PALETTE_COLORS } from "@/styles/colors";
import { useMetricsOverview } from "@/api/hooks/useMetricsOverview";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface MetricsSummaryProps {
  month: string;
}

export const MetricsSummary = ({ month }: MetricsSummaryProps) => {
  const { data, isLoading, error } = useMetricsOverview(month);

  // 로딩, 에러, 데이터 없음 상태
  const hasNoData = !data;
  if (isLoading || error || hasNoData) {
    return (
      <div className="w-full h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">지표 현황</h3>
        <div className="flex-1 flex items-center justify-center">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="text-gray-500">수집된 데이터가 없습니다.</p>
          )}
        </div>
      </div>
    );
  }

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
      label: "개발효율",
      value: data.developmentEfficiencyCount,
      icon: BarChart3,
      iconColor: PALETTE_COLORS.purple,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">지표 현황</h3>
        <div className="flex items-start gap-1.5">
          <AlertTriangle
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: CHANGE_COLORS.emphasis }}
          />
          <p className="text-sm" style={{ color: CHANGE_COLORS.emphasis }}>
            지표 기준 설정에서 변경된 목표값•달성기준•비율 설정은 즉시 전체 화면에
            반영되며 해당 월 데이터는 변경 기준에 맞춰 모두 재집계됩니다.
          </p>
        </div>
      </div>
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
