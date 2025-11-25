import { DonutChart } from "@/libs/chart";
import { useGoalAchievement } from "@/api/hooks/useGoalAchievement";

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
export const TargetValueAchievement = (
  props: TargetValueAchievementProps,
) => {
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
    // 로딩 상태
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    // 에러 상태
    if (error) {
      return (
        <p className="text-red-500">
          {error.message || "목표 달성률 데이터를 불러오는데 실패했습니다."}
        </p>
      );
    }

    // 데이터가 없는 경우
    if (!goalAchievementData) {
      return <p className="text-gray-500">목표 달성률 데이터가 없습니다.</p>;
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
