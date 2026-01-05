import { ACHIEVEMENT_RATE_COLORS } from "@/styles/colors";

/**
 * 점수 범례 컴포넌트
 * 달성률 5단계: 0-25%, 25-50%, 50-75%, 75-100%, 100% 이상
 */
export const ScoreLegend = () => {
  const legends = [
    { color: ACHIEVEMENT_RATE_COLORS.level1, label: "0-25% 미만" },
    { color: ACHIEVEMENT_RATE_COLORS.level2, label: "25-50% 미만" },
    { color: ACHIEVEMENT_RATE_COLORS.level3, label: "50-75% 미만" },
    { color: ACHIEVEMENT_RATE_COLORS.level4, label: "75-100% 미만" },
    { color: ACHIEVEMENT_RATE_COLORS.level5, label: "100% 이상" },
  ];

  return (
    <div className="flex items-center justify-center gap-6 py-8">
      <span className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
        달성률 범례
        {/* <Tooltip
          content="달성률은 지표관리 화면에서 설정된 값을 기준으로 반영합니다."
          color="#6B7280"
          maxWidth={250}
        >
          <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
        </Tooltip> */}
      </span>

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
