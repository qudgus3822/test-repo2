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
  MetricCategoryKey,
  OrganizationMetrics,
  BdpiMetrics,
  MetricScoreValue,
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
import { METRIC_CODE_NAMES, getMetricOrder } from "@/utils/metrics";
import { Tooltip } from "@/components/ui/Tooltip";
import { useOrganizationTree } from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";

// 탭 타입 → API 카테고리 키 매핑
// - UI 탭 ID (codeQuality 등) → API 카테고리 키 (quality 등)
const TAB_TO_CATEGORY: Record<Exclude<TabType, "bdpi">, MetricCategoryKey> = {
  codeQuality: "quality",
  reviewQuality: "review",
  developmentEfficiency: "efficiency",
};

// 카테고리별 지표 코드 목록 (METRIC_CODE_ORDER 순서로 정렬)
const CATEGORY_METRIC_CODES: Record<MetricCategoryKey, string[]> = {
  quality: [
    "TECH_DEBT",
    "CODE_COMPLEXITY",
    "CODE_DUPLICATION",
    "CODE_SMELL",
    "TEST_COVERAGE",
    "SECURITY_VULNERABILITIES",
    "CODE_DEFECT_DENSITY",
    "BUG_COUNT",
    "INCIDENT_COUNT",
  ].sort((a, b) => getMetricOrder(a) - getMetricOrder(b)),
  review: [
    "REVIEW_SPEED",
    "REVIEW_RESPONSE_RATE",
    "REVIEW_PARTICIPATION_RATE",
    "REVIEW_ACCEPTANCE_RATE",
    "REVIEW_FEEDBACK_CONCRETENESS",
    "REVIEW_REVIEWER_DIVERSE",
    "REVIEW_REQUEST_COUNT",
    "REVIEW_PARTICIPATION_COUNT",
    "REVIEW_PASS_RATE",
    "REVIEW_PARTICIPATION_NUMBER",
    "REVIEW_FEEDBACK_TIME",
    "REVIEW_COMPLETION_TIME",
  ].sort((a, b) => getMetricOrder(a) - getMetricOrder(b)),
  efficiency: [
    "DEPLOYMENT_FREQUENCY",
    "COMMIT_FREQUENCY",
    "LEAD_TIME",
    "FAILURE_DETECTION_TIME",
    "FAILURE_DIAGNOSIS_TIME",
    "FAILURE_RECOVERY_TIME",
    "DEPLOYMENT_SUCCESS_RATE",
    "PR_SIZE",
    "LOC_PER_COMMIT",
  ].sort((a, b) => getMetricOrder(a) - getMetricOrder(b)),
};

// BDPI 탭용 metrics인지 확인하는 타입 가드
const isBdpiMetrics = (
  metrics: OrganizationMetrics,
): metrics is BdpiMetrics => {
  return "bdpi" in metrics && "quality" in metrics;
};

// metrics 객체에서 특정 카테고리의 지표들을 순서대로 가져오기
const getMetricsByCategory = (
  metrics: OrganizationMetrics | undefined,
  category: MetricCategoryKey,
): (MetricScoreValue | null)[] => {
  if (!metrics || isBdpiMetrics(metrics)) {
    // BDPI metrics이거나 없으면 빈 배열 반환
    return CATEGORY_METRIC_CODES[category].map(() => null);
  }

  const codes = CATEGORY_METRIC_CODES[category];
  const metricsObj = metrics as unknown as Record<string, MetricScoreValue>;
  return codes.map((code) => {
    const metric = metricsObj[code];
    return metric || null;
  });
};

interface OrganizationTableProps {
  month: string; // YYYY-MM 형식
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

