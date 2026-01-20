/**
 * OrganizationBdpiTable 컴포넌트
 * - BDPI 탭용 테이블 (하이어라키뷰)
 * - 조직 이름, 코드품질, 리뷰품질, 개발효율, BDPI, 전월대비 컬럼
 * - 히트맵 시각화 (HeatmapCell 사용)
 */

import { ChevronRight, ChevronDown } from "lucide-react";
import upIcon from "@/assets/icons/up_icon_green.svg";
import downIcon from "@/assets/icons/down_icon_red.svg";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import type {
  OrganizationDepartment,
  OrganizationMember,
  OrganizationNode,
  TabType,
  ChangeInfo,
  BdpiMetrics,
  MonthlyComparison,
} from "@/types/organization.types";
import { TREND_COLORS } from "@/styles/colors";
import {
  getMemberRoleOrPositionLabel,
  hasChangeInfo,
  formatChangeDate,
  getMemberEmail,
  getChangeDetailWithSuffix,
} from "@/utils/organization";
import { Tooltip } from "@/components/ui/Tooltip";
import { useOrganizationTree } from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import { HeatmapCell } from "./heatmap/HeatmapCell";

// 집계 타입
export type AggregationType = "average" | "total";

interface OrganizationBdpiTableProps {
  month: string;
  activeTab: TabType;
  hideValues?: boolean;
  aggregationType?: AggregationType;
}

// BDPI 지표 코드 목록
const BDPI_METRIC_CODES = ["quality", "review", "efficiency", "bdpi"] as const;

// 전월대비 표시
const ChangeRateDisplay = ({
  comparison,
}: {
  comparison: MonthlyComparison | undefined;
}) => {
  if (!comparison) return <span className="text-gray-400">--</span>;

  const { changePercent, direction } = comparison;

  // 전월 데이터 없음 또는 당월 데이터 없음
  if (direction === "new" || direction === "no_data") {
    return <span className="text-gray-400">--</span>;
  }

  const isUp = direction === "up";
  const isDown = direction === "down";

  return (
    <div
      className="flex items-center justify-center gap-1 text-sm font-medium"
      style={{
        color: isUp
          ? TREND_COLORS.increase
          : isDown
            ? TREND_COLORS.decrease
            : undefined,
      }}
    >
      {(isUp || isDown) && (
        <img
          src={isUp ? upIcon : downIcon}
          alt={isUp ? "up" : "down"}
          className="w-4 h-4"
        />
      )}
      <span>{changePercent.toFixed(1)}%</span>
    </div>
  );
};

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

// 멤버 행 컴포넌트
const MemberRow = ({
  member,
  depth,
  hideValues = false,
}: {
  member: OrganizationMember;
  depth: number;
  hideValues?: boolean;
}) => {
  const paddingLeft = 24 + depth * 24;
  const bdpiMetrics = member.metrics as BdpiMetrics;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 h-[64px]">
      <td
        className="pr-4 align-middle whitespace-nowrap border-r border-gray-200"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex items-center">
          <div className="flex items-center whitespace-nowrap">
            <span className="font-medium text-gray-900 whitespace-nowrap">
              {member.name}
            </span>
            <span className="ml-2 text-sm text-gray-500 whitespace-nowrap">
              {getMemberRoleOrPositionLabel(member.title, member.personalTitle)}
            </span>
            <StatusBadge change={member.changes} />
          </div>
        </div>
        <div
          className="text-xs text-gray-500 mt-0.5 whitespace-nowrap"
          style={{ marginLeft: "28px" }}
        >
          {member.email || getMemberEmail(member.employeeID)}
        </div>
      </td>
      {BDPI_METRIC_CODES.map((code) => {
        const metric = bdpiMetrics?.[code];
        const score = metric?.score ?? null;
        return (
          <td
            key={code}
            className="px-2 py-1 text-center align-middle border-r border-gray-200 w-[100px] min-w-[100px] h-[64px]"
          >
            <HeatmapCell
              metricCode={code}
              score={score}
              value={score}
              hideValue={hideValues}
              showTooltip={false}
            />
          </td>
        );
      })}
      <td className="px-3 text-center align-middle">
        <ChangeRateDisplay comparison={bdpiMetrics?.monthlyComparison} />
      </td>
    </tr>
  );
};

