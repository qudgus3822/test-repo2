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
import { useOrganizationStore } from "@/store/useOrganizationStore";

interface HeatmapCellProps {
  /** 지표 코드 */
  metricCode: string;
  /** 지표명 (API 응답) */
  metricName?: string;
  /** 실제 값 */
  value: number | null;
  // [변경: 2026-01-26 15:50, 임도휘 수정] score 대신 avgRate 사용
  /** 달성률 (0-150) */
  avgRate: number | null;
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
  /** 달성 상태 (API 응답) */
  status?: string | null;
  /** 역추적 오버레이 열기 콜백 -- 부모 행 컴포넌트에서 컨텍스트를 미리 바인딩하여 제공 */
  onTraceClick?: () => void;
}

export const HeatmapCell = ({
  metricCode,
  metricName,
  value,
  avgRate,
  hideValue = false,
  targetValue,
  unit,
  showTooltip = true,
  status,
  onTraceClick,
}: HeatmapCellProps) => {
  // [변경: 2026-01-26 15:50, 임도휘 수정] 표시 모드에 따라 실제값(value) 또는 달성률(avgRate) 표시
  const displayMode = useOrganizationStore((state) => state.displayMode);
  const displayValue = displayMode === "rate" ? avgRate : value;
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [metricDefinition, setMetricDefinition] =
    useState<MetricDefinitionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 클릭 외부 감지하여 툴팁 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // 셀 내부 클릭이면 무시
      if (cellRef.current && cellRef.current.contains(target)) return;
      // Portal로 렌더링된 툴팁 내부 클릭이면 무시 (역추적 버튼 등)
      if (tooltipRef.current && tooltipRef.current.contains(target)) return;
      // 진짜 외부 클릭 -- 툴팁 닫기
      if (tooltipVisible) {
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

  // [변경: 2026-01-26 15:50, 임도휘 수정] hideValue가 true일 때 마우스 오버 시 달성률 표시 (avgRate 사용)
  const avgRateTooltip =
    hideValue && avgRate !== null ? `달성률: ${parseFloat(avgRate.toFixed(2))}%` : undefined;

  return (
    <div
      ref={cellRef}
      className="flex items-center justify-center w-full h-full cursor-pointer"
      onClick={handleClick}
      title={avgRateTooltip}
    >
      {/* [변경: 2026-01-29 15:00, 김병현 수정] 툴팁에는 항상 value 값 표시를 위해 tooltipValue prop 추가 */}
      <ProgressSquare
        avgRate={avgRate}
        value={displayValue}
        tooltipValue={value}
        hideValue={hideValue}
        isLoading={isLoading}
        unit={unit}
      />
      {showTooltip && (
        <MetricTooltip
          ref={tooltipRef}
          metricCode={metricCode}
          metricName={metricDefinition?.title || metricName}
          value={metricDefinition?.value ?? value}
          avgRate={metricDefinition?.avgRate ?? avgRate}
          visible={tooltipVisible}
          position={tooltipPosition}
          targetValue={metricDefinition?.targetValue ?? targetValue}
          unit={metricDefinition?.unit || unit}
          description={metricDefinition?.tooltip ?? undefined}
          status={metricDefinition?.status ?? status}
          onTraceClick={onTraceClick ? () => { setTooltipVisible(false); onTraceClick(); } : undefined}
        />
      )}
    </div>
  );
};

export default HeatmapCell;