  // direction이 "new"이면 전월 데이터가 없으므로 "--" 표시
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
  isUsed = true,
}: {
  score: number | null;
  isFirst?: boolean;
  isUsed?: boolean;
}) => {
  // isUsed가 false이면 수집 불가 지표로 표시
  const isNoData = !isUsed;
  // score가 null이면 수집 가능하지만 데이터 없음
  const isNoScore = isUsed && score === null;

  return (
    <td
      className={clsx(
        "px-2 text-center text-sm font-medium align-middle border-r border-gray-200 w-[80px] min-w-[80px]",
        isFirst && "border-l",
        !isNoData && !isNoScore && getScoreTextColor(score),
      )}
      style={{
        backgroundColor: isNoData
          ? SCORE_COLORS.noData
          : isNoScore
            ? SCORE_COLORS.noScore
            : getScoreBgColor(score),
        color: isNoData ? SCORE_COLORS.noDataText : undefined,
      }}
    >
      {isNoData ? "N/A" : score !== null ? score.toFixed(1) : "--"}
    </td>
  );
};

// 단일 변경이력 툴팁 내용 생성 함수
// 형식: 날짜 상세내용 (이동전/이동후는 detail 앞에 줄바꿈 추가)
// GROUP && (CREATED/DELETED): (자동), POLICY: (수동) 텍스트 추가
const getSingleChangeTooltipContent = (change: ChangeInfo): string => {
  const { changeDate, changeEndDate, changeDetail, changeType, category } =
    change;

  // 날짜 포맷팅 (기간이 있으면 start ~ end, 없으면 단일 날짜)
  const formattedDate = changeEndDate
    ? `${formatChangeDate(changeDate)} ~ ${formatChangeDate(changeEndDate)}`
    : formatChangeDate(changeDate);

  const separator = " ";

  // 공통 util 함수를 사용하여 suffix가 추가된 상세 내용 생성
  const detailWithSuffix = changeDetail
    ? getChangeDetailWithSuffix(changeDetail, category, changeType)
    : "";

  return detailWithSuffix
    ? `${formattedDate}${separator}${detailWithSuffix}`
    : formattedDate;
};

// 여러 변경이력의 툴팁 내용을 하나로 합치는 함수
const getCombinedTooltipContent = (changes: ChangeInfo[]): string => {
  return changes
    .map((change) => getSingleChangeTooltipContent(change))
    .join("\n");
};

// 상태 뱃지 컴포넌트 (배열 지원, 통합 Tooltip)
// 최대 4개까지만 표시, changeDate 기준 최신순 정렬
const MAX_BADGE_COUNT = 4;

