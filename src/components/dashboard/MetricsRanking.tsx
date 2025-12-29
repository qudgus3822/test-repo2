import { useMemo } from "react";
import { TREND_COLORS } from "@/styles/colors";
import downIcon from "@/assets/icons/down_icon_red.svg";
import upIcon from "@/assets/icons/up_icon_green.svg";
import { useMetricRankings } from "@/api/hooks/useMetricRankings";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface MetricsRankingProps {
  month: string;
}

/**
 * 지표 순위 컴포넌트
 * 우수/위험 TOP 5 지표 표시
 */
export const MetricsRanking = ({ month }: MetricsRankingProps) => {
  const {
    data: metricRankingsData,
    isLoading,
    error,
  } = useMetricRankings(month, "all");

  // 우수 지표 데이터 가공
  const topGainers = useMemo(
    () =>
      metricRankingsData?.growth
        ? metricRankingsData.growth.map((item) => ({
            rank: item.rank,
            name: item.metricName,
            change: item.changeRate,
          }))
        : [],
    [metricRankingsData],
  );

  // 위험 지표 데이터 가공
  const topLosers = useMemo(
    () =>
      metricRankingsData?.warning
        ? metricRankingsData.warning.map((item) => ({
            rank: item.rank,
            name: item.metricName,
            change: item.changeRate,
          }))
        : [],
    [metricRankingsData],
  );

  // 로딩, 에러 상태
  if (isLoading || error) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">지표 순위</h3>
        <div className="flex items-center justify-center min-h-[257px]">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="text-gray-500">수집된 데이터가 없습니다.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <h3 className="text-lg font-semibold text-gray-900">지표 순위</h3>
      <div>
        {/* 우수 지표 TOP 5 */}
        <div className="flex flex-col gap-4 min-h-[200px]">
          <div className="flex items-center gap-2">
            <img src={upIcon} alt="up" />
            <h4 className="text-sm font-semibold text-gray-700">
              우수 지표 TOP 5
            </h4>
          </div>
          <div className="space-y-3 min-h-[164px]">
            {topGainers.length > 0 ? (
              topGainers.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-4">
                      {item.rank}
                    </span>
                    <span className="text-sm text-gray-900">{item.name}</span>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: TREND_COLORS.increase }}
                  >
                    +{item.change}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">
                현재 우수 지표가 없습니다.
              </p>
            )}
          </div>
        </div>
        {/* 구분선-수평선 */}
        <div className="border-t border-[#E2E8F0] my-6"></div>
        {/* 위험 지표 TOP 5 */}
        <div className="flex flex-col gap-4 min-h-[200px]">
          <div className="flex items-center gap-2">
            <img src={downIcon} alt="down" />
            <h4 className="text-sm font-semibold text-gray-700">
              위험 지표 TOP 5
            </h4>
          </div>
          <div className="space-y-3 min-h-[164px]">
            {topLosers.length > 0 ? (
              topLosers.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-4">
                      {item.rank}
                    </span>
                    <span className="text-sm text-gray-900">{item.name}</span>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: TREND_COLORS.decrease }}
                  >
                    {item.change}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">
                현재 위험 지표가 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
