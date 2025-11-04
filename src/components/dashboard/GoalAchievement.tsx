import { DonutChart } from "@/libs/chart";

interface GoalAchievementProps {
  achieved: number;
  total: number;
}

/**
 * 목표 달성률 컴포넌트
 */
export const GoalAchievement = ({ achieved, total }: GoalAchievementProps) => {
  const percentage = (achieved / total) * 100;

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">목표 달성률</h3>
      <div className="flex flex-col items-center py-5">
        <DonutChart
          value={percentage}
          maxValue={100}
          showPercentage
          color="#10b981"
          backgroundColor="#e5e7eb"
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
