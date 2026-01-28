/**
 * ProgressSquare 컴포넌트
 * - 히트맵 셀에서 달성률 기반 바닥부터 채워지는 프로그레스 바 표시
 * - avgRate(달성률)에 따라 높이와 색상이 달라집니다.
 * - 참조 프로젝트 구조 기반 (fill-from-bottom 효과)
 */

import { ACHIEVEMENT_RATE_COLORS } from "@/styles/colors";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { Tooltip } from "@/components/ui/Tooltip";

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
  // [변경: 2026-01-27 17:00, 임도휘 수정] 툴팁에 단위 표시용
  /** 단위 (예: "건", "시간" 등) */
  unit?: string;
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
  unit,
}: ProgressSquareProps) => {
  // [변경: 2026-01-26 15:50, 임도휘 수정] 표시 모드에 따라 달성률일 때 '%' 추가
  const displayMode = useOrganizationStore((state) => state.displayMode);
  // [변경: 2026-01-26 15:50, 임도휘 수정] 표시 모드에 따라 hasData 조건 분기 (value 또는 avgRate 존재 여부로 판단)
  const hasData = displayMode === "rate"
    ? (avgRate !== null && avgRate !== undefined)  // 달성률 모드: avgRate 확인
    : (value !== null && value !== undefined);  // 실제값 모드: value 확인

  // [변경: 2026-01-28 15:00, 임도휘 수정] 글자수 기반 포맷팅
  // - 6글자 이하: 소수점 1자리
  // - 7글자 (1만 단위): X.XXX만 (소수점 3자리)
  // - 8글자 (10만 단위): XX.XX만 (소수점 2자리)
  // - 9글자 (100만 단위): XXX.X만 (소수점 1자리)
  // - 10글자 이상: 말줄임
  const MAX_DISPLAY_LENGTH = 7;

  const formatValue = (): { display: string; full: string } => {
    if (hideValue) return { display: "", full: "" };
    if (!hasData) return { display: "--", full: "--" };

    let formattedNum: string;
    let fullValue: string;

    if (typeof value === "number") {
      // 달성률 모드일 때
      if (displayMode === "rate") {
        formattedNum = Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
        fullValue = formattedNum;
      } else {
        // 실제값 모드: 글자수 기반 포맷팅
        // 글자수 계산 시 항상 소수점 1자리 기준 (예: 1234 → "1234.0" = 6글자)
        const baseFormatted = value.toFixed(1);
        const charCount = baseFormatted.length;
        // [변경: 2026-01-28 16:30, 임도휘 수정] 소수점 표기 조건
        // - 정수인 경우 소수점 없이 표시
        // - 소수인 경우: 정수부가 0이고 소수점 첫째자리도 0이면 둘째자리까지, 아니면 첫째자리까지
        const isInteger = Number.isInteger(value);
        const integerPart = Math.floor(Math.abs(value));
        const firstDecimal = Math.floor(Math.abs(value * 10) % 10);
        const needsSecondDecimal = !isInteger && integerPart === 0 && firstDecimal === 0;
        fullValue = isInteger ? `${value}` : (needsSecondDecimal ? value.toFixed(2) : baseFormatted);

        if (charCount <= 6) {
          // 6글자 이하 (천단위): 정수는 그대로, 소수는 소수점 1자리
          formattedNum = fullValue;
        } else if (charCount === 7) {
          // 7글자 (1만 단위): 소수점 3자리 + "만"
          const inMan = value / 10000;
          formattedNum = `${inMan.toFixed(3)}만`;
        } else if (charCount === 8) {
          // 8글자 (10만 단위): 소수점 2자리 + "만"
          const inMan = value / 10000;
          formattedNum = `${inMan.toFixed(2)}만`;
        } else if (charCount === 9) {
          // 9글자 (100만 단위): 소수점 1자리 + "만"
          const inMan = value / 10000;
          formattedNum = `${inMan.toFixed(1)}만`;
        } else {
          // 10글자 이상: 원본값에서 말줄임 (만 단위 변환 없음)
          formattedNum = `${fullValue.slice(0, MAX_DISPLAY_LENGTH - 2)}..`;
        }
      }
    } else {
      // 문자열인 경우
      formattedNum = `${value}`;
      fullValue = `${value}`;
      // 문자열이 길 경우 말줄임
      if (formattedNum.length > MAX_DISPLAY_LENGTH) {
        formattedNum = `${formattedNum.slice(0, MAX_DISPLAY_LENGTH - 1)}..`;
      }
    }

    // 툴팁에 단위 포함
    const fullWithUnit = unit ? `${fullValue} ${unit}` : fullValue;

    return { display: formattedNum, full: fullWithUnit };
  };

  const { display: displayValue, full: fullValue } = formatValue();
  // [변경: 2026-01-28 16:00, 임도휘 수정] 모든 셀에 툴팁 표시 (데이터가 있는 경우)
  const needsTooltip = hasData && fullValue !== "--";

  // [변경: 2026-01-26 15:50, 임도휘 수정] avgRate가 있을 때만 프로그레스 바 표시
  const hasAvgRate = avgRate !== null && avgRate !== undefined;
  const heightPercent = hasAvgRate ? getHeightPercentage(avgRate) : 0;
  const progressColor = hasAvgRate ? getProgressColor(avgRate) : "";

  // 텍스트 색상 결정 (level5는 white, 나머지는 gray-900)
  const isLevel5 = hasAvgRate && avgRate >= 100;
  const textColorClass = !hasData ? "text-gray-400" : isLevel5 ? "text-white" : "text-gray-900";

  // [변경: 2026-01-27 10:30, 임도휘 수정] 텍스트 엘리먼트 분리 (Tooltip 래핑용)
  // [변경: 2026-01-28 16:20, 임도휘 수정] 텍스트 크기 15px → 14.5px
  const textElement = (
    <span
      className={`font-bold overflow-hidden text-ellipsis whitespace-nowrap px-0.5 ${textColorClass}`}
      style={{
        fontSize: "14.5px",
        ...(hasData && { textShadow: isLevel5 ? "0 1px 4px rgba(0, 0, 0, 0.8)" : "0 1px 4px rgba(255, 255, 255, 0.8)" }),
      }}
    >
      {displayValue}
    </span>
  );

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
      {/* [변경: 2026-01-27 10:30, 임도휘 수정] 말줄임 시 Tooltip으로 전체 값 표시 (방향: 아래, 화살표 없음) */}
      {!isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          {needsTooltip ? (
            <Tooltip content={fullValue} direction="bottom" fontSize="text-xs" noWrap hideArrow>
              {textElement}
            </Tooltip>
          ) : (
            textElement
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressSquare;
