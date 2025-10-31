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
 * 상승/하락 TOP 5 지표 표시
 */
export const MetricsRanking = ({
  topGainers,
  topLosers,
}: MetricsRankingProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">지표 순위</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 상승 지표 TOP 5 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-600">↑</span>
            <h4 className="text-sm font-semibold text-gray-700">
              상위 지표 TOP 5
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
                <span className="text-sm font-semibold text-green-600">
                  +{item.change}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 하락 지표 TOP 5 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-600">↓</span>
            <h4 className="text-sm font-semibold text-gray-700">
              주의 지표 TOP 5
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
                <span className="text-sm font-semibold text-red-600">
                  {item.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
