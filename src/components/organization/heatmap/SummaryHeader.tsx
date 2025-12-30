/**
 * SummaryHeader 컴포넌트
 * - 요약 컬럼 헤더(초과달성, 달성, 양호, 주의)를 표시합니다.
 * - 정렬 기능을 포함합니다.
 * - 참조 프로젝트 구조 기반 (div flex 레이아웃)
 */

import {
  SUMMARY_CATEGORIES,
  SUMMARY_COLUMN_WIDTH,
  type SummaryCategory,
  type SortConfig,
} from "./types";

interface SummaryHeaderProps {
  sortConfig: SortConfig;
  onSort: (column: SummaryCategory) => void;
}

export const SummaryHeader = ({ sortConfig, onSort }: SummaryHeaderProps) => {
  return (
    <div className="flex">
      {SUMMARY_CATEGORIES.map((category) => {
        const isActive = sortConfig.column === category.id;
        const isDescending = sortConfig.direction === "desc";

        return (
          <div
            key={category.id}
            onClick={() => onSort(category.id)}
            className={`
              flex items-center justify-center p-2 cursor-pointer
              border-r border-gray-200 last:border-r-0
              hover:bg-gray-100 transition-colors select-none
              ${isActive ? "bg-gray-50" : ""}
            `}
            style={{ minWidth: SUMMARY_COLUMN_WIDTH, maxWidth: SUMMARY_COLUMN_WIDTH }}
            role="columnheader"
            aria-sort={isActive ? (isDescending ? "descending" : "ascending") : "none"}
            title={`${category.name} (${category.koreanName}): 이 컬럼으로 정렬`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-medium text-gray-700 whitespace-nowrap">
                {category.koreanName}
              </span>
              <span className={`text-[8px] ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                {isActive ? (isDescending ? "▼" : "▲") : "▽"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryHeader;
