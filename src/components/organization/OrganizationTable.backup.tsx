import { ChevronRight, ChevronDown } from "lucide-react";
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
  ChangeInfo,
  BdpiMetrics,
} from "@/types/organization.types";
import {
  hasChangeInfo,
  formatChangeDate,
  getChangeDetailWithSuffix,
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

// 지표 데이터 타입 (API 응답)
interface MetricData {
  score: number;
  isUsed: boolean;
  value: number;
  unit?: string;
}

// 플랫 아이템 타입
interface FlatTreeItem {
  type: "department" | "member";
  data: OrganizationDepartment | OrganizationMember;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

// 30개 지표 코드 목록 (순서대로)
const ALL_METRIC_CODES = Object.keys(METRIC_CODE_ORDER).sort(
  (a, b) => METRIC_CODE_ORDER[a] - METRIC_CODE_ORDER[b]
);

interface OrganizationTableProps {
  month: string;
  activeTab: TabType;
  onDetailClick?: (item: OrganizationDepartment | OrganizationMember) => void;
}

// 점수 등급별 카운트 계산
const calculateScoreCounts = (metrics: Record<string, MetricData> | undefined) => {
  const counts = { excellent: 0, achieved: 0, good: 0, warning: 0 };

  if (!metrics) return counts;

  Object.values(metrics).forEach((metric) => {
    if (!metric || typeof metric.score !== "number") return;

    const score = metric.score;
    if (score >= 90) {
      counts.excellent++;
    } else if (score >= SCORE_EXCELLENT_THRESHOLD) {
      counts.achieved++;
    } else if (score >= SCORE_GOOD_THRESHOLD) {
      counts.good++;
    } else {
      counts.warning++;
    }
  });

  return counts;
};

// score에 따른 배경 색상 결정
const getScoreColor = (score: number | null): string => {
  if (score === null) return "#F3F4F6";
  if (score >= 90) return "#10B981";
  if (score >= SCORE_EXCELLENT_THRESHOLD) return "#34D399";
  if (score >= SCORE_GOOD_THRESHOLD) return "#FCD34D";
  return "#F87171";
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
  showMembers: boolean
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
            .filter((child): child is OrganizationMember =>
              child.type === "member" && child.isEvaluationTarget
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
          .filter((child): child is OrganizationDepartment =>
            child.type === "department" && child.isEvaluationTarget
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
  onToggle,
}: {
  item: FlatTreeItem;
  onToggle: (code: string) => void;
}) => {
  const dept = item.data as OrganizationDepartment;
  const metrics = dept.metrics as unknown as Record<string, MetricData>;
  const counts = calculateScoreCounts(metrics);
  const paddingLeft = 16 + item.depth * 24;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 h-[44px]">
      <td
        className="py-3 align-middle whitespace-nowrap border-r border-gray-200 w-[200px]"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex items-center">
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
          <span className="ml-1 text-sm text-gray-500">({dept.memberCount})</span>
          <StatusBadge change={dept.changes} />
        </div>
      </td>
      <td
        className="px-2 py-3 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[50px]"
        style={{ backgroundColor: "#D1FAE5" }}
      >
        {counts.excellent}
      </td>
      <td
        className="px-2 py-3 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[50px]"
        style={{ backgroundColor: "#A7F3D0" }}
      >
        {counts.achieved}
      </td>
      <td
        className="px-2 py-3 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[50px]"
        style={{ backgroundColor: "#FEF3C7" }}
      >
        {counts.good}
      </td>
      <td
        className="px-2 py-3 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[50px]"
        style={{ backgroundColor: "#FECACA" }}
      >
        {counts.warning}
      </td>
    </tr>
  );
};

// 고정 영역 행 컴포넌트 (멤버)
const FixedMemberRow = ({ item }: { item: FlatTreeItem }) => {
  const member = item.data as OrganizationMember;
  const metrics = member.metrics as unknown as Record<string, MetricData>;
  const counts = calculateScoreCounts(metrics);
  const paddingLeft = 24 + item.depth * 24;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 h-[44px]">
      <td
        className="py-3 align-middle whitespace-nowrap border-r border-gray-200 w-[200px]"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex items-center">
          <span className="mr-2 w-5" />
          <span className="font-medium text-gray-900">{member.name}</span>
          <StatusBadge change={member.changes} />
        </div>
      </td>
      <td
        className="px-2 py-3 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[50px]"
        style={{ backgroundColor: "#D1FAE5" }}
      >
        {counts.excellent}
      </td>
      <td
        className="px-2 py-3 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[50px]"
        style={{ backgroundColor: "#A7F3D0" }}
      >
        {counts.achieved}
      </td>
      <td
        className="px-2 py-3 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[50px]"
        style={{ backgroundColor: "#FEF3C7" }}
      >
        {counts.good}
      </td>
      <td
        className="px-2 py-3 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[50px]"
        style={{ backgroundColor: "#FECACA" }}
      >
        {counts.warning}
      </td>
    </tr>
  );
};

// 스크롤 영역 행 컴포넌트
const ScrollableRow = ({ item }: { item: FlatTreeItem }) => {
  const metrics = item.data.metrics as unknown as Record<string, MetricData>;
  const bdpiMetrics = item.data.metrics as BdpiMetrics;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 h-[44px]">
      {ALL_METRIC_CODES.map((code) => {
        const metric = metrics?.[code];
        const hasData = metric && typeof metric.value === "number" && metric.isUsed !== false;
        const score = metric?.score ?? null;
        const value = metric?.value ?? null;
        const scorePercent = score !== null ? Math.min(Math.max(score, 0), 100) : 0;
        const bgColor = getScoreColor(score);

        return (
          <td
            key={code}
            className="px-1 py-3 text-center text-sm font-medium align-middle border-r border-gray-200 relative overflow-hidden w-[60px]"
          >
            {hasData && (
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${scorePercent}%`,
                  backgroundColor: bgColor,
                  opacity: 0.7,
                }}
              />
            )}
            <span className="relative z-10 text-gray-900">
              {hasData ? (typeof value === "number" ? value.toFixed(1) : "--") : "--"}
            </span>
          </td>
        );
      })}
      <td className="px-2 py-3 text-center text-sm font-semibold align-middle border-l border-gray-200 w-[60px]">
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
}: OrganizationTableProps) => {
  const { data, isLoading, isError } = useOrganizationTree(month, activeTab);
  const { expandedOrganizations, toggleOrganization, showMembers } = useOrganizationStore();

  const organizations = (data?.tree ?? [])
    .filter((org) => org.isEvaluationTarget)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // 트리를 플랫 배열로 변환
  const flatItems = flattenTreeWithExpand(organizations, expandedOrganizations, showMembers);

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

  const thBaseStyle = "px-2 py-2 text-center text-xs font-medium text-gray-700 whitespace-nowrap";

  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
      {/* 고정 영역 (좌측 5개 컬럼) */}
      <div className="flex-shrink-0 bg-white z-10" style={{ boxShadow: "4px 0 8px -2px rgba(0, 0, 0, 0.1)" }}>
        <table className="border-collapse">
          <thead>
            {/* 헤더 1행 */}
            <tr className="border-b border-gray-200 bg-gray-50 h-[40px]">
              <th
                rowSpan={2}
                className={`${thBaseStyle} text-left border-r border-gray-200 w-[200px]`}
              >
                조직 이름
              </th>
              <th
                className={`${thBaseStyle} border-r border-gray-200 w-[50px]`}
                style={{ backgroundColor: "#D1FAE5" }}
              >
                초과
                <br />
                달성
              </th>
              <th
                className={`${thBaseStyle} border-r border-gray-200 w-[50px]`}
                style={{ backgroundColor: "#A7F3D0" }}
              >
                달성
              </th>
              <th
                className={`${thBaseStyle} border-r border-gray-200 w-[50px]`}
                style={{ backgroundColor: "#FEF3C7" }}
              >
                양호
              </th>
              <th
                className={`${thBaseStyle} border-r border-gray-200 w-[50px]`}
                style={{ backgroundColor: "#FECACA" }}
              >
                주의
              </th>
            </tr>
            {/* 헤더 2행 (빈 셀) */}
            <tr className="border-b border-gray-200 bg-gray-50 h-[40px]">
              <th className="border-r border-gray-200 w-[50px]" style={{ backgroundColor: "#D1FAE5" }}></th>
              <th className="border-r border-gray-200 w-[50px]" style={{ backgroundColor: "#A7F3D0" }}></th>
              <th className="border-r border-gray-200 w-[50px]" style={{ backgroundColor: "#FEF3C7" }}></th>
              <th className="border-r border-gray-200 w-[50px]" style={{ backgroundColor: "#FECACA" }}></th>
            </tr>
          </thead>
          <tbody>
            {flatItems.map((item, index) =>
              item.type === "department" ? (
                <FixedDepartmentRow
                  key={`fixed-${(item.data as OrganizationDepartment).code}`}
                  item={item}
                  onToggle={toggleOrganization}
                />
              ) : (
                <FixedMemberRow
                  key={`fixed-${(item.data as OrganizationMember).employeeID}-${index}`}
                  item={item}
                />
              )
            )}
          </tbody>
        </table>
      </div>

      {/* 스크롤 영역 (30개 지표 + BDPI) */}
      <div className="flex-1 overflow-x-auto">
        <table className="border-collapse">
          <thead>
            {/* 헤더 1행 (카테고리) */}
            <tr className="border-b border-gray-200 bg-gray-50 h-[40px]">
              <th
                colSpan={9}
                className={`${thBaseStyle} border-r border-gray-200`}
              >
                코드품질
              </th>
              <th
                colSpan={12}
                className={`${thBaseStyle} border-r border-gray-200`}
              >
                리뷰품질
              </th>
              <th
                colSpan={9}
                className={`${thBaseStyle} border-r border-gray-200`}
              >
                개발효율
              </th>
              <th
                rowSpan={2}
                className={`${thBaseStyle} border-l border-gray-200 w-[60px]`}
              >
                BDPI
              </th>
            </tr>
            {/* 헤더 2행 (지표명) */}
            <tr className="border-b border-gray-200 bg-gray-50 h-[40px]">
              {ALL_METRIC_CODES.map((code) => {
                const displayName = METRIC_CODE_DISPLAY_NAMES[code];

                return (
                  <th
                    key={code}
                    className={`${thBaseStyle} border-r border-gray-200 w-[60px]`}
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
            </tr>
          </thead>
          <tbody>
            {flatItems.map((item, index) => (
              <ScrollableRow
                key={
                  item.type === "department"
                    ? `scroll-${(item.data as OrganizationDepartment).code}`
                    : `scroll-${(item.data as OrganizationMember).employeeID}-${index}`
                }
                item={item}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