// 조직 행 컴포넌트
const OrganizationRow = ({
  org,
  depth,
  hideValues = false,
}: {
  org: OrganizationDepartment;
  depth: number;
  hideValues?: boolean;
}) => {
  const expandedOrganizations = useOrganizationStore(
    (state) => state.expandedOrganizations,
  );
  const toggleOrganization = useOrganizationStore(
    (state) => state.toggleOrganization,
  );
  const showMembers = useOrganizationStore((state) => state.showMembers);
  const isExpanded = expandedOrganizations.has(org.code);
  const hasChildren = org.children && org.children.length > 0;
  const paddingLeft = 16 + depth * 24;

  const childDepartments: OrganizationDepartment[] = [];
  const childMembers: OrganizationMember[] = [];

  org.children?.forEach((child: OrganizationNode) => {
    if (!child.isEvaluationTarget) return;
    if (child.type === "department") {
      childDepartments.push(child);
    } else if (child.type === "member") {
      childMembers.push(child);
    }
  });

  childDepartments.sort((a, b) => a.sortOrder - b.sortOrder);

  const bdpiMetrics = org.metrics as BdpiMetrics;

  return (
    <>
      <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 h-[64px]">
        <td
          className="pr-4 align-middle whitespace-nowrap border-r border-gray-200"
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <div className="flex items-center">
            {hasChildren ? (
              <button
                onClick={() => toggleOrganization(org.code)}
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
            <span className="font-semibold text-gray-900 whitespace-nowrap">
              {org.name}
            </span>
            <span className="ml-2 text-sm text-gray-500 whitespace-nowrap">
              ({org.memberCount})
            </span>
            <StatusBadge change={org.changes} />
          </div>
        </td>
        {BDPI_METRIC_CODES.map((code) => {
          const metric = bdpiMetrics?.[code];
          const score = metric?.score ?? null;
          return (
            <td
              key={code}
              className="px-2 py-1 text-center align-middle border-r border-gray-200 w-[100px] min-w-[100px] h-[64px]"
            >
              <HeatmapCell
                metricCode={code}
                score={score}
                value={score}
                hideValue={hideValues}
                showTooltip={false}
              />
            </td>
          );
        })}
        <td className="px-3 text-center align-middle">
          <ChangeRateDisplay comparison={bdpiMetrics?.monthlyComparison} />
        </td>
      </tr>

      {isExpanded && (
        <>
          {showMembers &&
            childMembers.map((member) => (
              <MemberRow
                key={member.employeeID}
                member={member}
                depth={depth + 1}
                hideValues={hideValues}
              />
            ))}
          {childDepartments.map((child) => (
            <OrganizationRow
              key={child.code}
              org={child}
              depth={depth + 1}
              hideValues={hideValues}
            />
          ))}
        </>
      )}
    </>
  );
};

export const OrganizationBdpiTable = ({
  month,
  activeTab,
  hideValues = false,
  aggregationType = "average",
}: OrganizationBdpiTableProps) => {
  // BDPI 탭일 경우 API 옵션 설정
  const apiOptions =
    activeTab === "bdpi"
      ? {
          aggregation:
            aggregationType === "average"
              ? ("avg" as const)
              : ("total" as const),
          format: "tree" as const,
        }
      : undefined;

  const { data, isLoading, isError } = useOrganizationTree(
    month,
    activeTab,
    true,
    apiOptions,
  );
  const organizations = (data?.tree ?? [])
    .filter((org) => org.isEvaluationTarget)
    .sort((a, b) => a.sortOrder - b.sortOrder);

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

  const thStyle = "px-3 py-3 text-center text-sm font-medium text-gray-700";

  // [변경: 2026-01-19 00:00, 김병현 수정] thead 고정, tbody만 스크롤되도록 변경
  return (
    <div className="overflow-auto h-full border border-gray-200 rounded-lg">
      <table className="w-full table-fixed">
        <colgroup>
          <col />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-gray-200 bg-gray-50 h-[67px]">
            <th
              className={`${thStyle} text-left whitespace-nowrap border-r border-gray-200`}
            >
              조직 이름
            </th>
            <th className={`${thStyle} w-[7%] border-r border-gray-200`}>
              코드품질
            </th>
            <th className={`${thStyle} w-[7%] border-r border-gray-200`}>
              리뷰품질
            </th>
            <th className={`${thStyle} w-[7%] border-r border-gray-200`}>
              개발효율
            </th>
            <th className={`${thStyle} w-[7%] border-r border-gray-200`}>
              BDPI
            </th>
            <th className={`${thStyle} w-[7%]`}>전월대비</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <OrganizationRow
              key={org.code}
              org={org}
              depth={0}
              hideValues={hideValues}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
