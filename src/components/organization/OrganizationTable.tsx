import { ChevronRight, ChevronDown, Search as SearchIcon } from "lucide-react";
import upIcon from "@/assets/icons/up_icon_green.svg";
import downIcon from "@/assets/icons/down_icon_red.svg";
import {
  useOrganizationStore,
  SCORE_EXCELLENT_THRESHOLD,
  SCORE_GOOD_THRESHOLD,
} from "@/store/useOrganizationStore";
import type {
  ApiOrganizationDepartment,
  ApiOrganizationMember,
  ApiOrganizationNode,
  OrganizationTabType,
  ScoreLevel,
  ChangeInfo,
  OrganizationMetricValue,
  OrganizationMetricCategory,
} from "@/types/organization.types";
import { SCORE_COLORS, TREND_COLORS } from "@/styles/colors";
import { clsx } from "clsx";
import {
  getMemberRoleOrPositionLabel,
  hasChangeInfo,
  getChangeTypeBadgeColor,
  getChangeTypeLabel,
  formatChangeDate,
} from "@/utils/organization";
import { METRIC_CODE_NAMES } from "@/mocks/organization.mock";

// 탭 타입 → 지표 카테고리 매핑
const TAB_TO_CATEGORY: Record<
  Exclude<OrganizationTabType, "bdpi">,
  OrganizationMetricCategory
> = {
  codeQuality: "code_quality",
  reviewQuality: "review_quality",
  developmentEfficiency: "development_efficiency",
};

// 카테고리별 지표 코드 목록 (순서 유지)
const CATEGORY_METRIC_CODES: Record<OrganizationMetricCategory, string[]> = {
  code_quality: [
    "TECH_DEBT",
    "CODE_COMPLEXITY",
    "CODE_DUPLICATION",
    "CODE_SMELL",
    "TEST_COVERAGE",
    "SECURITY_VULNERABILITIES",
    "CODE_COUPLING",
    "BUG_COUNT",
    "INCIDENT_COUNT",
  ],
  review_quality: [
    "REVIEW_SPEED",
    "REVIEW_THOROUGHNESS",
    "REVIEW_COVERAGE",
    "REVIEW_RESPONSE_RATE",
    "REVIEW_PARTICIPATION_RATE",
    "REVIEW_COMMENT_QUALITY",
    "REVIEW_REWORK_RATE",
    "REVIEW_APPROVAL_TIME",
    "REVIEW_REQUEST_COUNT",
    "REVIEW_DEFECT_DETECTION",
    "REVIEW_FOLLOW_UP",
    "REVIEW_KNOWLEDGE_SHARING",
  ],
  development_efficiency: [
    "COMMIT_FREQUENCY",
    "DEPLOYMENT_FREQUENCY",
    "LEAD_TIME",
    "CYCLE_TIME",
    "DEPLOYMENT_SUCCESS_RATE",
    "MTTR",
    "CHANGE_FAILURE_RATE",
    "THROUGHPUT",
    "WORK_IN_PROGRESS",
  ],
};

// metrics 배열에서 특정 카테고리의 지표들을 순서대로 가져오기
const getMetricsByCategory = (
  metrics: OrganizationMetricValue[] | undefined,
  category: OrganizationMetricCategory,
): (OrganizationMetricValue | null)[] => {
  const codes = CATEGORY_METRIC_CODES[category];
  return codes.map((code) => {
    const metric = metrics?.find((m) => m.metricCode === code);
    return metric || null;
  });
};

interface OrganizationTableProps {
  organizations: ApiOrganizationDepartment[];
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
        "px-2 text-center text-sm font-medium align-middle border-r border-gray-200 w-[80px] min-w-[80px] max-w-[80px]",
        isFirst && "border-l",
        getScoreTextColor(score),
      )}
      style={{ backgroundColor: getScoreBgColor(score) }}
    >
      {score !== null ? score.toFixed(1) : "--"}
    </td>
  );
};

// 상태 뱃지 컴포넌트
const StatusBadge = ({ change }: { change?: ChangeInfo }) => {
  if (!hasChangeInfo(change)) return null;

  const { changeType, category } = change!;
  const color = getChangeTypeBadgeColor(changeType);

  // category에 따라 variant 결정: GROUP은 outlined, HR/POLICY는 filled
  const variant = category === "GROUP" ? "outlined" : "filled";

  const style =
    variant === "filled"
      ? { backgroundColor: color, color: "#E7E7E7" }
      : { border: `1px solid ${color}`, color };

  return (
    <span
      className="ml-2 px-2 py-0.5 text-xs font-medium rounded-xl"
      style={style}
    >
      {getChangeTypeLabel(changeType)}
    </span>
  );
};

// 변경이력 컴포넌트 (날짜 + 상세)
const ChangeInfoDisplay = ({ change }: { change?: ChangeInfo }) => {
  if (!hasChangeInfo(change)) return null;

  const { changeDate, changeEndDate, changeDetail } = change!;

  // 날짜나 상세 정보가 없으면 렌더링하지 않음
  if (!changeDate && !changeDetail) return null;

  // 날짜 포맷팅 (기간이 있으면 start ~ end, 없으면 단일 날짜)
  const formattedDate = changeEndDate
    ? `${formatChangeDate(changeDate)} ~ ${formatChangeDate(changeEndDate)}`
    : formatChangeDate(changeDate);

  return (
    <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
      {formattedDate}
      {changeDetail && ` ${changeDetail}`}
    </span>
  );
};

