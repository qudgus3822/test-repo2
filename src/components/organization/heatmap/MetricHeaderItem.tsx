/**
 * MetricHeaderItem 컴포넌트
 * - 개별 지표 헤더 아이템
 * - 정렬 기능 포함 (3단계: 오름차순 → 내림차순 → 정렬없음)
 * - 참조 프로젝트 구조 기반 (div flex 레이아웃)
 */

import { ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react";
import { METRIC_CODE_NAMES, METRIC_CODE_DISPLAY_NAMES } from "@/utils/metrics";
import type { SortConfig } from "./types";
import { COLUMN_WIDTHS } from "./types";

interface MetricHeaderItemProps {
  metricCode: string;
  sortConfig: SortConfig;
  onSort: (column: string) => void;
}

export const MetricHeaderItem = ({
  metricCode,
  sortConfig,
  onSort,
}: MetricHeaderItemProps) => {
  const isActive = sortConfig.column === metricCode && sortConfig.direction !== null;

  const displayName = METRIC_CODE_DISPLAY_NAMES[metricCode];
  const fullName = METRIC_CODE_NAMES[metricCode] || metricCode;

  // 정렬 아이콘 렌더링
  const renderSortIcon = () => {
    if (!isActive) {
      return <ArrowDownUp className="w-3 h-3 text-gray-400" />;
    }
    if (sortConfig.direction === "asc") {
      return <ArrowUp className="w-3 h-3 text-blue-600" />;
    }
    return <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  return (
    <div
      className={`border-r border-gray-200 last:border-r-0 ${
        isActive ? "bg-blue-50" : ""
      }`}
      style={{ minWidth: COLUMN_WIDTHS.metric, maxWidth: COLUMN_WIDTHS.metric }}
    >
      <div
        className="p-1 text-center h-[40px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
        onClick={() => onSort(metricCode)}
        title={fullName}
      >
        {displayName ? (
          <>
            <span className="text-[10px] font-medium text-gray-600 whitespace-nowrap mb-0.5">
              {displayName[0]}
            </span>
            <span className="text-[10px] font-medium text-gray-600 whitespace-nowrap mb-0.5">
              {displayName[1]}
            </span>
          </>
        ) : (
          <>
            <span className="text-[10px] font-medium text-gray-600 whitespace-nowrap mb-0.5">
              {fullName.slice(0, 4)}
            </span>
            <span className="text-[10px] font-medium text-gray-600 whitespace-nowrap mb-0.5">
              {fullName.slice(4, 8) || "\u00A0"}
            </span>
          </>
        )}
        <span className="mt-0.5">{renderSortIcon()}</span>
      </div>
    </div>
  );
};

export default MetricHeaderItem;
