/**
 * OrganizationTable 컴포넌트
 * - 하이어라키뷰 테이블 (트리 구조)
 * - 고정 영역 (좌측 5개 컬럼) + 스크롤 영역 (30개 지표 + BDPI)
 * - 히트맵 시각화 (ProgressSquare 사용)
 * - 지표 칼럼 드래그 앤 드롭 정렬 기능
 */

import { useState, useCallback, useEffect } from "react";
import { ChevronRight, ChevronDown, GripHorizontal, Info } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  useOrganizationTree,
  useMetricOrder,
  useUpdateMetricOrder,
} from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import { HeatmapCell } from "./heatmap/HeatmapCell";
import { MetricDetailInfo } from "./MetricDetailInfo";
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

// 집계 타입
export type AggregationType = "average" | "total";

// 총합 모드에서 표시할 지표 코드 목록
const TOTAL_MODE_METRIC_CODES = [
  "BUG_COUNT",
  "INCIDENT_COUNT",
  "REVIEW_REQUEST_COUNT",
  "REVIEW_PARTICIPATION_COUNT",
  "COMMIT_FREQUENCY",
  "DEPLOYMENT_FREQUENCY",
];

interface OrganizationTableProps {
  month: string;
  activeTab: TabType;
  hideValues?: boolean;
  onDetailClick?: (item: OrganizationDepartment | OrganizationMember) => void;
  aggregationType?: AggregationType;
}

// 30개 지표 코드 목록 (순서대로) + BDPI
const ALL_METRIC_CODES = [
  ...Object.keys(METRIC_CODE_ORDER).sort(
    (a, b) => METRIC_CODE_ORDER[a] - METRIC_CODE_ORDER[b],
  ),
  "bdpi", // BDPI를 마지막에 추가
];

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
          className="px-2 py-4 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[72px] h-[64px]"
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
          className="px-2 py-4 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[72px] h-[64px]"
        >
          {summaryCounts[cat.id]}
        </td>
      ))}
    </tr>
  );
};

// 드래그 가능한 지표 헤더 컴포넌트
interface SortableMetricHeaderProps {
  code: string;
  displayName: string[] | undefined;
  isSelected?: boolean;
  onSelect?: (code: string) => void;
}

