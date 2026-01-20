/**
 * HeatmapCell 컴포넌트
 * - ProgressSquare와 MetricTooltip을 감싸는 히트맵 셀 컴포넌트
 * - 클릭 시 API 호출 후 툴팁 표시
 */

import { useState, useEffect, useRef } from "react";
import { ProgressSquare } from "./ProgressSquare";
import { MetricTooltip } from "./MetricTooltip";
import { fetchMetricDefinition } from "@/api/organization";
import type { MetricDefinitionResponse } from "@/api/organization";

interface HeatmapCellProps {
  /** 지표 코드 */
  metricCode: string;
  /** 지표명 (API 응답) */
  metricName?: string;
  /** 실제 값 */
  value: number | null;
  /** 달성률 (0-150) */
  score: number | null;
  /** 값 숨기기 여부 */
  hideValue?: boolean;
  /** 목표값 (API 응답) */
  targetValue?: number | string | null;
  /** 단위 (API 응답) */
  unit?: string;
  /** 툴팁 표시 여부 (기본값: true) */
  showTooltip?: boolean;
  /** 툴팁 설명 (API 응답) */
  description?: string;
}

export const HeatmapCell = ({
  metricCode,
  metricName,
  value,
  score,
  hideValue = false,
  targetValue,
  unit,
  showTooltip = true,
}: HeatmapCellProps) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [metricDefinition, setMetricDefinition] =
    useState<MetricDefinitionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);

  // 클릭 외부 감지하여 툴팁 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cellRef.current &&
        !cellRef.current.contains(event.target as Node) &&
        tooltipVisible
      ) {
        setTooltipVisible(false);
      }
    };

    if (tooltipVisible) {
      // 약간의 딜레이를 주어 클릭 이벤트가 먼저 처리되도록 함
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tooltipVisible]);

  const handleClick = async (e: React.MouseEvent) => {
    if (!showTooltip) return;

    // 이미 열려있으면 닫기
    if (tooltipVisible) {
      setTooltipVisible(false);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });

    // API 호출하여 지표 정의 데이터 가져오기
    setMetricDefinition(null); // 이전 데이터 초기화
    setIsLoading(true);
    try {
      const data = await fetchMetricDefinition(metricCode);
      setMetricDefinition(data);
      setTooltipVisible(true);
    } catch (error) {
      console.error("Failed to fetch metric definition:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={cellRef}
      className="flex items-center justify-center w-full h-full cursor-pointer"
      onClick={handleClick}
    >
      <ProgressSquare
        score={score}
        value={value}
        hideValue={hideValue}
        isLoading={isLoading}
      />
      {showTooltip && (
        <MetricTooltip
          metricCode={metricCode}
          metricName={metricDefinition?.title || metricName}
          value={metricDefinition?.value ?? value}
          score={metricDefinition?.score ?? score}
          visible={tooltipVisible}
          position={tooltipPosition}
          targetValue={metricDefinition?.targetValue ?? targetValue}
          unit={metricDefinition?.unit || unit}
          description={metricDefinition?.tooltip ?? undefined}
        />
      )}
    </div>
  );
};

export default HeatmapCell;