const StatusBadge = ({ change }: { change?: ChangeInfo[] }) => {
  if (!hasChangeInfo(change)) return null;

  // changeDate 기준 최신순 정렬 후 최대 4개까지만 표시
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
  activeTab,
  onDetailClick,
}: {
  member: OrganizationMember;
  depth: number;
  activeTab: TabType;
  onDetailClick?: (item: OrganizationMember) => void;
}) => {
  const paddingLeft = 24 + depth * 24;

  // 카테고리별 지표 렌더링
  const renderMetricsCells = () => {
    if (activeTab === "bdpi") {
      const bdpiMetrics = member.metrics as BdpiMetrics;
      return (
        <>
          <ScoreCell score={bdpiMetrics?.quality?.score ?? null} isFirst />
          <ScoreCell score={bdpiMetrics?.review?.score ?? null} />
          <ScoreCell score={bdpiMetrics?.efficiency?.score ?? null} />
          <ScoreCell score={bdpiMetrics?.bdpi?.score ?? null} />
        </>
      );
    }

    const category = TAB_TO_CATEGORY[activeTab];
    const categoryMetrics = getMetricsByCategory(member.metrics, category);

    return (
      <>
        {categoryMetrics.map((metric, index) => (
          <ScoreCell
            key={index}
            score={metric?.score ?? null}
            isFirst={index === 0}
            isUsed={metric?.isUsed ?? true}
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
      {renderMetricsCells()}
      {activeTab === "bdpi" && (
        <td className="px-3 text-center align-middle">
          <ChangeRateDisplay
            comparison={(member.metrics as BdpiMetrics).monthlyComparison}
          />
        </td>
      )}
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
  activeTab,
  onDetailClick,
}: {
  org: OrganizationDepartment;
  depth: number;
  activeTab: TabType;
  onDetailClick?: (item: OrganizationDepartment | OrganizationMember) => void;
}) => {
  const { expandedOrganizations, toggleOrganization, showMembers } =
    useOrganizationStore();
  const isExpanded = expandedOrganizations.has(org.code);
  const hasChildren = org.children && org.children.length > 0;
  const paddingLeft = 16 + depth * 24;

  // children을 부서와 멤버로 분리 (isEvaluationTarget: true인 것만 필터링 후 sortOrder로 정렬)
  const childDepartments: OrganizationDepartment[] = [];
  const childMembers: OrganizationMember[] = [];

  org.children?.forEach((child: OrganizationNode) => {
    if (!child.isEvaluationTarget) return; // 평가 대상이 아니면 제외
    if (child.type === "department") {
      childDepartments.push(child);
    } else if (child.type === "member") {
      childMembers.push(child);
    }
  });

  // 부서는 sortOrder로 정렬
  childDepartments.sort((a, b) => a.sortOrder - b.sortOrder);

  // 카테고리별 지표 렌더링
  const renderMetricsCells = () => {
    if (activeTab === "bdpi") {
      const bdpiMetrics = org.metrics as BdpiMetrics;
      return (
        <>
          <ScoreCell score={bdpiMetrics?.quality?.score ?? null} isFirst />
          <ScoreCell score={bdpiMetrics?.review?.score ?? null} />
          <ScoreCell score={bdpiMetrics?.efficiency?.score ?? null} />
          <ScoreCell score={bdpiMetrics?.bdpi?.score ?? null} />
        </>
      );
    }

    const category = TAB_TO_CATEGORY[activeTab];
    const categoryMetrics = getMetricsByCategory(org.metrics, category);

    return (
      <>
        {categoryMetrics.map((metric, index) => (
          <ScoreCell
            key={index}
            score={metric?.score ?? null}
            isFirst={index === 0}
            isUsed={metric?.isUsed ?? true}
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
            <StatusBadge change={org.changes} />
          </div>
        </td>
        {renderMetricsCells()}
        {activeTab === "bdpi" && (
          <td className="px-3 text-center align-middle">
            <ChangeRateDisplay
              comparison={(org.metrics as BdpiMetrics).monthlyComparison}
            />
          </td>
        )}
        <td className="px-3 text-center align-middle">
          <button
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={() => onDetailClick?.(org)}
          >
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
                onDetailClick={onDetailClick}
              />
            ))}
          {/* 하위 조직 렌더링 */}
          {childDepartments.map((child) => (
            <OrganizationRow
              key={child.code}
              org={child}
              depth={depth + 1}
              activeTab={activeTab}
              onDetailClick={onDetailClick}
            />
          ))}
        </>
      )}
    </>
  );
};

export const OrganizationTable = ({
  month,
  activeTab,
  onDetailClick,
}: OrganizationTableProps) => {
  // API에서 조직 트리 가져오기 (탭별로 다른 API 호출)
  const { data, isLoading, isError } = useOrganizationTree(month, activeTab);
  // isEvaluationTarget: true인 조직만 필터링 후 sortOrder로 정렬
  const organizations = (data?.tree ?? [])
    .filter((org) => org.isEvaluationTarget)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // 로딩, 에러, 데이터 없음 상태
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
            className={`${thStyle} w-[80px] min-w-[80px] max-w-[80px] break-words`}
            style={{
              borderLeft: index === 0 ? "1px solid #e5e7eb" : undefined,
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
        {activeTab === "bdpi" ? (
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "80px" }} />
          </colgroup>
        ) : (
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
              <th className={`${thStyle} w-[7%]`}>전월비교</th>
            )}
            <th
              className={`${thStyle} ${
                activeTab === "bdpi" ? "w-[7%]" : "w-[80px]"
              }`}
            >
              상세
            </th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <OrganizationRow
              key={org.code}
              org={org}
              depth={0}
              activeTab={activeTab}
              onDetailClick={onDetailClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