// 멤버 행 컴포넌트
const MemberRow = ({
  member,
  depth,
  activeTab,
}: {
  member: ApiOrganizationMember;
  depth: number;
  activeTab: OrganizationTabType;
}) => {
  const paddingLeft = 24 + depth * 24;

  // 카테고리별 지표 렌더링
  const renderMetricsCells = () => {
    if (activeTab === "bdpi") {
      return (
        <>
          <ScoreCell score={member.codeQuality} isFirst />
          <ScoreCell score={member.reviewQuality} />
          <ScoreCell score={member.developmentEfficiency} />
          <ScoreCell score={member.bdpi} />
        </>
      );
    }

    const category = TAB_TO_CATEGORY[activeTab];
    const categoryMetrics = getMetricsByCategory(member.metrics, category);

    return (
      <>
        {categoryMetrics.map((metric, index) => (
          <ScoreCell
            key={metric?.metricCode || index}
            score={metric?.value ?? null}
            isFirst={index === 0}
          />
        ))}
      </>
    );
  };

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 h-[70px]">
      <td
        className="pr-4 align-middle whitespace-nowrap"
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
              {getMemberRoleOrPositionLabel(member.role, member.position)}
            </span>
            <StatusBadge change={member.change} />
            <ChangeInfoDisplay change={member.change} />
          </div>
        </div>
        <div
          className="text-xs text-gray-500 mt-0.5 whitespace-nowrap"
          style={{ marginLeft: "28px" }}
        >
          {member.email}
        </div>
      </td>
      {renderMetricsCells()}
      {activeTab === "bdpi" && (
        <td className="px-3 text-center align-middle">
          <ChangeRate rate={member.changeRate} />
        </td>
      )}
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
  org: ApiOrganizationDepartment;
  depth: number;
  activeTab: OrganizationTabType;
}) => {
  const { expandedOrganizations, toggleOrganization, showMembers } =
    useOrganizationStore();
  const isExpanded = expandedOrganizations.has(org.code);
  const hasChildren = org.children && org.children.length > 0;
  const paddingLeft = 16 + depth * 24;

  // children을 부서와 멤버로 분리
  const childDepartments: ApiOrganizationDepartment[] = [];
  const childMembers: ApiOrganizationMember[] = [];

  org.children?.forEach((child: ApiOrganizationNode) => {
    if (child.type === "department") {
      childDepartments.push(child);
    } else if (child.type === "member") {
      childMembers.push(child);
    }
  });

  // 카테고리별 지표 렌더링
  const renderMetricsCells = () => {
    if (activeTab === "bdpi") {
      return (
        <>
          <ScoreCell score={org.codeQuality} isFirst />
          <ScoreCell score={org.reviewQuality} />
          <ScoreCell score={org.developmentEfficiency} />
          <ScoreCell score={org.bdpi} />
        </>
      );
    }

    const category = TAB_TO_CATEGORY[activeTab];
    const categoryMetrics = getMetricsByCategory(org.metrics, category);

    return (
      <>
        {categoryMetrics.map((metric, index) => (
          <ScoreCell
            key={metric?.metricCode || index}
            score={metric?.value ?? null}
            isFirst={index === 0}
          />
        ))}
      </>
    );
  };

  return (
    <>
      {/* 조직 행 */}
      <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 h-[70px]">
        <td
          className="pr-4 align-middle whitespace-nowrap"
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
            <StatusBadge change={org.change} />
            <ChangeInfoDisplay change={org.change} />
          </div>
        </td>
        {renderMetricsCells()}
        {activeTab === "bdpi" && (
          <td className="px-3 text-center align-middle">
            <ChangeRate rate={org.changeRate} />
          </td>
        )}
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
            childMembers.map((member) => (
              <MemberRow
                key={member.employeeID}
                member={member}
                depth={depth + 1}
                activeTab={activeTab}
              />
            ))}
          {/* 하위 조직 렌더링 */}
          {childDepartments.map((child) => (
            <OrganizationRow
              key={child.code}
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

    // 카테고리별 지표 헤더 렌더링
    const category = TAB_TO_CATEGORY[activeTab];
    const metricCodes = CATEGORY_METRIC_CODES[category];

    return (
      <>
        {metricCodes.map((code, index) => (
          <th
            key={code}
            className={`${thStyle} w-[80px] min-w-[80px] max-w-[80px]`}
            style={{
              borderLeft: index === 0 ? "1px solid #e5e7eb" : undefined,
              wordBreak: "keep-all",
            }}
          >
            {METRIC_CODE_NAMES[code] || code}
          </th>
        ))}
      </>
    );
  };

  // 지표 개수 계산
  const getMetricCount = () => {
    if (activeTab === "bdpi") return 4; // 코드품질, 리뷰품질, 개발효율, BDPI
    const category = TAB_TO_CATEGORY[activeTab];
    return CATEGORY_METRIC_CODES[category].length;
  };

  const metricCount = getMetricCount();

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full table-fixed">
        {activeTab !== "bdpi" && (
          <colgroup>
            <col style={{ width: "50%" }} />
            {Array.from({ length: metricCount }).map((_, i) => (
              <col key={i} style={{ width: "80px" }} />
            ))}
            <col style={{ width: "80px" }} />
          </colgroup>
        )}
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className={`${thStyle} text-left whitespace-nowrap`}>
              조직 이름
            </th>
            {getTableHeaders()}
            {activeTab === "bdpi" && (
              <th className={`${thStyle} w-[80px]`}>전월비교</th>
            )}
            <th className={`${thStyle} w-[80px]`}>상세</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <OrganizationRow
              key={org.code}
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
