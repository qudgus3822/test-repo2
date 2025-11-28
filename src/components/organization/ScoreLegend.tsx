import { SCORE_COLORS } from "@/styles/colors";

/**
 * 점수 범례 컴포넌트
 * 80% 이상 (초록), 70%~80% 미만 (연한 초록), 70% 미만 (주황)
 */
export const ScoreLegend = () => {
  const legends = [
    { color: SCORE_COLORS.excellent, label: "80% 이상" },
    { color: SCORE_COLORS.good, label: "70% ~ 80% 미만" },
    { color: SCORE_COLORS.danger, label: "70% 미만" },
  ];

  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <span className="text-sm text-gray-600 font-medium">달성률</span>
      {legends.map((legend, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: legend.color }}
          />
          <span className="text-sm text-gray-600">{legend.label}</span>
        </div>
      ))}
    </div>
  );
};
