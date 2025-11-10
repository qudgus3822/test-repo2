import { CHART_COLORS, DonutChart } from "@/libs/chart";

interface TargetValueAchievementProps {
  achieved: number;
  total: number;
}

/**
 * 목표 달성률 컴포넌트
 */
export const TargetValueAchievement = ({
  achieved,
  total,
}: TargetValueAchievementProps) => {
  const percentage = (achieved / total) * 100;

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">목표 달성률</h3>
      <div className="flex flex-col items-center py-5">
        <DonutChart
          value={percentage}
          maxValue={100}
          showPercentage
          color={CHART_COLORS.orange}
          size={180}
          strokeWidth={20}
        />
        <p className="mt-4 text-sm text-gray-600">
          {achieved}/{total} 지표 달성
        </p>
      </div>
    </>
  );
};
