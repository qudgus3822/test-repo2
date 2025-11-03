import { TREND_COLORS } from "@/styles/colors";
import downIcon from "@/assets/icons/down_icon_red.svg";
import upIcon from "@/assets/icons/up_icon_green.svg";

interface RankingItem {
  rank: number;
  name: string;
  change: number;
}

interface MetricsRankingProps {
  topGainers: RankingItem[];
  topLosers: RankingItem[];
}

/**
 * 지표 순위 컴포넌트
 * 우수/위험 TOP 5 지표 표시
 */
export const MetricsRanking = ({
  topGainers,
  topLosers,
}: MetricsRankingProps) => {
  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">지표 순위</h3>
      <div className="grid grid-cols-1 gap-8">
        {/* 우수 지표 TOP 5 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={upIcon} alt="up" />
            <h4 className="text-sm font-semibold text-gray-700">
              우수 지표 TOP 5
            </h4>
          </div>
          <div className="space-y-3">
            {topGainers.map((item) => (
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
            ))}
          </div>
        </div>
        {/* 구분선-수평선 */}
        <div className="border-t border-[#E2E8F0] my-6"></div>
        {/* 위험 지표 TOP 5 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={downIcon} alt="down" />
            <h4 className="text-sm font-semibold text-gray-700">
              위험 지표 TOP 5
            </h4>
          </div>
          <div className="space-y-3">
            {topLosers.map((item) => (
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
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
