import { ACHIEVEMENT_RATE_COLORS } from "@/styles/colors";

interface ScoreLegendProps {
  legendSize?: "medium" | "small";
  /** 반응형 크기 적용 여부 (820px 기준: 미만 small, 이상 medium) */
  responsive?: boolean;
}

const LEGEND_STYLES = {
  medium: {
    container: "gap-6 py-2",
    text: "text-sm",
    colorBox: "w-4 h-4",
    itemGap: "gap-1 lg:gap-2",
    legendsGap: "gap-2 lg:gap-6",
  },
  small: {
    container: "gap-1.5 py-1 px-3.5",
    text: "text-xs",
    colorBox: "w-2 h-3",
    itemGap: "gap-1",
    legendsGap: "gap-[8px]",
  },
};

/**
 * [변경: 2026-01-29 17:00, 임도휘 수정] 반응형 지원 추가 (820px 기준 크기 변경)
 * 점수 범례 컴포넌트
 * 달성률 5단계: 0-25%, 25-50%, 50-75%, 75-100%, 100% 이상
 */
export const ScoreLegend = ({
  legendSize = "medium",
  responsive = false,
}: ScoreLegendProps) => {
  const legends = [
    { color: ACHIEVEMENT_RATE_COLORS.level1, label: "0-25% 미만" },
    { color: ACHIEVEMENT_RATE_COLORS.level2, label: "25-50% 미만" },
    { color: ACHIEVEMENT_RATE_COLORS.level3, label: "50-75% 미만" },
    { color: ACHIEVEMENT_RATE_COLORS.level4, label: "75-100% 미만" },
    { color: ACHIEVEMENT_RATE_COLORS.level5, label: "100-200% 이하" },
  ];

  const renderLegend = (size: "medium" | "small", centerAlign = false) => {
    const styles = LEGEND_STYLES[size];
    return (
      <div
        className={`flex items-center ${
          size === "small" && !centerAlign
            ? "w-full justify-between"
            : "justify-center"
        } ${styles.container}`}
      >
        <span
          className={`${styles.text} text-gray-600 font-medium flex items-center gap-1.5 whitespace-nowrap`}
        >
          달성률 범례
        </span>

        <div className={`flex items-center ${styles.legendsGap}`}>
          {legends.map((legend, index) => (
            <div key={index} className={`flex items-center ${styles.itemGap}`}>
              <div
                className={`${styles.colorBox} rounded`}
                style={{ backgroundColor: legend.color }}
              />
              <span className={`${styles.text} text-gray-600`}>
                {legend.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 반응형 모드: 820px 미만 small (가운데 정렬), 820px 이상 medium
  if (responsive) {
    return (
      <>
        {/* 820px 미만: small (가운데 정렬) */}
        <div className="block min-[820px]:hidden">
          {renderLegend("small", true)}
        </div>
        {/* 820px 이상: medium */}
        <div className="hidden min-[820px]:block">{renderLegend("medium")}</div>
      </>
    );
  }

  // 기본 모드: legendSize prop에 따라 렌더링
  return renderLegend(legendSize);
};
