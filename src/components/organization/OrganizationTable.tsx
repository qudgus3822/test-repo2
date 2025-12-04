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
  OrganizationMetricCategory,
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
  getChangeTypeBadgeColor,
  getChangeTypeLabel,
  formatChangeDate,
  getMemberEmail,
} from "@/utils/organization";
import { METRIC_CODE_NAMES, getMetricOrder } from "@/utils/metrics";
import { Tooltip } from "@/components/ui/Tooltip";
import { useOrganizationTree } from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// 탭 타입 → 지표 카테고리 매핑
const TAB_TO_CATEGORY: Record<
  Exclude<OrganizationTabType, "bdpi">,
  OrganizationMetricCategory
> = {
  codeQuality: "code_quality",
  reviewQuality: "review_quality",
  developmentEfficiency: "development_efficiency",
};

// 카테고리별 지표 코드 목록 (METRIC_CODE_ORDER 순서로 정렬)
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
  ].sort((a, b) => getMetricOrder(a) - getMetricOrder(b)),
  review_quality: [
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
  development_efficiency: [
    "DEPLOYMENT_FREQUENCY",
    "COMMIT_FREQUENCY",
    "LEAD_TIME",
    "FAILURE_DETECTION_TIME",
    "FAILURE_DIAGNOSIS_TIME",
    "FAILURE_RECOVERY_TIME",
    "DEPLOYMENT_SUCCESS_RATE",
    "MR_SIZE",
    "CODE_LINE_COUNT_PER_COMMIT",
  ].sort((a, b) => getMetricOrder(a) - getMetricOrder(b)),
};

// BDPI 탭용 metrics인지 확인하는 타입 가드
const isBdpiMetrics = (
  metrics: OrganizationMetrics,
): metrics is BdpiMetrics => {
  return "bdpi" in metrics && "codeQuality" in metrics;
};

// metrics 객체에서 특정 카테고리의 지표들을 순서대로 가져오기
const getMetricsByCategory = (
  metrics: OrganizationMetrics | undefined,
  category: OrganizationMetricCategory,
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
  activeTab: OrganizationTabType;
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

// 전월대비 표시
const ChangeRateDisplay = ({
  comparison,
}: {
  comparison: MonthlyComparison | undefined;
}) => {
  if (!comparison) return <span className="text-gray-400">--</span>;

  const { changePercent, direction } = comparison;
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

  return (
    <td
      className={clsx(
        "px-2 text-center text-sm font-medium align-middle border-r border-gray-200 w-[80px] min-w-[80px]",
        isFirst && "border-l",
        !isNoData && getScoreTextColor(score),
      )}
      style={{
        backgroundColor: isNoData
          ? SCORE_COLORS.noData
          : getScoreBgColor(score),
        color: isNoData ? SCORE_COLORS.noDataText : undefined,
      }}
    >
      {score !== null ? score.toFixed(1) : "--"}
    </td>
  );
};

// 단일 변경이력 툴팁 내용 생성 함수
// 형식: 날짜 상세내용 (이동전/이동후는 detail 앞에 줄바꿈 추가)
// GROUP: (자동), POLICY: (수동) 텍스트 추가
const getSingleChangeTooltipContent = (change: ChangeInfo): string => {
  const { changeDate, changeEndDate, changeDetail, category } = change;

  // 날짜 포맷팅 (기간이 있으면 start ~ end, 없으면 단일 날짜)
  const formattedDate = changeEndDate
    ? `${formatChangeDate(changeDate)} ~ ${formatChangeDate(changeEndDate)}`
    : formatChangeDate(changeDate);

  // 이동전/이동후는 detail 앞에 줄바꿈 추가
  // const isTransfer =
  //   changeType === "TRANSFERRED_IN" || changeType === "TRANSFERRED_OUT";
  // const separator = isTransfer && changeDetail ? "\n" : " ";
  const separator = " ";

  // category에 따라 suffix 결정
  const suffix =
    category === "GROUP" ? " (자동)" : category === "POLICY" ? " (수동)" : "";

  // changeDetail에 suffix 추가
  const detailWithSuffix = changeDetail ? `${changeDetail}${suffix}` : "";

  return detailWithSuffix
    ? `${formattedDate}${separator}${detailWithSuffix}`
    : formattedDate;
};

// 단일 상태 뱃지 컴포넌트 (툴팁 없이 뱃지만 렌더링)
const SingleBadge = ({ change }: { change: ChangeInfo }) => {
  const { changeType, category } = change;
  const color = getChangeTypeBadgeColor(changeType);

  // category에 따라 variant 결정: GROUP은 outlined, HR/POLICY는 filled
  const variant = category === "GROUP" ? "outlined" : "filled";

  const style =
    variant === "filled"
      ? { backgroundColor: color, color: "#E7E7E7" }
      : { border: `1px solid ${color}`, color };

  return (
    <span
      className="ml-2 px-2 py-0.5 text-xs font-medium rounded-xl cursor-default"
      style={style}
    >
      {getChangeTypeLabel(changeType)}
    </span>
  );
};

// 여러 변경이력의 툴팁 내용을 하나로 합치는 함수
const getCombinedTooltipContent = (changes: ChangeInfo[]): string => {
  return changes
    .map((change) => getSingleChangeTooltipContent(change))
    .join("\n");
};

// 상태 뱃지 컴포넌트 (배열 지원, 통합 Tooltip)
const StatusBadge = ({ change }: { change?: ChangeInfo[] }) => {
  if (!hasChangeInfo(change)) return null;

  const tooltipContent = getCombinedTooltipContent(change!);

  const badges = (
    <div className="inline-flex items-center">
      {change!.map((item, index) => (
        <SingleBadge key={`${item.changeType}-${index}`} change={item} />
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
}: {
  member: ApiOrganizationMember;
  depth: number;
  activeTab: OrganizationTabType;
}) => {
  const paddingLeft = 24 + depth * 24;

  // 카테고리별 지표 렌더링
  const renderMetricsCells = () => {
    if (activeTab === "bdpi") {
      const bdpiMetrics = member.metrics as BdpiMetrics;
      return (
        <>
          <ScoreCell score={bdpiMetrics.codeQuality.score} isFirst />
          <ScoreCell score={bdpiMetrics.reviewQuality.score} />
          <ScoreCell score={bdpiMetrics.efficiency.score} />
          <ScoreCell score={bdpiMetrics.bdpi.score} />
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

  // children을 부서와 멤버로 분리 (isEvaluationTarget: true인 것만 필터링 후 sortOrder로 정렬)
  const childDepartments: ApiOrganizationDepartment[] = [];
  const childMembers: ApiOrganizationMember[] = [];

  org.children?.forEach((child: ApiOrganizationNode) => {
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
          <ScoreCell score={bdpiMetrics.codeQuality.score} isFirst />
          <ScoreCell score={bdpiMetrics.reviewQuality.score} />
          <ScoreCell score={bdpiMetrics.efficiency.score} />
          <ScoreCell score={bdpiMetrics.bdpi.score} />
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
  month,
  activeTab,
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
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