const SortableMetricHeader = ({
  code,
  displayName,
  isSelected = false,
  onSelect,
}: SortableMetricHeaderProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: code });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleClick = () => {
    // BDPI는 클릭 불가
    if (code === "bdpi") return;
    onSelect?.(code);
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`px-2 py-3 text-center text-sm font-medium text-gray-700 whitespace-nowrap border-r border-gray-200 w-[74px] min-w-[74px] max-w-[74px] h-[113px] select-none ${
        isDragging ? "bg-blue-100" : isSelected ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-1 h-full">
        {/* 드래그 핸들 - 고정 높이 */}
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded w-full h-[20px] flex items-center justify-center"
          title="드래그하여 순서 변경"
        >
          <GripHorizontal className="w-4 h-4 text-gray-400" />
        </div>
        {/* displayName 영역 - 클릭 가능 */}
        <div
          onClick={handleClick}
          className={`flex flex-col items-center rounded p-1 ${
            code === "bdpi"
              ? "cursor-default"
              : "cursor-pointer hover:bg-gray-200"
          }`}
        >
          <span className="h-[32px] flex items-center justify-center text-center leading-tight">
            {code === "bdpi" ? (
              "BDPI"
            ) : displayName ? (
              <>
                {displayName[0]}
                <br />
                {displayName[1]}
              </>
            ) : (
              METRIC_CODE_NAMES[code]?.slice(0, 4) || code.slice(0, 4)
            )}
          </span>
        </div>
      </div>
    </th>
  );
};

// 스크롤 영역 행 컴포넌트
const ScrollableRow = ({
  item,
  metricOrder,
  hideValue = false,
  aggregationType = "average",
}: {
  item: FlatTreeItem;
  metricOrder: string[];
  hideValue?: boolean;
  aggregationType?: AggregationType;
}) => {
  const metrics = item.data.metrics as unknown as Record<string, MetricData>;
  const bdpiMetrics = item.data.metrics as BdpiMetrics;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 h-[64px]">
      {metricOrder.map((code) => {
        // BDPI 칼럼 특별 처리 (총합 모드에서도 데이터 표시)
        if (code === "bdpi") {
          return (
            <td
              key={code}
              className="px-2 py-1 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[74px] min-w-[74px] max-w-[74px] h-[64px]"
            >
              {bdpiMetrics?.bdpi?.score !== undefined
                ? `${bdpiMetrics.bdpi.score.toFixed(0)}%`
                : "--"}
            </td>
          );
        }

        // 총합 모드에서 해당 지표가 표시 대상이 아닌 경우 회색 처리
        const isDisabledInTotalMode =
          aggregationType === "total" &&
          !TOTAL_MODE_METRIC_CODES.includes(code);

        if (isDisabledInTotalMode) {
          return (
            <td
              key={code}
              className="px-2 py-1 text-center align-middle border-r border-gray-200 w-[74px] min-w-[74px] max-w-[74px] h-[64px] bg-gray-50"
            />
          );
        }

        const metric = metrics?.[code];
        const hasData =
          metric && typeof metric.value === "number" && metric.isUsed !== false;
        const score = hasData ? metric?.score ?? null : null;
        const value = hasData ? metric?.value ?? null : null;
        const targetValue = metric?.targetValue ?? null;
        const unit = metric?.unit;

        return (
          <td
            key={code}
            className="px-2 py-1 text-center align-middle border-r border-gray-200 w-[74px] min-w-[74px] max-w-[74px] h-[64px]"
          >
            <HeatmapCell
              metricCode={code}
              score={score}
              value={value}
              hideValue={hideValue}
              targetValue={targetValue}
              unit={unit}
            />
          </td>
        );
      })}
    </tr>
  );
};

export const OrganizationTable = ({
  month,
  activeTab,
  hideValues = false,
  aggregationType = "average",
}: OrganizationTableProps) => {
  // 전체 탭일 경우 API 옵션 설정
  const apiOptions =
    activeTab === "all"
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
  const expandedOrganizations = useOrganizationStore(
    (state) => state.expandedOrganizations,
  );
  const toggleOrganization = useOrganizationStore(
    (state) => state.toggleOrganization,
  );
  const showMembers = useOrganizationStore(
    (state) => state.showMembers,
  );

  // 지표 순서 조회 및 변경 hooks
  const { data: metricOrderData } = useMetricOrder();
  const updateMetricOrderMutation = useUpdateMetricOrder();

  // 지표 순서 상태 (드래그로 변경 가능)
  const [metricOrder, setMetricOrder] = useState<string[]>(ALL_METRIC_CODES);

  // API에서 조회한 순서로 상태 업데이트 (우선순위: 저장된 순서 > API 응답 순서 > 기본 순서)
  useEffect(() => {
    if (metricOrderData?.order && metricOrderData.order.length > 0) {
      // 저장된 지표 순서가 있으면 사용
      setMetricOrder(metricOrderData.order);
    } else if (data?.tree && data.tree.length > 0 && data.tree[0].metrics) {
      // API 응답의 metrics 객체 키 순서 사용
      const apiMetricOrder = Object.keys(data.tree[0].metrics);
      // BDPI가 없으면 마지막에 추가
      if (!apiMetricOrder.includes("bdpi")) {
        apiMetricOrder.push("bdpi");
      }
      setMetricOrder(apiMetricOrder);
    }
  }, [metricOrderData, data]);

  // 선택된 지표 코드 (상세 정보 표시용)
  const [selectedMetricCode, setSelectedMetricCode] = useState<string | null>(
    null,
  );

  // 지표 선택 핸들러
  const handleMetricSelect = useCallback((code: string) => {
    setSelectedMetricCode((prev) => (prev === code ? null : code));
  }, []);

  // 지표 상세 정보 닫기 핸들러
  const handleMetricDetailClose = useCallback(() => {
    setSelectedMetricCode(null);
  }, []);

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동 후 드래그 시작
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = metricOrder.indexOf(active.id as string);
      const newIndex = metricOrder.indexOf(over.id as string);

      // 낙관적 업데이트: 로컬 상태 먼저 변경
      setMetricOrder((items) => arrayMove(items, oldIndex, newIndex));

      // API 호출하여 순서 저장 (응답값으로 캐시 자동 업데이트)
      updateMetricOrderMutation.mutate(
        { fromIndex: oldIndex, toIndex: newIndex },
        {
          onError: (error) => {
            console.error("지표 순서 저장 실패:", error);
          },
        },
      );
    }
  }, [metricOrder, updateMetricOrderMutation]);

  // API 응답에서 thresholds 추출
  const thresholds = data?.thresholds;

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
    "px-2 py-3 text-center text-sm font-medium text-gray-700 whitespace-nowrap";

  return (
    <>
      {/* 지표 상세 정보 영역 */}
      {selectedMetricCode && (
        <MetricDetailInfo
          metricCode={selectedMetricCode}
          onClose={handleMetricDetailClose}
        />
      )}

      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
        {/* 고정 영역 (좌측 5개 컬럼) */}
        <div
          className="flex-shrink-0 bg-white z-10"
          style={{ boxShadow: "4px 0 8px -2px rgba(0, 0, 0, 0.1)" }}
        >
          <table className="border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 h-[113px]">
                <th
                  className={`${thBaseStyle} text-left border-r border-gray-200 w-[350px] h-[113px]`}
                >
                  조직 이름
                </th>
                {SUMMARY_CATEGORIES.map((cat) => {
                  // API 응답의 thresholds 값 사용 (fallback: excellent=80, danger=60)
                  const excellentThreshold = thresholds?.excellent ?? 80;
                  const dangerThreshold = thresholds?.danger ?? 60;

                  // 공통 기준 툴팁 텍스트
                  const criteriaTooltip = `초과달성: 100% 초과\n우수: ${excellentThreshold}% 이상 ~ 100% 이하\n경고: ${dangerThreshold}% 이상 ~ ${excellentThreshold}% 미만\n위험: ${dangerThreshold}% 미만`;

                  return (
                    <th
                      key={cat.id}
                      className="px-2 py-2 text-center text-sm font-medium text-gray-700 whitespace-nowrap border-r border-gray-200 w-[72px] h-[113px]"
                      style={{ backgroundColor: SUMMARY_BG_COLORS[cat.id] }}
                    >
                      <div className="flex flex-col items-center justify-center h-full gap-1">
                        <Tooltip content={criteriaTooltip} maxWidth={250}>
                          <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                        </Tooltip>
                        <span>
                          {cat.id === "overAchieved"
                            ? "초과달성"
                            : cat.id === "excellent"
                            ? "우수"
                            : cat.id === "warning"
                            ? "경고"
                            : "위험"}
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="border-collapse table-fixed">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 h-[113px]">
                  <SortableContext
                    items={metricOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {metricOrder.map((code) => {
                      const displayName = METRIC_CODE_DISPLAY_NAMES[code];

                      return (
                        <SortableMetricHeader
                          key={code}
                          code={code}
                          displayName={displayName}
                          isSelected={selectedMetricCode === code}
                          onSelect={handleMetricSelect}
                        />
                      );
                    })}
                  </SortableContext>
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
                    metricOrder={metricOrder}
                    hideValue={hideValues}
                    aggregationType={aggregationType}
                  />
                ))}
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>
    </>
  );
};
