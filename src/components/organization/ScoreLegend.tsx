import { SCORE_COLORS } from "@/styles/colors";
import { Tooltip } from "@/components/ui/Tooltip";
import { Info } from "lucide-react";

interface ScoreLegendProps {
  excellentThreshold?: number; // 우수 기준 (기본값: 80)
  dangerThreshold?: number; // 위험 기준 (기본값: 70)
}

/**
 * 점수 범례 컴포넌트
 * excellentThreshold 이상 (초록), dangerThreshold ~ excellentThreshold 미만 (연한 초록), dangerThreshold 미만 (주황)
 */
export const ScoreLegend = ({
  excellentThreshold = 80,
  dangerThreshold = 70,
}: ScoreLegendProps) => {
  const legends = [
    { color: SCORE_COLORS.excellent, label: `${excellentThreshold}% 이상` },
    {
      color: SCORE_COLORS.good,
      label: `${dangerThreshold}% ~ ${excellentThreshold}% 미만`,
    },
    { color: SCORE_COLORS.danger, label: `${dangerThreshold}% 미만` },
  ];

  return (
    <div className="flex items-center justify-center gap-6 py-8">
      <span className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
        달성률
        <Tooltip
          content="달성률은 지표관리 화면에서 설정된 값을 기준으로 반영합니다."
          color="#6B7280"
          maxWidth={250}
        >
          <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
        </Tooltip>
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
