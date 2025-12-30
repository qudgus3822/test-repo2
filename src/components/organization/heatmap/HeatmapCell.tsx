/**
 * HeatmapCell 컴포넌트
 * - ProgressSquare와 MetricTooltip을 감싸는 히트맵 셀 컴포넌트
 * - 호버 시 툴팁 표시
 */

import { useState } from "react";
import { ProgressSquare } from "./ProgressSquare";
import { MetricTooltip } from "./MetricTooltip";

interface HeatmapCellProps {
  /** 지표 코드 */
  metricCode: string;
  /** 실제 값 */
  value: number | null;
  /** 달성률 (0-150) */
  score: number | null;
  /** 값 숨기기 여부 */
  hideValue?: boolean;
}

export const HeatmapCell = ({
  metricCode,
  value,
  score,
  hideValue = false,
}: HeatmapCellProps) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <div
      className="flex items-center justify-center w-full h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ProgressSquare score={score} value={value} hideValue={hideValue} />
      <MetricTooltip
        metricCode={metricCode}
        value={value}
        score={score}
        visible={tooltipVisible}
        position={tooltipPosition}
      />
    </div>
  );
};

export default HeatmapCell;
