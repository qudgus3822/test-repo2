/**
 * OrganizationBdpiTable 컴포넌트
 * - BDPI 탭용 테이블 (하이어라키뷰)
 * - 조직 이름, 코드품질, 리뷰품질, 개발효율, BDPI, 전월비교, 상세 컬럼
 */

import { ChevronRight, ChevronDown, Search as SearchIcon } from "lucide-react";
import upIcon from "@/assets/icons/up_icon_green.svg";
import downIcon from "@/assets/icons/down_icon_red.svg";
import {
  useOrganizationStore,
  SCORE_EXCELLENT_THRESHOLD,
  SCORE_GOOD_THRESHOLD,
} from "@/store/useOrganizationStore";
import type {
  OrganizationDepartment,
  OrganizationMember,
  OrganizationNode,
  TabType,
  ScoreLevel,
  ChangeInfo,
  BdpiMetrics,
  MonthlyComparison,
} from "@/types/organization.types";
import { SCORE_COLORS, TREND_COLORS } from "@/styles/colors";
import { clsx } from "clsx";
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

interface OrganizationBdpiTableProps {
  month: string;
  activeTab: TabType;
  onDetailClick?: (item: OrganizationDepartment | OrganizationMember) => void;
}

// 점수에 따른 배경색 결정
const getScoreLevel = (score: number | null): ScoreLevel | null => {
  if (score === null) return null;
  if (score >= SCORE_EXCELLENT_THRESHOLD) return "excellent";
  if (score >= SCORE_GOOD_THRESHOLD) return "good";
  return "danger";
};

const getScoreBgColor = (score: number | null): string => {
  const level = getScoreLevel(score);
  if (level === null) return SCORE_COLORS.noScore;
  if (level === "excellent") return SCORE_COLORS.excellent;
  if (level === "good") return SCORE_COLORS.good;
  return SCORE_COLORS.danger;
};

const getScoreTextColor = (score: number | null): string => {
  if (score === null) return "text-gray-400";
  return "text-gray-900";
};

// 전월대비 표시
const ChangeRateDisplay = ({
  comparison,
}: {
  comparison: MonthlyComparison | undefined;
}) => {
  if (!comparison) return <span className="text-gray-400">--</span>;

  const { changePercent, direction } = comparison;

  if (direction === "new") {
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

// 점수 셀 컴포넌트
const ScoreCell = ({
  score,
  isFirst = false,
}: {
  score: number | null;
  isFirst?: boolean;
}) => {
  const isNoScore = score === null;

  return (
    <td
      className={clsx(
        "px-2 text-center text-sm font-medium align-middle border-r border-gray-200 w-[80px] min-w-[80px]",
        isFirst && "border-l",
        !isNoScore && getScoreTextColor(score)
      )}
      style={{
        backgroundColor: isNoScore ? SCORE_COLORS.noScore : getScoreBgColor(score),
      }}
    >
      {score !== null ? score.toFixed(1) : "--"}
    </td>
  );
};

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
  return changes.map((change) => getSingleChangeTooltipContent(change)).join("\n");
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
  onDetailClick,
}: {
  member: OrganizationMember;
  depth: number;
  onDetailClick?: (item: OrganizationMember) => void;
}) => {
  const paddingLeft = 24 + depth * 24;
  const bdpiMetrics = member.metrics as BdpiMetrics;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 h-[70px]">
      <td
        className="pr-4 align-middle whitespace-nowrap"
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
      <ScoreCell score={bdpiMetrics?.quality?.score ?? null} isFirst />
      <ScoreCell score={bdpiMetrics?.review?.score ?? null} />
      <ScoreCell score={bdpiMetrics?.efficiency?.score ?? null} />
      <ScoreCell score={bdpiMetrics?.bdpi?.score ?? null} />
      <td className="px-3 text-center align-middle">
        <ChangeRateDisplay comparison={bdpiMetrics?.monthlyComparison} />
      </td>
      <td className="px-3 text-center align-middle">
        <button
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
          onClick={() => onDetailClick?.(member)}
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

// 조직 행 컴포넌트
const OrganizationRow = ({
  org,
  depth,
  onDetailClick,
}: {
  org: OrganizationDepartment;
  depth: number;
  onDetailClick?: (item: OrganizationDepartment | OrganizationMember) => void;
}) => {
  const { expandedOrganizations, toggleOrganization, showMembers } =
    useOrganizationStore();
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
      <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 h-[70px]">
        <td
          className="pr-4 align-middle whitespace-nowrap"
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
        <ScoreCell score={bdpiMetrics?.quality?.score ?? null} isFirst />
        <ScoreCell score={bdpiMetrics?.review?.score ?? null} />
        <ScoreCell score={bdpiMetrics?.efficiency?.score ?? null} />
        <ScoreCell score={bdpiMetrics?.bdpi?.score ?? null} />
        <td className="px-3 text-center align-middle">
          <ChangeRateDisplay comparison={bdpiMetrics?.monthlyComparison} />
        </td>
        <td className="px-3 text-center align-middle">
          <button
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={() => onDetailClick?.(org)}
          >
            <SearchIcon className="w-5 h-5" />
          </button>
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
                onDetailClick={onDetailClick}
              />
            ))}
          {childDepartments.map((child) => (
            <OrganizationRow
              key={child.code}
              org={child}
              depth={depth + 1}
              onDetailClick={onDetailClick}
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
  onDetailClick,
}: OrganizationBdpiTableProps) => {
  const { data, isLoading, isError } = useOrganizationTree(month, activeTab);
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

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full table-fixed">
        <colgroup>
          <col />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className={`${thStyle} text-left whitespace-nowrap`}>조직 이름</th>
            <th className={`${thStyle} w-[7%]`}>코드품질</th>
            <th className={`${thStyle} w-[7%]`}>리뷰품질</th>
            <th className={`${thStyle} w-[7%]`}>개발효율</th>
            <th className={`${thStyle} w-[7%]`}>BDPI</th>
            <th className={`${thStyle} w-[7%]`}>전월비교</th>
            <th className={`${thStyle} w-[7%]`}>상세</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <OrganizationRow
              key={org.code}
              org={org}
              depth={0}
              onDetailClick={onDetailClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
