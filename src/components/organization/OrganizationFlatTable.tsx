/**
 * OrganizationFlatTable 컴포넌트
 * - 플랫뷰 테이블 (실/팀/개인 필터)
 * - 고정 영역 (좌측 5개 컬럼) + 스크롤 영역 (30개 지표 + BDPI)
 * - 히트맵 시각화 (ProgressSquare 사용)
 * - 지표별 정렬 기능 포함
 */

import { useState, useMemo, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowDownUp } from "lucide-react";
import type {
  OrganizationDepartment,
  OrganizationMember,
  OrganizationNode,
  TabType,
  BdpiMetrics,
  ChangeInfo,
} from "@/types/organization.types";
import {
  hasChangeInfo,
  formatChangeDate,
  getChangeDetailWithSuffix,
  getMemberRoleOrPositionLabel,
  getMemberEmail,
} from "@/utils/organization";
import {
  METRIC_CODE_NAMES,
  METRIC_CODE_DISPLAY_NAMES,
  METRIC_CODE_ORDER,
} from "@/utils/metrics";
import { Tooltip } from "@/components/ui/Tooltip";
import { useOrganizationTree } from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import { HeatmapCell } from "./heatmap/HeatmapCell";
import {
  calculateSummaryCounts,
  SUMMARY_CATEGORIES,
  SUMMARY_BG_COLORS,
  type MetricData,
  type SummaryCounts,
  type SortConfig,
} from "./heatmap/types";

// 플랫뷰 필터 타입
export type FlatViewFilterType = "room" | "team" | "member";

interface OrganizationFlatTableProps {
  month: string;
  activeTab: TabType;
  filterType?: FlatViewFilterType;
  hideValues?: boolean;
  onDetailClick?: (item: OrganizationDepartment | OrganizationMember) => void;
}

// 플랫 데이터 아이템 타입
interface FlatItem {
  type: "department" | "member";
  data: OrganizationDepartment | OrganizationMember;
  level: number;
  parentName?: string;
}

// 30개 지표 코드 목록 (순서대로)
const ALL_METRIC_CODES = Object.keys(METRIC_CODE_ORDER).sort(
  (a, b) => METRIC_CODE_ORDER[a] - METRIC_CODE_ORDER[b],
);

// 변경이력 툴팁 내용 생성
const getSingleChangeTooltipContent = (change: ChangeInfo): string => {
  const { changeDate, changeEndDate, changeDetail, changeType, category } =
    change;

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

// 트리를 플랫 배열로 변환하는 함수
const flattenTree = (
  nodes: OrganizationNode[],
  filterType: FlatViewFilterType = "room",
): FlatItem[] => {
  const result: FlatItem[] = [];

  const traverse = (node: OrganizationNode, parentName?: string) => {
    if (!node.isEvaluationTarget) return;

    if (node.type === "department") {
      const dept = node as OrganizationDepartment;

      if (filterType === "room" && dept.level === 2) {
        result.push({
          type: "department",
          data: dept,
          level: dept.level,
          parentName,
        });
      } else if (filterType === "team" && dept.level === 3) {
        result.push({
          type: "department",
          data: dept,
          level: dept.level,
          parentName,
        });
      }

      if (dept.children) {
        dept.children.forEach((child) => traverse(child, dept.name));
      }
    } else if (node.type === "member") {
      if (filterType === "member") {
        result.push({
          type: "member",
          data: node,
          level: node.level,
          parentName,
        });
      }
    }
  };

  nodes.forEach((node) => traverse(node));

  return result;
};

// 고정 영역 행 컴포넌트
const FixedRow = ({
  item,
  summaryCounts,
}: {
  item: FlatItem;
  summaryCounts: SummaryCounts;
}) => {
  const data = item.data;
  const isDepartment = item.type === "department";

  const displayName = isDepartment
    ? (data as OrganizationDepartment).name
    : (data as OrganizationMember).name;

  const memberCount = isDepartment
    ? (data as OrganizationDepartment).memberCount
    : null;

  const member = !isDepartment ? (data as OrganizationMember) : null;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 h-[64px]">
      <td className="px-5 py-4 align-middle whitespace-nowrap border-r border-gray-200 w-[350px] h-[64px]">
        {isDepartment ? (
          <div className="flex items-center h-full">
            <span className="font-medium text-gray-900">{displayName}</span>
            {memberCount !== null && (
              <span className="ml-1 text-sm text-gray-500">
                ({memberCount})
              </span>
            )}
            <StatusBadge change={data.changes} />
          </div>
        ) : (
          <div className="flex flex-col justify-center h-full">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{displayName}</span>
              <span className="ml-2 text-sm text-gray-500">
                {getMemberRoleOrPositionLabel(
                  member!.title,
                  member!.personalTitle,
                )}
              </span>
              <StatusBadge change={data.changes} />
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {member!.email || getMemberEmail(member!.employeeID)}
            </div>
          </div>
        )}
      </td>
      {SUMMARY_CATEGORIES.map((cat) => (
        <td
          key={cat.id}
          className="px-4 py-4 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[60px] h-[64px]"
        >
          {summaryCounts[cat.id]}
        </td>
      ))}
    </tr>
  );
};

