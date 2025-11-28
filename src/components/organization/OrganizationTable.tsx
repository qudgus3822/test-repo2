import { ChevronRight, ChevronDown, Search as SearchIcon } from "lucide-react";
import upIcon from "@/assets/icons/up_icon_green.svg";
import downIcon from "@/assets/icons/down_icon_red.svg";
import {
  useOrganizationStore,
  SCORE_EXCELLENT_THRESHOLD,
  SCORE_GOOD_THRESHOLD,
} from "@/store/useOrganizationStore";
import type {
  OrganizationUnit,
  OrganizationMember,
  OrganizationTabType,
  ScoreLevel,
} from "@/types/organization.types";
import {
  SCORE_COLORS,
  STATUS_BADGE_COLORS,
  TREND_COLORS,
} from "@/styles/colors";
import { clsx } from "clsx";

interface OrganizationTableProps {
  organizations: OrganizationUnit[];
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
  if (level === null) return SCORE_COLORS.none;
  if (level === "excellent") return SCORE_COLORS.excellent;
  if (level === "good") return SCORE_COLORS.good;
  return SCORE_COLORS.danger;
};

const getScoreTextColor = (score: number | null): string => {
  if (score === null) return "text-gray-400";
  return "text-gray-900";
};

// 변화율 표시
const ChangeRate = ({ rate }: { rate: number | null }) => {
  if (rate === null) return <span className="text-gray-400">--</span>;

  const isPositive = rate > 0;
  const isNegative = rate < 0;

  return (
    <div
      className="flex items-center justify-center gap-1 text-sm font-medium"
      style={{
        color: isPositive
          ? TREND_COLORS.increase
          : isNegative
          ? TREND_COLORS.decrease
          : undefined,
      }}
    >
      {(isPositive || isNegative) && (
        <img
          src={isPositive ? upIcon : downIcon}
          alt={isPositive ? "up" : "down"}
          className="w-4 h-4"
        />
      )}
      <span>{Math.abs(rate).toFixed(1)}%</span>
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
  return (
    <td
      className={clsx(
        "px-3 text-center text-sm font-medium align-middle border-r border-gray-200",
        isFirst && "border-l",
        getScoreTextColor(score),
      )}
      style={{ backgroundColor: getScoreBgColor(score) }}
    >
      {score !== null ? score.toFixed(1) : "--"}
    </td>
  );
};

// 멤버 행 컴포넌트
const MemberRow = ({
  member,
  depth,
  activeTab,
}: {
  member: OrganizationMember;
  depth: number;
  activeTab: OrganizationTabType;
}) => {
  const paddingLeft = 24 + depth * 24;

  // 상태 뱃지 색상
  const getStatusBadgeColor = (status: string) => {
    const colors =
      STATUS_BADGE_COLORS[status as keyof typeof STATUS_BADGE_COLORS] ||
      STATUS_BADGE_COLORS.default;
    return colors;
  };

  // 상태 뱃지 렌더링
  const renderStatusBadge = () => {
    if (!member.status) return null;

    return (
      <span
        className="ml-2 px-2 py-0.5 text-xs font-medium rounded"
        style={{
          backgroundColor: getStatusBadgeColor(member.status).bg,
          color: getStatusBadgeColor(member.status).text,
        }}
      >
        {member.status}
      </span>
    );
  };

  // 상태별 날짜 메시지 렌더링
  const renderStatusDateMessage = () => {
    if (!member.joinDate) return null;

    if (member.status === "직급변경" && member.previousRole) {
      return (
        <span className="ml-2 text-xs text-gray-500">
          {member.joinDate} (전){member.previousRole}
        </span>
      );
    }

    if (member.status === "퇴사") {
      return (
        <span className="ml-2 text-xs text-gray-500">{member.joinDate}</span>
      );
    }

    // 입사, 재직 등 기타 상태
    return (
      <span className="ml-2 text-xs text-gray-500">{member.joinDate}</span>
    );
  };

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 h-[70px]">
      <td
        className="pr-4 align-middle"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex items-center">
          <input
            type="checkbox"
            disabled
            className="mr-3 w-4 h-4 rounded border-gray-300 opacity-30 cursor-not-allowed"
          />
          <div className="flex items-center whitespace-nowrap">
            <span className="font-medium text-gray-900 whitespace-nowrap">
              {member.name}
            </span>
            <span className="ml-2 text-sm text-gray-500 whitespace-nowrap">
              {member.role}
            </span>
            {(member.status || member.joinDate) && (
              <span className="inline-flex items-center whitespace-nowrap">
                {renderStatusBadge()}
                {renderStatusDateMessage()}
              </span>
            )}
          </div>
        </div>
        <div
          className="text-xs text-gray-500 mt-0.5"
          style={{ marginLeft: "28px" }}
        >
          {member.email}
        </div>
      </td>
      {activeTab === "bdpi" ? (
        <>
          <ScoreCell score={member.codeQuality} isFirst />
          <ScoreCell score={member.reviewQuality} />
          <ScoreCell score={member.developmentEfficiency} />
          <ScoreCell score={member.bdpi} />
        </>
      ) : (
        <>
          <ScoreCell
            score={
              activeTab === "codeQuality"
                ? member.codeQuality
                : activeTab === "reviewQuality"
                ? member.reviewQuality
                : member.developmentEfficiency
            }
            isFirst
          />
        </>
      )}
      <td className="px-3 text-center align-middle">
        <ChangeRate rate={member.changeRate} />
      </td>
      <td className="px-3 text-center align-middle">
        <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
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
  activeTab,
}: {
  org: OrganizationUnit;
  depth: number;
  activeTab: OrganizationTabType;
}) => {
  const { expandedOrganizations, toggleOrganization, showMembers } =
    useOrganizationStore();
  const isExpanded = expandedOrganizations.has(org.id);
  const hasChildren =
    (org.children && org.children.length > 0) ||
    (org.members && org.members.length > 0);
  const paddingLeft = 16 + depth * 24;

  return (
    <>
      {/* 조직 행 */}
      <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 h-[70px]">
        <td
          className="pr-4 align-middle"
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <div className="flex items-center">
            <input
              type="checkbox"
              disabled
              className="mr-3 w-4 h-4 rounded border-gray-300 opacity-30 cursor-not-allowed"
            />
            {hasChildren ? (
              <button
                onClick={() => toggleOrganization(org.id)}
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
            <span className="font-semibold text-gray-900">{org.name}</span>
            <span className="ml-2 text-sm text-gray-500">
              ({org.memberCount})
            </span>
          </div>
        </td>
        {activeTab === "bdpi" ? (
          <>
            <ScoreCell score={org.codeQuality} isFirst />
            <ScoreCell score={org.reviewQuality} />
            <ScoreCell score={org.developmentEfficiency} />
            <ScoreCell score={org.bdpi} />
          </>
        ) : (
          <>
            <ScoreCell
              score={
                activeTab === "codeQuality"
                  ? org.codeQuality
                  : activeTab === "reviewQuality"
                  ? org.reviewQuality
                  : org.developmentEfficiency
              }
              isFirst
            />
          </>
        )}
        <td className="px-3 text-center align-middle">
          <ChangeRate rate={org.changeRate} />
        </td>
        <td className="px-3 text-center align-middle">
          <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <SearchIcon className="w-5 h-5" />
          </button>
        </td>
      </tr>

      {/* 하위 조직/멤버 렌더링 */}
      {isExpanded && (
        <>
          {/* 직속 멤버 렌더링 (showMembers가 true일 때만) */}
          {showMembers &&
            org.members?.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                depth={depth + 1}
                activeTab={activeTab}
              />
            ))}
          {/* 하위 조직 렌더링 */}
          {org.children?.map((child) => (
            <OrganizationRow
              key={child.id}
              org={child}
              depth={depth + 1}
              activeTab={activeTab}
            />
          ))}
        </>
      )}
    </>
  );
};

