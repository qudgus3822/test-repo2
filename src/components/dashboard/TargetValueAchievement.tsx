import { memo } from "react";
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
// [변경: 2026-01-27 15:30, 김병현 수정] React.memo 적용하여 불필요한 리렌더링 방지
export const TargetValueAchievement = memo(function TargetValueAchievement({
  month,
}: TargetValueAchievementProps) {
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
          style={{ minHeight: 160 }}
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
  const hasData = achievedMetrics !== null && totalMetrics > 0;
  const percentage = hasData ? (achievedMetrics / totalMetrics) * 100 : 0;

  return (
    <div className="grid grid-cols-1">
      <h3 className="text-lg font-semibold text-gray-900">목표 달성률</h3>
      {/* [변경: 2026-02-11 15:30, 임도휘 수정] 창 너비 축소 시 도넛차트·텍스트 카드 영역 벗어남 방지 반응형 scale 적용 */}
      <div className="flex flex-col items-center py-1 lg:scale-[0.75] [@media(min-width:1160px)]:scale-[0.85] [@media(min-width:1400px)]:scale-100 origin-center">
        <DonutChart
          value={percentage}
          maxValue={100}
          showPercentage
          gradient={ACHIEVEMENT_GRADIENT}
          strokeWidth={20}
          noDataLabel={hasData ? undefined : "-%"}
        />
        <p className="mt-4 text-sm text-gray-600">
          {achievedMetrics ?? "-"}/{totalMetrics} 지표 달성
        </p>
      </div>
    </div>
  );
});
