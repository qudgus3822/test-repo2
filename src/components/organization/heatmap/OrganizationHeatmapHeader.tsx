/**
 * OrganizationHeatmapHeader 컴포넌트
 * - 조직 히트맵 테이블 헤더
 * - 2행 구조: 카테고리 그룹 + 개별 지표명
 * - 참조 프로젝트 구조 기반 (div flex 레이아웃)
 */

import { METRIC_CODE_ORDER } from "@/utils/metrics";
import { SummaryHeader } from "./SummaryHeader";
import { MetricHeader } from "./MetricHeader";
import {
  COLUMN_WIDTHS,
  SUMMARY_COLUMN_WIDTH,
  SUMMARY_CATEGORIES,
  type SortConfig,
  type SummaryCategory,
} from "./types";

// 30개 지표 코드 목록 (순서대로)
const ALL_METRIC_CODES = Object.keys(METRIC_CODE_ORDER).sort(
  (a, b) => METRIC_CODE_ORDER[a] - METRIC_CODE_ORDER[b]
);

// 지표 카테고리 그룹
const METRIC_CATEGORY_GROUPS = [
  { name: "코드품질", count: 9 },
  { name: "리뷰품질", count: 12 },
  { name: "개발효율", count: 9 },
];

interface OrganizationHeatmapHeaderProps {
  sortConfig: SortConfig;
  onSort: (column: SummaryCategory | string) => void;
}

export const OrganizationHeatmapHeader = ({
  sortConfig,
  onSort,
}: OrganizationHeatmapHeaderProps) => {
  return (
    <div className="sticky top-0 z-20 bg-white border-b-2 border-gray-300 shadow-sm">
      {/* 헤더 1행: 카테고리 그룹 */}
      <div className="flex border-b border-gray-200 h-[40px]">
        {/* 조직 이름 라벨 - sticky left */}
        <div
          className="sticky left-0 z-30 bg-gray-100 border-r border-gray-300 flex items-center justify-center"
          style={{ width: COLUMN_WIDTHS.name, minWidth: COLUMN_WIDTHS.name }}
        >
          <span className="text-xs font-bold text-gray-700">조직 이름</span>
        </div>

        {/* Summary 헤더 (첫 번째 행에서는 빈 공간 또는 카테고리 라벨) */}
        <div
          className="flex items-center justify-center bg-gray-50 border-r border-gray-200"
          style={{ width: SUMMARY_COLUMN_WIDTH * SUMMARY_CATEGORIES.length }}
        >
          <span className="text-xs font-medium text-gray-600">Summary</span>
        </div>

        {/* 지표 카테고리 그룹 */}
        <div className="flex flex-1">
          {METRIC_CATEGORY_GROUPS.map((group, index) => (
            <div
              key={group.name}
              className={`flex items-center justify-center bg-gray-50 ${
                index < METRIC_CATEGORY_GROUPS.length - 1 ? "border-r border-gray-200" : ""
              }`}
              style={{ width: group.count * COLUMN_WIDTHS.metric }}
            >
              <span className="text-xs font-medium text-gray-700">{group.name}</span>
            </div>
          ))}
        </div>

        {/* BDPI 라벨 - sticky right */}
        <div
          className="sticky right-0 z-30 bg-gray-100 border-l border-gray-300 flex items-center justify-center"
          style={{ width: COLUMN_WIDTHS.bdpi, minWidth: COLUMN_WIDTHS.bdpi }}
        >
          <span className="text-xs font-bold text-gray-700">BDPI</span>
        </div>
      </div>

      {/* 헤더 2행: 개별 지표명 */}
      <div className="flex h-[40px]">
        {/* 조직 이름 (빈 공간) - sticky left */}
        <div
          className="sticky left-0 z-30 bg-gray-50 border-r border-gray-300"
          style={{ width: COLUMN_WIDTHS.name, minWidth: COLUMN_WIDTHS.name }}
        />

        {/* Summary 정렬 헤더 */}
        <SummaryHeader sortConfig={sortConfig} onSort={onSort} />

        {/* 개별 지표 헤더 */}
        <MetricHeader metricCodes={ALL_METRIC_CODES} sortConfig={sortConfig} onSort={onSort} />

        {/* BDPI (빈 공간) - sticky right */}
        <div
          className="sticky right-0 z-30 bg-gray-50 border-l border-gray-300"
          style={{ width: COLUMN_WIDTHS.bdpi, minWidth: COLUMN_WIDTHS.bdpi }}
        />
      </div>
    </div>
  );
};

export default OrganizationHeatmapHeader;
