import { ACHIEVEMENT_RATE_COLORS } from "@/styles/colors";

interface ScoreLegendProps {
  legendSize?: "medium" | "small";
}

const LEGEND_STYLES = {
  medium: {
    container: "gap-6 py-8",
    text: "text-sm",
    colorBox: "w-4 h-4",
    itemGap: "gap-2",
    legendsGap: "gap-6",
  },
  small: {
    container: "gap-1.5 py-2 px-3",
    text: "text-xs",
    colorBox: "w-2 h-3",
    itemGap: "gap-1",
    legendsGap: "gap-[8px]",
  },
};

/**
 * 점수 범례 컴포넌트
 * 달성률 5단계: 0-25%, 25-50%, 50-75%, 75-100%, 100% 이상
 */
export const ScoreLegend = ({ legendSize = "medium" }: ScoreLegendProps) => {
  const styles = LEGEND_STYLES[legendSize];

  const legends = [
    { color: ACHIEVEMENT_RATE_COLORS.level1, label: "0-25% 미만" },
    { color: ACHIEVEMENT_RATE_COLORS.level2, label: "25-50% 미만" },
    { color: ACHIEVEMENT_RATE_COLORS.level3, label: "50-75% 미만" },
    { color: ACHIEVEMENT_RATE_COLORS.level4, label: "75-100% 미만" },
    { color: ACHIEVEMENT_RATE_COLORS.level5, label: "100% 이상" },
  ];

  return (
    <div
      className={`flex items-center ${
        legendSize === "small" ? "w-full justify-between" : "justify-center"
      } ${styles.container}`}
    >
      <span
        className={`${styles.text} text-gray-600 font-medium flex items-center gap-1.5`}
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
