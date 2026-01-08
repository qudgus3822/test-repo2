/**
 * SummaryCell 컴포넌트
 * - 각 카테고리(초과달성, 달성, 양호, 주의)의 지표 개수를 표시합니다.
 * - 참조 프로젝트 구조 기반 (div flex 레이아웃)
 */

import {
  SUMMARY_CATEGORIES,
  SUMMARY_COLUMN_WIDTH,
  SUMMARY_CATEGORY_MAP,
  type SummaryCounts,
} from "./types";

interface SummaryCellProps {
  counts: SummaryCounts;
}

export const SummaryCell = ({ counts }: SummaryCellProps) => {
  return (
    <div className="flex">
      {SUMMARY_CATEGORIES.map((category) => {
        const count = counts[category.id];
        const config = SUMMARY_CATEGORY_MAP[category.id];

        return (
          <div
            key={category.id}
            className="flex items-center justify-center p-2 border-r border-gray-200 last:border-r-0"
            style={{
              minWidth: SUMMARY_COLUMN_WIDTH,
              maxWidth: SUMMARY_COLUMN_WIDTH,
              backgroundColor: config.bgColor,
            }}
            title={`${category.koreanName}: ${count}개 지표`}
          >
            <span
              className="text-sm font-bold"
              style={{ color: config.textColor }}
            >
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCell;
