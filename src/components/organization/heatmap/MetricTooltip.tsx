/**
 * MetricTooltip 컴포넌트
 * - 히트맵 셀 호버 시 지표 상세 정보를 표시합니다.
 * - Portal을 사용하여 overflow 컨테이너 외부에 렌더링
 */

import { createPortal } from "react-dom";
import {
  getMetricName,
  getMetricUnit,
  getMetricTooltipDescription,
} from "@/utils/metrics";
import { SUMMARY_CATEGORIES } from "./types";

interface MetricTooltipProps {
  /** 지표 코드 */
  metricCode: string;
  /** 실제 값 */
  value: number | null;
  /** 달성률 (0-150) */
  score: number | null;
  /** 툴팁 표시 여부 */
  visible: boolean;
  /** 툴팁 위치 */
  position: { x: number; y: number };
  /** 목표값 (API 응답) */
  targetValue?: number | string | null;
  /** 단위 (API 응답) */
  unit?: string;
}

/**
 * 달성률에 따른 달성단계 카테고리 반환
 */
const getAchievementCategory = (score: number | null) => {
  if (score === null) return null;
  return SUMMARY_CATEGORIES.find(
    (cat) => score >= cat.minPercentage && score < cat.maxPercentage,
  );
};

export const MetricTooltip = ({
  metricCode,
  value,
  score,
  visible,
  position,
  targetValue,
}: MetricTooltipProps) => {
  if (!visible) return null;

  const metricName = getMetricName(metricCode);
  // METRIC_CODE_UNITS 매핑값 사용 (API 응답값 대신)
  const displayUnit = getMetricUnit(metricCode);
  const description = getMetricTooltipDescription(metricCode);
  const achievementCategory = getAchievementCategory(score);

  // 목표값 포맷팅
  const formattedTargetValue =
    targetValue !== null && targetValue !== undefined
      ? typeof targetValue === "number"
        ? Number.isInteger(targetValue)
          ? `${targetValue}`
          : `${targetValue.toFixed(1)}`
        : `${targetValue}`
      : "--";

  // 현재값 포맷팅
  const formattedValue =
    value !== null
      ? typeof value === "number"
        ? Number.isInteger(value)
          ? `${value}`
          : `${value.toFixed(1)}`
        : `${value}`
      : "--";

  const tooltipContent = (
    <div
      className="fixed z-[9999] bg-white text-gray-900 text-sm rounded-lg shadow-xl border border-gray-200 w-[280px] pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%) translateY(-8px)",
      }}
    >
      {/* 헤더: 지표명 */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="font-medium text-gray-800 text-base">{metricName}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-1 leading-relaxed">
            {description}
          </div>
        )}
      </div>

      {/* 본문: 현재값 / 목표값 */}
      <div className="px-4 py-3">
        <div className="flex gap-6">
          {/* 현재값 */}
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">현재값</div>
            <div className="text-md font-medium text-gray-900">
              {formattedValue}
              {value !== null && (
                <span className="text-sm font-normal ml-0.5">
                  {displayUnit}
                </span>
              )}
            </div>
          </div>
          {/* 목표값 */}
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">목표값</div>
            <div className="text-md font-medium text-gray-900">
              {formattedTargetValue}
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 달성률 / 달성단계 */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex gap-6">
          {/* 달성률 */}
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">달성률</div>
            <div className="text-md font-medium text-gray-900">
              {score !== null ? `${Math.round(score)} %` : "--"}
            </div>
          </div>
          {/* 달성단계 */}
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">달성단계</div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: achievementCategory?.bgColor ?? "#9CA3AF",
                }}
              />
              <span className="text-md font-medium text-gray-900">
                {achievementCategory?.koreanName ?? "데이터 없음"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Triangle pointer */}
      <div
        className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
        style={{
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "8px solid white",
          filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))",
        }}
      />
    </div>
  );

  // Portal을 사용하여 document.body에 렌더링
  return createPortal(tooltipContent, document.body);
};

export default MetricTooltip;
