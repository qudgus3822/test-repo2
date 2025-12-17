import { DonutChart } from "@/libs/chart";
import { useGoalAchievement } from "@/api/hooks/useGoalAchievement";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// 목표 달성률 그라데이션 색상 (Cyan -> Purple)
const ACHIEVEMENT_GRADIENT = {
  startColor: "#06B6D4", // Cyan
  endColor: "#9333EA", // Purple
  id: "achievement-gradient",
};

interface TargetValueAchievementProps {
  month: string;
}

/**
 * 목표 달성률 컴포넌트
 *
 * @example
 * <TargetValueAchievement month="2025-01" />
 */
export const TargetValueAchievement = ({
  month,
}: TargetValueAchievementProps) => {
  const {
    data: goalAchievementData,
    isLoading,
    error,
  } = useGoalAchievement(month);

  // 로딩, 에러, 데이터 없음 상태
  if (isLoading || error || !goalAchievementData) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          목표 달성률
        </h3>
        <div
          className="flex items-center justify-center"
          style={{ minHeight: 240 }}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="text-gray-500">수집된 데이터가 없습니다.</p>
          )}
        </div>
      </div>
    );
  }

  const { achievedMetrics, totalMetrics } = goalAchievementData;
  const percentage = totalMetrics > 0 ? (achievedMetrics / totalMetrics) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4">
      <h3 className="text-lg font-semibold text-gray-900">목표 달성률</h3>
      <div className="flex flex-col items-center py-5">
        <DonutChart
          value={percentage}
          maxValue={100}
          showPercentage
          gradient={ACHIEVEMENT_GRADIENT}
          size={180}
          strokeWidth={20}
        />
        <p className="mt-4 text-sm text-gray-600">
          {achievedMetrics}/{totalMetrics} 지표 달성
        </p>
      </div>
    </div>
  );
};