// 스크롤 영역 행 컴포넌트
const ScrollableRow = ({
  item,
  hideValue = false,
}: {
  item: FlatItem;
  hideValue?: boolean;
}) => {
  const data = item.data;
  const metrics = data.metrics as unknown as Record<string, MetricData>;
  const bdpiMetrics = data.metrics as BdpiMetrics;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 h-[64px]">
      {ALL_METRIC_CODES.map((code) => {
        const metric = metrics?.[code];
        const hasData =
          metric && typeof metric.value === "number" && metric.isUsed !== false;
        const score = hasData ? metric?.score ?? null : null;
        const value = hasData ? metric?.value ?? null : null;

        return (
          <td
            key={code}
            className="px-2 py-1 text-center align-middle border-r border-gray-200 w-[90px] min-w-[90px] max-w-[90px] h-[64px]"
          >
            <HeatmapCell
              metricCode={code}
              score={score}
              value={value}
              hideValue={hideValue}
            />
          </td>
        );
      })}
      <td className="px-5 py-4 text-center text-sm font-semibold align-middle border-l border-gray-200 w-[90px] min-w-[90px] max-w-[90px] h-[64px]">
        {bdpiMetrics?.bdpi?.score !== undefined
          ? `${bdpiMetrics.bdpi.score.toFixed(0)}%`
          : "--"}
      </td>
    </tr>
  );
};

