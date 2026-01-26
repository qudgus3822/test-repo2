/**
 * ProgressSquare 컴포넌트
 * - 히트맵 셀에서 달성률 기반 바닥부터 채워지는 프로그레스 바 표시
 * - avgRate(달성률)에 따라 높이와 색상이 달라집니다.
 * - 참조 프로젝트 구조 기반 (fill-from-bottom 효과)
 */

import { ACHIEVEMENT_RATE_COLORS } from "@/styles/colors";
import { useOrganizationStore } from "@/store/useOrganizationStore";

interface ProgressSquareProps {
  // [변경: 2026-01-26 15:50, 임도휘 수정] score 대신 avgRate 사용
  /** 달성률 (0-150) */
  avgRate: number | null;
  /** 표시할 값 */
  value?: number | string | null;
  /** 값 숨기기 여부 */
  hideValue?: boolean;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * 달성률에 따른 배경색 반환
 * - ACHIEVEMENT_RATE_COLORS 사용 (5단계)
 */
const getProgressColor = (avgRate: number): string => {
  if (avgRate >= 100) return ACHIEVEMENT_RATE_COLORS.level5;
  if (avgRate >= 75) return ACHIEVEMENT_RATE_COLORS.level4;
  if (avgRate >= 50) return ACHIEVEMENT_RATE_COLORS.level3;
  if (avgRate >= 25) return ACHIEVEMENT_RATE_COLORS.level2;
  return ACHIEVEMENT_RATE_COLORS.level1;
};

/**
 * 달성률을 높이 퍼센트로 변환 (0-100%)
 * - 150% 이상은 100%로 표시
 */
const getHeightPercentage = (avgRate: number): number => {
  return Math.min(Math.max(avgRate, 0), 100);
};

export const ProgressSquare = ({
  avgRate,
  value,
  hideValue = false,
  isLoading = false,
}: ProgressSquareProps) => {
  // [변경: 2026-01-26 15:50, 임도휘 수정] 표시 모드에 따라 달성률일 때 '%' 추가
  const displayMode = useOrganizationStore((state) => state.displayMode);
  // [변경: 2026-01-26 15:50, 임도휘 수정] 표시 모드에 따라 hasData 조건 분기 (value 또는 avgRate 존재 여부로 판단)
  const hasData = displayMode === "rate"
    ? (avgRate !== null && avgRate !== undefined)  // 달성률 모드: avgRate 확인
    : (value !== null && value !== undefined);  // 실제값 모드: value 확인

  // 값 포맷팅
  const formatValue = () => {
    if (hideValue) return "";
    if (!hasData) return "--";

    if (typeof value === "number") {
      const formattedNum = Number.isInteger(value) ? `${value}` : `${value.toFixed(1)}`;
      return displayMode === "rate" ? `${formattedNum}%` : formattedNum;
    }
    return `${value}`;
  };

  const displayValue = formatValue();

  // [변경: 2026-01-26 15:50, 임도휘 수정] avgRate가 있을 때만 프로그레스 바 표시
  const hasAvgRate = avgRate !== null && avgRate !== undefined;
  const heightPercent = hasAvgRate ? getHeightPercentage(avgRate) : 0;
  const progressColor = hasAvgRate ? getProgressColor(avgRate) : "";

  // 텍스트 색상 결정 (level5는 white, 나머지는 gray-900)
  const isLevel5 = hasAvgRate && avgRate >= 100;
  const textColorClass = !hasData ? "text-gray-400" : isLevel5 ? "text-white" : "text-gray-900";

  return (
    <div className="border border-gray-200 relative w-full h-full bg-gray-100 rounded-sm overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-gray-400">
      {/* [변경: 2026-01-26 15:50, 임도휘 수정] avgRate가 있을 때만 프로그레스 바 표시 */}
      {hasAvgRate && (
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-300"
          style={{
            height: `${heightPercent}%`,
            backgroundColor: progressColor,
          }}
        />
      )}

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* 값 텍스트 오버레이 */}
      {!isLoading && (
        <span
          className={`absolute inset-0 flex items-center justify-center text-md font-bold transition-opacity overflow-hidden text-ellipsis whitespace-nowrap px-0.5 ${textColorClass} opacity-100`}
          style={
            hasData
              ? { textShadow: isLevel5 ? "0 1px 4px rgba(0, 0, 0, 0.8)" : "0 1px 4px rgba(255, 255, 255, 0.8)" }
              : undefined
          }
        >
          {displayValue}
        </span>
      )}
    </div>
  );
};

export default ProgressSquare;
