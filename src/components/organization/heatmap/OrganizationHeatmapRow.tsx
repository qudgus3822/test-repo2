/**
 * OrganizationHeatmapRow 컴포넌트
 * - 조직/멤버 히트맵 행
 * - sticky 좌측(조직명), summary 셀들, metric 셀들, sticky 우측(BDPI) 포함
 * - 참조 프로젝트 구조 기반 (div flex 레이아웃)
 */

import { ChevronRight, ChevronDown } from "lucide-react";
import type {
  OrganizationDepartment,
  OrganizationMember,
  BdpiMetrics,
  ChangeInfo,
} from "@/types/organization.types";
import { METRIC_CODE_ORDER } from "@/utils/metrics";
import { Tooltip } from "@/components/ui/Tooltip";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import {
  hasChangeInfo,
  formatChangeDate,
  getChangeDetailWithSuffix,
} from "@/utils/organization";
import { HeatmapCell } from "./HeatmapCell";
import { SummaryCell } from "./SummaryCell";
import { COLUMN_WIDTHS, type SummaryCounts, type MetricData } from "./types";

// 30개 지표 코드 목록 (순서대로)
const ALL_METRIC_CODES = Object.keys(METRIC_CODE_ORDER).sort(
  (a, b) => METRIC_CODE_ORDER[a] - METRIC_CODE_ORDER[b]
);

// 변경이력 툴팁 내용 생성
const getSingleChangeTooltipContent = (change: ChangeInfo): string => {
  const { changeDate, changeEndDate, changeDetail, changeType, category } = change;

  const formattedDate = changeEndDate
    ? `${formatChangeDate(changeDate)} ~ ${formatChangeDate(changeEndDate)}`
    : formatChangeDate(changeDate);

  const separator = " ";
  const detailWithSuffix = changeDetail
    ? getChangeDetailWithSuffix(changeDetail, category, changeType)
    : "";

  return detailWithSuffix
    ? `${formattedDate}${separator}${detailWithSuffix}`
    : formattedDate;
};

const getCombinedTooltipContent = (changes: ChangeInfo[]): string => {
  return changes
    .map((change) => getSingleChangeTooltipContent(change))
    .join("\n");
};

// 상태 뱃지 컴포넌트
const MAX_BADGE_COUNT = 4;

const StatusBadge = ({ change }: { change?: ChangeInfo[] }) => {
  if (!hasChangeInfo(change)) return null;

  const sortedChanges = [...change!].sort((a, b) => {
    const dateA = a.changeDate ? new Date(a.changeDate).getTime() : 0;
    const dateB = b.changeDate ? new Date(b.changeDate).getTime() : 0;
    return dateB - dateA;
  });
  const displayChanges = sortedChanges.slice(0, MAX_BADGE_COUNT);

  const tooltipContent = getCombinedTooltipContent(displayChanges);

  const badges = (
    <div className="inline-flex items-center">
      {displayChanges.map((item, index) => (
        <ChangeTypeBadge
          key={`${item.changeType}-${index}`}
          type={item.changeType}
          category={item.category}
          className="ml-2 cursor-default"
        />
      ))}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} color="#6B7280">
      {badges}
    </Tooltip>
  );
};

interface OrganizationHeatmapRowProps {
  type: "department" | "member";
  data: OrganizationDepartment | OrganizationMember;
  depth: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  summaryCounts: SummaryCounts;
  onToggle?: (code: string) => void;
}

export const OrganizationHeatmapRow = ({
  type,
  data,
  depth,
  hasChildren = false,
  isExpanded = false,
  summaryCounts,
  onToggle,
}: OrganizationHeatmapRowProps) => {
  const isDepartment = type === "department";
  const dept = isDepartment ? (data as OrganizationDepartment) : null;
  const member = !isDepartment ? (data as OrganizationMember) : null;
  const metrics = data.metrics as unknown as Record<string, MetricData>;
  const bdpiMetrics = data.metrics as BdpiMetrics;

  // 들여쓰기 계산
  const paddingLeft = isDepartment ? 16 + depth * 24 : 24 + depth * 24;

  // 이름 표시
  const displayName = isDepartment ? dept!.name : member!.name;
  const memberCount = isDepartment ? dept!.memberCount : null;
  const changes = isDepartment ? dept!.changes : member!.changes;

  return (
    <div className="flex border-b border-gray-200 hover:bg-gray-50/50 h-[44px]">
      {/* 조직/멤버 이름 - sticky left */}
      <div
        className="sticky left-0 z-10 bg-white border-r border-gray-300 shadow-sm flex items-center"
        style={{ width: COLUMN_WIDTHS.name, minWidth: COLUMN_WIDTHS.name }}
      >
        <div
          className="flex items-center flex-1 py-3"
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {isDepartment && hasChildren ? (
            <button
              onClick={() => onToggle?.(dept!.code)}
              className="mr-2 p-0.5 hover:bg-gray-200 rounded cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          ) : (
            <span className="mr-2 w-5" />
          )}
          <span className={`${isDepartment ? "font-semibold" : "font-medium"} text-gray-900`}>
            {displayName}
          </span>
          {memberCount !== null && (
            <span className="ml-1 text-sm text-gray-500">({memberCount})</span>
          )}
          <StatusBadge change={changes} />
        </div>
      </div>

      {/* Summary 셀들 */}
      <SummaryCell counts={summaryCounts} />

      {/* Metric 셀들 */}
      <div className="flex flex-1">
        {ALL_METRIC_CODES.map((code) => {
          const metric = metrics?.[code];
          const hasData =
            metric && typeof metric.value === "number" && metric.isUsed !== false;
          const score = hasData ? metric?.score ?? null : null;
          const value = hasData ? metric?.value ?? null : null;

          return (
            <div
              key={code}
              className="border-r border-gray-200 last:border-r-0"
              style={{ minWidth: COLUMN_WIDTHS.metric, maxWidth: COLUMN_WIDTHS.metric }}
            >
              <HeatmapCell metricCode={code} score={score} value={value} />
            </div>
          );
        })}
      </div>

      {/* BDPI - sticky right */}
      <div
        className="sticky right-0 z-10 bg-white border-l border-gray-300 shadow-sm flex items-center justify-center"
        style={{ width: COLUMN_WIDTHS.bdpi, minWidth: COLUMN_WIDTHS.bdpi }}
      >
        <span className="text-sm font-bold text-gray-700">
          {bdpiMetrics?.bdpi?.score !== undefined
            ? `${bdpiMetrics.bdpi.score.toFixed(0)}%`
            : "--"}
        </span>
      </div>
    </div>
  );
};

export default OrganizationHeatmapRow;
