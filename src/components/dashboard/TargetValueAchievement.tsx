import { DonutChart } from "@/libs/chart";
import { useGoalAchievement } from "@/api/hooks/useGoalAchievement";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// 목표 달성률 그라데이션 색상 (Cyan -> Purple)
const ACHIEVEMENT_GRADIENT = {
  startColor: "#06B6D4", // Cyan
  endColor: "#9333EA", // Purple
  id: "achievement-gradient",
};

type TargetValueAchievementProps =
  | {
      // API 호출 방식 (Dashboard에서 사용)
      month: string;
      achieved?: never;
      total?: never;
    }
  | {
      // 직접 데이터 전달 방식 (Metrics 페이지에서 사용)
      month?: never;
      achieved: number;
      total: number;
    };

/**
 * 목표 달성률 컴포넌트
 *
 * @example
 * // API 호출 방식
 * <TargetValueAchievement month="2025-01" />
 *
 * @example
 * // 직접 데이터 전달 방식
 * <TargetValueAchievement achieved={15} total={20} />
 */
export const TargetValueAchievement = (props: TargetValueAchievementProps) => {
  // API 모드 여부 판단
  const isApiMode = "month" in props && !!props.month;

  // Hook은 항상 호출 (조건부 호출 금지)
  const {
    data: goalAchievementData,
    isLoading,
    error,
  } = useGoalAchievement(
    isApiMode ? props.month : "",
    isApiMode, // enabled 옵션으로 조건부 실행
  );

  // API 호출 방식
  if (isApiMode) {
    // 로딩, 에러, 데이터 없음 상태
    if (isLoading || error || !goalAchievementData) {
      return (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
        </>
      );
    }

    const { achievedMetrics, totalMetrics } = goalAchievementData;
    const percentage = (achievedMetrics / totalMetrics) * 100;

    return (
      <>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          목표 달성률
        </h3>
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
      </>
    );
  }

  // 직접 데이터 전달 방식
  const { achieved, total } = props as { achieved: number; total: number };
  const percentage = (achieved / total) * 100;

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">목표 달성률</h3>
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
          {achieved}/{total} 지표 달성
        </p>
      </div>
    </>
  );
};