export const OrganizationTable = ({
  organizations,
}: OrganizationTableProps) => {
  const { activeTab } = useOrganizationStore();

  // 공통 th 스타일
  const thStyle = "px-3 py-3 text-center text-sm font-medium text-gray-700";

  // 테이블 헤더 결정
  const getTableHeaders = () => {
    if (activeTab === "bdpi") {
      return (
        <>
          <th className={`${thStyle} w-[7%]`}>코드품질</th>
          <th className={`${thStyle} w-[7%]`}>리뷰품질</th>
          <th className={`${thStyle} w-[7%]`}>개발효율</th>
          <th className={`${thStyle} w-[7%]`}>BDPI</th>
        </>
      );
    }

    const labels: Record<OrganizationTabType, string> = {
      bdpi: "BDPI",
      codeQuality: "코드품질",
      reviewQuality: "리뷰품질",
      developmentEfficiency: "개발효율",
    };

    return <th className={`${thStyle} w-[7%]`}>{labels[activeTab]}</th>;
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className={`${thStyle} text-left w-[52%]`}>조직 이름</th>
            {getTableHeaders()}
            <th className={`${thStyle} w-[10%]`}>전월비교</th>
            <th className={`${thStyle} w-[10%]`}>상세</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <OrganizationRow
              key={org.id}
              org={org}
              depth={0}
              activeTab={activeTab}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
