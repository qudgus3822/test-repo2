import { useMemo } from "react";
import { Info, Settings } from "lucide-react";
import type { MetricItem } from "@/types/metrics.types";
import { MetricCategory } from "@/types/metrics.types";
import {
  getCategoryLabel,
  getStatusIcon,
  getStatusColor,
  calculateMetricStatus,
} from "@/utils/metrics";
import { PALETTE_COLORS } from "@/styles/colors";
import { Tooltip } from "@/components/ui/Tooltip";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/**
 * 설정 타입
 * - targetValue: 목표값 설정 (TargetValueSetting 컴포넌트)
 * - achievementRate: 달성률 설정 (AchievementRateSetting 컴포넌트)
 * - ratio: 비율 설정 (RatioSetting 컴포넌트)
 */
export type SettingType = "targetValue" | "achievementRate" | "ratio";

// 범주별 스타일 정의
const getCategoryStyle = (category: MetricCategory) => {
  switch (category) {
    case MetricCategory.CODE_QUALITY:
      return {
        color: PALETTE_COLORS.blue,
        borderColor: PALETTE_COLORS.blue,
      };
    case MetricCategory.REVIEW_QUALITY:
      return {
        color: PALETTE_COLORS.orange,
        borderColor: PALETTE_COLORS.orange,
      };
    case MetricCategory.DEVELOPMENT_EFFICIENCY:
      return {
        color: PALETTE_COLORS.purple,
        borderColor: PALETTE_COLORS.purple,
      };
    default:
      return {
        color: "#6B7280",
        borderColor: "#D1D5DB",
        bgColor: "#F9FAFB",
      };
  }
};

interface MetricsPreviewTableProps {
  /** 지표 데이터 목록 */
  metrics: MetricItem[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 달성률 우수 기준값 */
  excellentThreshold?: number;
  /** 달성률 위험 기준값 */
  dangerThreshold?: number;
  /** 설정 버튼 클릭 콜백 */
  onSettingClick?: (settingType: SettingType) => void;
}

export const MetricsPreviewTable = ({
  metrics,
  isLoading = false,
  excellentThreshold = 80,
  dangerThreshold = 70,
  onSettingClick,
}: MetricsPreviewTableProps) => {
  // 프론트에서 달성률 기준값에 따라 status 계산
  // [변경: 2026-01-14 12:00, 김병현 수정] useMemo로 감싸서 불필요한 재계산 방지
  const metricsWithCalculatedStatus = useMemo(
    () =>
      metrics.map((metric) => ({
        ...metric,
        status: calculateMetricStatus(
          metric.achievementRate,
          excellentThreshold,
          dangerThreshold,
        ),
      })),
    [metrics, excellentThreshold, dangerThreshold],
  );

  // 로딩 또는 데이터 없음 상태
  const isEmptyState = isLoading || metrics.length === 0;

  // [변경: 2026-01-19 00:45, 김병현 수정] 2중 스크롤 방지 - 부모 컨테이너에서 스크롤 처리
  return (
    <div className="h-full overflow-auto">
      {isEmptyState ? (
        <div className="flex items-center justify-center h-[200px]">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="text-gray-500">수집된 데이터가 없습니다.</p>
          )}
        </div>
      ) : (
        <table className="w-full">
          <thead
            className="sticky top-0 bg-white z-10"
            style={{ boxShadow: "inset 0 -1px 0 #e5e7eb" }}
          >
            <tr className="h-[45px] border-b border-gray-200 text-left text-sm font-medium text-gray-700">
              <th className="px-4 w-[25%]">지표명</th>
              <th className="px-4 w-[15%] text-center">범주</th>
              <th className="px-4 w-[15%]">현재값</th>
              <th className="px-4 w-[15%]">
                <div className="flex items-center gap-1.5">
                  목표값
                  <button
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => onSettingClick?.("targetValue")}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </th>
              <th className="px-4 w-[15%]">
                <div className="flex items-center gap-1.5">
                  달성률
                  <button
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => onSettingClick?.("achievementRate")}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </th>
              <th className="px-4 w-[15%]">
                <div className="flex items-center gap-1.5">
                  비율
                  <button
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => onSettingClick?.("ratio")}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {metricsWithCalculatedStatus.map((metric, index) => (
              <tr
                key={metric.metricCode || index}
                className="h-[51px] border-b border-gray-100 hover:bg-gray-50 whitespace-nowrap"
              >
                <td className="px-4 text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span>{metric.name}</span>
                    {metric.tooltip && (
                      <Tooltip
                        content={metric.tooltip || ""}
                        color="#6B7280"
                        maxWidth={250}
                      >
                        <Info className="text-gray-400 w-4 h-4 cursor-pointer" />
                      </Tooltip>
                    )}
                  </div>
                </td>
                <td className="px-4 text-sm text-center">
                  {(() => {
                    const style = getCategoryStyle(metric.category);
                    return (
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                        style={{
                          color: style.color,
                          borderColor: style.borderColor,
                          backgroundColor: style.bgColor,
                        }}
                      >
                        {getCategoryLabel(metric.category)}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 text-sm text-gray-900">
                  {metric.currentValue === null
                    ? "--"
                    : `${metric.currentValue}${metric.unit}`}
                </td>
                <td className="px-4 text-sm text-gray-600">
                  {metric.targetValue}
                  {metric.unit}
                </td>
                <td className="px-4">
                  <div className="flex items-center space-x-2">
                    {metric.achievementRate === null ? (
                      <span className="text-sm text-gray-400">--</span>
                    ) : (
                      (() => {
                        const Icon = getStatusIcon(metric.status);
                        const iconColor = getStatusColor(metric.status);
                        return (
                          <>
                            <Icon
                              className="w-5 h-5"
                              style={{ color: iconColor }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: iconColor }}
                            >
                              {metric.achievementRate}%
                            </span>
                          </>
                        );
                      })()
                    )}
                  </div>
                </td>
                <td className="px-4 text-sm text-gray-600">
                  {metric.weightRatio.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
