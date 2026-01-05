/**
 * OrganizationTable 컴포넌트
 * - 하이어라키뷰 테이블 (트리 구조)
 * - 고정 영역 (좌측 5개 컬럼) + 스크롤 영역 (30개 지표 + BDPI)
 * - 히트맵 시각화 (ProgressSquare 사용)
 */

import { ChevronRight, ChevronDown } from "lucide-react";
import { useOrganizationStore } from "@/store/useOrganizationStore";
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
} from "./heatmap/types";

// 플랫 아이템 타입
interface FlatTreeItem {
  type: "department" | "member";
  data: OrganizationDepartment | OrganizationMember;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

interface OrganizationTableProps {
  month: string;
  activeTab: TabType;
  hideValues?: boolean;
  onDetailClick?: (item: OrganizationDepartment | OrganizationMember) => void;
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

// 트리를 플랫 배열로 변환 (expand 상태 고려)
const flattenTreeWithExpand = (
  organizations: OrganizationDepartment[],
  expandedOrganizations: Set<string>,
  showMembers: boolean,
): FlatTreeItem[] => {
  const result: FlatTreeItem[] = [];

  const traverse = (node: OrganizationNode, depth: number) => {
    if (!node.isEvaluationTarget) return;

    if (node.type === "department") {
      const dept = node as OrganizationDepartment;
      const hasChildren = !!(dept.children && dept.children.length > 0);
      const isExpanded = expandedOrganizations.has(dept.code);

      result.push({
        type: "department",
        data: dept,
        depth,
        hasChildren,
        isExpanded,
      });

      if (isExpanded && dept.children) {
        // 멤버 먼저 표시
        if (showMembers) {
          dept.children
            .filter(
              (child): child is OrganizationMember =>
                child.type === "member" && child.isEvaluationTarget,
            )
            .forEach((member) => {
              result.push({
                type: "member",
                data: member,
                depth: depth + 1,
                hasChildren: false,
                isExpanded: false,
              });
            });
        }

        // 하위 부서 표시
        const childDepts = dept.children
          .filter(
            (child): child is OrganizationDepartment =>
              child.type === "department" && child.isEvaluationTarget,
          )
          .sort((a, b) => a.sortOrder - b.sortOrder);

        childDepts.forEach((child) => traverse(child, depth + 1));
      }
    }
  };

  organizations.forEach((org) => traverse(org, 0));

  return result;
};

// 고정 영역 행 컴포넌트 (부서)
const FixedDepartmentRow = ({
  item,
  summaryCounts,
  onToggle,
}: {
  item: FlatTreeItem;
  summaryCounts: SummaryCounts;
  onToggle: (code: string) => void;
}) => {
  const dept = item.data as OrganizationDepartment;
  const paddingLeft = 16 + item.depth * 24;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 h-[64px]">
      <td
        className="py-0 align-middle whitespace-nowrap border-r border-gray-200 w-[350px] h-[64px]"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex items-center h-full">
          {item.hasChildren ? (
            <button
              onClick={() => onToggle(dept.code)}
              className="mr-2 p-0.5 hover:bg-gray-200 rounded cursor-pointer"
            >
              {item.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          ) : (
            <span className="mr-2 w-5" />
          )}
          <span className="font-semibold text-gray-900">{dept.name}</span>
          <span className="ml-1 text-sm text-gray-500">
            ({dept.memberCount})
          </span>
          <StatusBadge change={dept.changes} />
        </div>
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

// 고정 영역 행 컴포넌트 (멤버)
const FixedMemberRow = ({
  item,
  summaryCounts,
}: {
  item: FlatTreeItem;
  summaryCounts: SummaryCounts;
}) => {
  const member = item.data as OrganizationMember;
  const paddingLeft = 24 + item.depth * 24;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 h-[64px]">
      <td
        className="py-0 align-middle whitespace-nowrap border-r border-gray-200 w-[350px] h-[64px]"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex flex-col justify-center h-full">
          <div className="flex items-center">
            <span className="mr-2 w-5" />
            <span className="font-medium text-gray-900">{member.name}</span>
            <span className="ml-2 text-sm text-gray-500">
              {getMemberRoleOrPositionLabel(member.title, member.personalTitle)}
            </span>
            <StatusBadge change={member.changes} />
          </div>
          <div
            className="text-xs text-gray-500 mt-0.5"
            style={{ marginLeft: "28px" }}
          >
            {member.email || getMemberEmail(member.employeeID)}
          </div>
        </div>
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
  item: FlatTreeItem;
  hideValue?: boolean;
}) => {
  const metrics = item.data.metrics as unknown as Record<string, MetricData>;
  const bdpiMetrics = item.data.metrics as BdpiMetrics;

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

export const OrganizationTable = ({
  month,
  activeTab,
  hideValues = false,
}: OrganizationTableProps) => {
  const { data, isLoading, isError } = useOrganizationTree(month, activeTab);
  const { expandedOrganizations, toggleOrganization, showMembers } =
    useOrganizationStore();

  const organizations = (data?.tree ?? [])
    .filter((org) => org.isEvaluationTarget)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // 트리를 플랫 배열로 변환
  const flatItems = flattenTreeWithExpand(
    organizations,
    expandedOrganizations,
    showMembers,
  );

  // 각 아이템의 summary counts 미리 계산
  const itemSummaryCountsMap = new Map<FlatTreeItem, SummaryCounts>();
  flatItems.forEach((item) => {
    const counts = calculateSummaryCounts(
      item.data.metrics as unknown as Record<string, MetricData>,
    );
    itemSummaryCountsMap.set(item, counts);
  });

  if (isLoading || isError || organizations.length === 0) {
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
                const criteriaText =
                  cat.id === "exceeds"
                    ? "100% 이상"
                    : cat.id === "achieved"
                    ? "100% 미만"
                    : cat.id === "good"
                    ? "80% 미만"
                    : "60% 미만";

                return (
                  <th
                    key={cat.id}
                    className="px-4 py-4 text-center text-sm font-medium text-gray-700 whitespace-nowrap border-r border-gray-200 w-[60px]"
                    style={{ backgroundColor: SUMMARY_BG_COLORS[cat.id] }}
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
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {flatItems.map((item, index) => {
              const summaryCounts =
                itemSummaryCountsMap.get(item) ??
                calculateSummaryCounts(undefined);
              return item.type === "department" ? (
                <FixedDepartmentRow
                  key={`fixed-${(item.data as OrganizationDepartment).code}`}
                  item={item}
                  summaryCounts={summaryCounts}
                  onToggle={toggleOrganization}
                />
              ) : (
                <FixedMemberRow
                  key={`fixed-${
                    (item.data as OrganizationMember).employeeID
                  }-${index}`}
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

                return (
                  <th
                    key={code}
                    className={`${thBaseStyle} border-r border-gray-200 w-[90px] min-w-[90px] max-w-[90px]`}
                  >
                    {displayName ? (
                      <>
                        {displayName[0]}
                        <br />
                        {displayName[1]}
                      </>
                    ) : (
                      METRIC_CODE_NAMES[code]?.slice(0, 4) || code.slice(0, 4)
                    )}
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
            {flatItems.map((item, index) => (
              <ScrollableRow
                key={
                  item.type === "department"
                    ? `scroll-${(item.data as OrganizationDepartment).code}`
                    : `scroll-${
                        (item.data as OrganizationMember).employeeID
                      }-${index}`
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