export const OrganizationFlatTable = ({
  month,
  activeTab,
  filterType = "room",
  hideValues = false,
}: OrganizationFlatTableProps) => {
  const { data, isLoading, isError } = useOrganizationTree(month, activeTab);
  const flatItems = flattenTree(data?.tree ?? [], filterType);

  // 정렬 상태
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: null,
  });

  // 정렬 토글 (3단계: null → asc → desc → null)
  const toggleSort = useCallback((column: string) => {
    setSortConfig((prev) => {
      // 다른 컬럼 클릭 시 해당 컬럼 오름차순으로 시작
      if (prev.column !== column) {
        return { column, direction: "asc" };
      }
      // 같은 컬럼 클릭 시 순환: asc → desc → null
      if (prev.direction === "asc") {
        return { column, direction: "desc" };
      }
      if (prev.direction === "desc") {
        return { column: null, direction: null };
      }
      return { column, direction: "asc" };
    });
  }, []);

  // 각 아이템의 summary counts 미리 계산
  const itemSummaryCountsMap = useMemo(() => {
    const map = new Map<FlatItem, SummaryCounts>();
    flatItems.forEach((item) => {
      const counts = calculateSummaryCounts(
        item.data.metrics as unknown as Record<string, MetricData>,
      );
      map.set(item, counts);
    });
    return map;
  }, [flatItems]);

  // Summary 카테고리 ID 목록
  const summaryCategoryIds = SUMMARY_CATEGORIES.map((cat) => cat.id);

  // 정렬된 아이템
  const sortedItems = useMemo(() => {
    // 정렬이 비활성화된 경우 원본 순서 유지
    if (!sortConfig.column || !sortConfig.direction) {
      return flatItems;
    }

    return [...flatItems].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      // Summary 카테고리 정렬
      if (
        summaryCategoryIds.includes(
          sortConfig.column as SummaryCounts[keyof SummaryCounts] extends number
            ? keyof SummaryCounts
            : never,
        )
      ) {
        const aCounts = itemSummaryCountsMap.get(a) ?? {
          exceeds: 0,
          achieved: 0,
          good: 0,
          caution: 0,
        };
        const bCounts = itemSummaryCountsMap.get(b) ?? {
          exceeds: 0,
          achieved: 0,
          good: 0,
          caution: 0,
        };
        aValue = aCounts[sortConfig.column as keyof SummaryCounts] ?? 0;
        bValue = bCounts[sortConfig.column as keyof SummaryCounts] ?? 0;
      } else {
        // 지표 정렬
        const aMetrics = a.data.metrics as unknown as Record<
          string,
          MetricData
        >;
        const bMetrics = b.data.metrics as unknown as Record<
          string,
          MetricData
        >;
        aValue = aMetrics?.[sortConfig.column!]?.score ?? -1;
        bValue = bMetrics?.[sortConfig.column!]?.score ?? -1;
      }

      if (sortConfig.direction === "asc") {
        return aValue - bValue;
      }
      return bValue - aValue;
    });
  }, [flatItems, sortConfig, itemSummaryCountsMap, summaryCategoryIds]);

  if (isLoading || isError || flatItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[510px]">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <p className="text-gray-500">수집된 데이터가 없습니다.</p>
        )}
      </div>
    );
  }

  const thBaseStyle =
    "px-5 py-4 text-center text-sm font-medium text-gray-700 whitespace-nowrap";

  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
      {/* 고정 영역 (좌측 5개 컬럼) */}
      <div
        className="flex-shrink-0 bg-white z-10"
        style={{ boxShadow: "4px 0 8px -2px rgba(0, 0, 0, 0.1)" }}
      >
        <table className="border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 h-[48px]">
              <th
                className={`${thBaseStyle} text-left border-r border-gray-200 w-[350px]`}
              >
                조직 이름
              </th>
              {SUMMARY_CATEGORIES.map((cat) => {
                const isActive =
                  sortConfig.column === cat.id && sortConfig.direction !== null;

                const criteriaText =
                  cat.id === "exceeds"
                    ? "100% 이상"
                    : cat.id === "achieved"
                    ? "100% 미만"
                    : cat.id === "good"
                    ? "80% 미만"
                    : "60% 미만";

                // 정렬 아이콘 렌더링
                const renderSortIcon = () => {
                  if (!isActive) {
                    return (
                      <ArrowDownUp className="w-4.5 h-4.5 text-gray-500" />
                    );
                  }
                  if (sortConfig.direction === "asc") {
                    return <ArrowUp className="w-4.5 h-4.5 text-blue-600" />;
                  }
                  return <ArrowDown className="w-4.5 h-4.5 text-blue-600" />;
                };

                return (
                  <th
                    key={cat.id}
                    className={`px-4 py-4 text-center text-sm font-medium text-gray-700 whitespace-nowrap border-r border-gray-200 w-[60px] cursor-pointer hover:brightness-95 select-none ${
                      isActive ? "ring-2 ring-inset ring-blue-400" : ""
                    }`}
                    style={{ backgroundColor: SUMMARY_BG_COLORS[cat.id] }}
                    onClick={() => toggleSort(cat.id)}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span>
                        {cat.id === "exceeds"
                          ? "초과달성"
                          : cat.id === "achieved"
                          ? "우수"
                          : cat.id === "good"
                          ? "경고"
                          : "위험"}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        {criteriaText}
                      </span>
                      <span className="mt-0.5">{renderSortIcon()}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, index) => {
              const summaryCounts =
                itemSummaryCountsMap.get(item) ??
                calculateSummaryCounts(undefined);
              return (
                <FixedRow
                  key={
                    item.type === "department"
                      ? (item.data as OrganizationDepartment).code
                      : `${
                          (item.data as OrganizationMember).employeeID
                        }-${index}`
                  }
                  item={item}
                  summaryCounts={summaryCounts}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 스크롤 영역 (30개 지표 + BDPI) */}
      <div className="flex-1 overflow-x-auto">
        <table className="border-collapse table-fixed">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 h-[48px]">
              {ALL_METRIC_CODES.map((code) => {
                const displayName = METRIC_CODE_DISPLAY_NAMES[code];
                const isActive =
                  sortConfig.column === code && sortConfig.direction !== null;

                // 정렬 아이콘 렌더링
                const renderSortIcon = () => {
                  if (!isActive) {
                    return (
                      <ArrowDownUp className="w-4.5 h-4.5 text-gray-400" />
                    );
                  }
                  if (sortConfig.direction === "asc") {
                    return <ArrowUp className="w-4.5 h-4.5 text-blue-600" />;
                  }
                  return <ArrowDown className="w-4.5 h-4.5 text-blue-600" />;
                };

                return (
                  <th
                    key={code}
                    className={`${thBaseStyle} border-r border-gray-200 w-[90px] min-w-[90px] max-w-[90px] cursor-pointer hover:bg-gray-100 select-none ${
                      isActive ? "bg-blue-50" : ""
                    }`}
                    onClick={() => toggleSort(code)}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span>
                        {displayName ? (
                          <>
                            {displayName[0]}
                            <br />
                            {displayName[1]}
                          </>
                        ) : (
                          METRIC_CODE_NAMES[code]?.slice(0, 4) ||
                          code.slice(0, 4)
                        )}
                      </span>
                      <span className="mt-0.5">{renderSortIcon()}</span>
                    </div>
                  </th>
                );
              })}
              <th
                className={`${thBaseStyle} border-l border-gray-200 w-[90px] min-w-[90px] max-w-[90px]`}
              >
                BDPI
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, index) => (
              <ScrollableRow
                key={
                  item.type === "department"
                    ? (item.data as OrganizationDepartment).code
                    : `${(item.data as OrganizationMember).employeeID}-${index}`
                }
                item={item}
                hideValue={hideValues}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
