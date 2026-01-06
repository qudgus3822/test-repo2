/**
 * OrganizationFlatTable 컴포넌트
 * - 플랫뷰 테이블 (실/팀/개인 필터)
 * - 고정 영역 (좌측 5개 컬럼) + 스크롤 영역 (30개 지표 + BDPI)
 * - 히트맵 시각화 (ProgressSquare 사용)
 * - 지표별 정렬 기능 포함
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowUp, ArrowDown, ArrowDownUp, GripHorizontal } from "lucide-react";
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
import { MetricDetailInfo } from "./MetricDetailInfo";
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

interface OrganizationFlatTableProps {
  month: string;
  activeTab: TabType;
  filterType?: FlatViewFilterType;
  hideValues?: boolean;
  onDetailClick?: (item: OrganizationDepartment | OrganizationMember) => void;
  searchKeyword?: string;
  onSearchResult?: (resultCount: number) => void;
  aggregationType?: AggregationType;
}

// 플랫 데이터 아이템 타입
interface FlatItem {
  type: "department" | "member";
  data: OrganizationDepartment | OrganizationMember;
  level: number;
  parentName?: string;
  roomName?: string; // 실 이름 (level 2)
  teamName?: string; // 팀 이름 (level 3)
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

// 트리를 플랫 배열로 변환하는 함수
const flattenTree = (
  nodes: OrganizationNode[],
  filterType: FlatViewFilterType = "room",
): FlatItem[] => {
  const result: FlatItem[] = [];

  const traverse = (
    node: OrganizationNode,
    parentName?: string,
    roomName?: string,
    teamName?: string,
  ) => {
    if (!node.isEvaluationTarget) return;

    if (node.type === "department") {
      const dept = node as OrganizationDepartment;

      // 현재 노드의 레벨에 따라 roomName, teamName 업데이트
      const currentRoomName = dept.level === 2 ? dept.name : roomName;
      const currentTeamName = dept.level === 3 ? dept.name : teamName;

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
          roomName: currentRoomName,
        });
      }

      if (dept.children) {
        dept.children.forEach((child) =>
          traverse(child, dept.name, currentRoomName, currentTeamName),
        );
      }
    } else if (node.type === "member") {
      if (filterType === "member") {
        result.push({
          type: "member",
          data: node,
          level: node.level,
          parentName,
          roomName,
          teamName,
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
  filterType,
}: {
  item: FlatItem;
  summaryCounts: SummaryCounts;
  filterType: FlatViewFilterType;
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

  // 상위 조직 표시 텍스트 생성
  const getParentInfo = () => {
    if (filterType === "team" && item.roomName) {
      return item.roomName;
    }
    if (filterType === "member" && (item.roomName || item.teamName)) {
      const parts = [];
      if (item.roomName) parts.push(item.roomName);
      if (item.teamName) parts.push(item.teamName);
      return parts.join(" > ");
    }
    return null;
  };

  const parentInfo = getParentInfo();

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 h-[64px]">
      <td className="px-5 py-4 align-middle whitespace-nowrap border-r border-gray-200 w-[350px] h-[64px]">
        {isDepartment ? (
          <div className="flex flex-col justify-center h-full gap-0.5">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{displayName}</span>
              {memberCount !== null && (
                <span className="ml-1 text-sm text-gray-500">
                  ({memberCount})
                </span>
              )}
              <StatusBadge change={data.changes} />
            </div>
            {/* 팀 필터: 실 이름을 팀 이름 하단에 표시 */}
            {parentInfo && (
              <div className="text-sm text-gray-500">{parentInfo}</div>
            )}
          </div>
        ) : (
          <div className="flex flex-col justify-center h-full gap-0.5">
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
            {/* 개인 필터: 실 > 팀을 개인 이름 하단에 표시 */}
            {parentInfo && (
              <div className="text-sm text-gray-500">{parentInfo}</div>
            )}
            <div className="text-sm text-gray-500">
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

// 드래그 가능한 지표 헤더 컴포넌트
interface SortableMetricHeaderProps {
  code: string;
  displayName: string[] | undefined;
  isActive: boolean;
  sortDirection: "asc" | "desc" | null;
  onSort: (code: string) => void;
  thBaseStyle: string;
  isSelected?: boolean;
  onSelect?: (code: string) => void;
}

const SortableMetricHeader = ({
  code,
  displayName,
  isActive,
  sortDirection,
  onSort,
  thBaseStyle,
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

  // 정렬 아이콘 렌더링
  const renderSortIcon = () => {
    if (!isActive) {
      return <ArrowDownUp className="w-4 h-4 text-gray-400" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="w-4 h-4 text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const handleSortClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      e.stopPropagation();
      onSort(code);
    }
  };

  const handleSelectClick = () => {
    // BDPI는 클릭 불가
    if (code === "bdpi") return;
    onSelect?.(code);
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`${thBaseStyle} border-r border-gray-200 w-[90px] min-w-[90px] max-w-[90px] h-[121px] select-none ${
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
          onClick={handleSelectClick}
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
        {/* 정렬 클릭 영역 */}
        <div
          onClick={handleSortClick}
          className="cursor-pointer flex items-center justify-center hover:bg-gray-200 rounded px-1"
        >
          <span className="h-[20px] flex items-center justify-center">
            {renderSortIcon()}
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
  item: FlatItem;
  metricOrder: string[];
  hideValue?: boolean;
  aggregationType?: AggregationType;
}) => {
  const data = item.data;
  const metrics = data.metrics as unknown as Record<string, MetricData>;
  const bdpiMetrics = data.metrics as BdpiMetrics;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 h-[64px]">
      {metricOrder.map((code) => {
        // BDPI 칼럼 특별 처리 (총합 모드에서도 데이터 표시)
        if (code === "bdpi") {
          return (
            <td
              key={code}
              className="px-5 py-4 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[90px] min-w-[90px] max-w-[90px] h-[64px]"
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
              className="px-2 py-1 text-center align-middle border-r border-gray-200 w-[90px] min-w-[90px] max-w-[90px] h-[64px] bg-gray-100"
            />
          );
        }

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
    </tr>
  );
};

export const OrganizationFlatTable = ({
  month,
  activeTab,
  filterType = "room",
  hideValues = false,
  searchKeyword = "",
  onSearchResult,
  aggregationType = "average",
}: OrganizationFlatTableProps) => {
  const { data, isLoading, isError } = useOrganizationTree(month, activeTab);
  const flatItems = flattenTree(data?.tree ?? [], filterType);

  // 검색 필터링
  const filteredItems = useMemo(() => {
    if (!searchKeyword.trim()) {
      return flatItems;
    }

    const keyword = searchKeyword.toLowerCase().trim();
    return flatItems.filter((item) => {
      const name =
        item.type === "department"
          ? (item.data as OrganizationDepartment).name
          : (item.data as OrganizationMember).name;
      return name.toLowerCase().includes(keyword);
    });
  }, [flatItems, searchKeyword]);

  // 검색 결과 콜백
  useEffect(() => {
    if (onSearchResult && searchKeyword.trim()) {
      onSearchResult(filteredItems.length);
    }
  }, [filteredItems.length, searchKeyword, onSearchResult]);

  // 지표 순서 상태 (드래그로 변경 가능)
  const [metricOrder, setMetricOrder] = useState<string[]>(ALL_METRIC_CODES);

  // 정렬 상태
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: null,
  });

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
      setMetricOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

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
    filteredItems.forEach((item) => {
      const counts = calculateSummaryCounts(
        item.data.metrics as unknown as Record<string, MetricData>,
      );
      map.set(item, counts);
    });
    return map;
  }, [filteredItems]);

  // Summary 카테고리 ID 목록
  const summaryCategoryIds = SUMMARY_CATEGORIES.map((cat) => cat.id);

  // 정렬된 아이템
  const sortedItems = useMemo(() => {
    // 정렬이 비활성화된 경우 원본 순서 유지
    if (!sortConfig.column || !sortConfig.direction) {
      return filteredItems;
    }

    return [...filteredItems].sort((a, b) => {
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
  }, [filteredItems, sortConfig, itemSummaryCountsMap, summaryCategoryIds]);

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

  // 검색 결과가 없을 때
  if (filteredItems.length === 0 && searchKeyword.trim()) {
    return (
      <div className="flex items-center justify-center min-h-[510px]">
        <p className="text-gray-500">'{searchKeyword}' 검색 결과가 없습니다.</p>
      </div>
    );
  }

  const thBaseStyle =
    "px-5 py-4 text-center text-sm font-medium text-gray-700 whitespace-nowrap";

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
              <tr className="border-b border-gray-200 bg-gray-50 h-[121px]">
                <th
                  className={`${thBaseStyle} text-left border-r border-gray-200 w-[350px] h-[121px]`}
                >
                  조직 이름
                </th>
                {SUMMARY_CATEGORIES.map((cat) => {
                  const isActive =
                    sortConfig.column === cat.id &&
                    sortConfig.direction !== null;

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
                      className={`px-4 py-2 text-center text-sm font-medium text-gray-700 whitespace-nowrap border-r border-gray-200 w-[60px] h-[121px] cursor-pointer hover:brightness-95 select-none ${
                        isActive ? "ring-2 ring-inset ring-blue-400" : ""
                      }`}
                      style={{ backgroundColor: SUMMARY_BG_COLORS[cat.id] }}
                      onClick={() => toggleSort(cat.id)}
                    >
                      <div className="flex flex-col items-center justify-center h-full gap-1">
                        <span>
                          {cat.id === "exceeds"
                            ? "초과달성"
                            : cat.id === "achieved"
                            ? "우수"
                            : cat.id === "good"
                            ? "경고"
                            : "위험"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {criteriaText}
                        </span>
                        <span>{renderSortIcon()}</span>
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
                    filterType={filterType}
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
                <tr className="border-b border-gray-200 bg-gray-50 h-[121px]">
                  <SortableContext
                    items={metricOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {metricOrder.map((code) => {
                      const displayName = METRIC_CODE_DISPLAY_NAMES[code];
                      const isActive =
                        sortConfig.column === code &&
                        sortConfig.direction !== null;

                      return (
                        <SortableMetricHeader
                          key={code}
                          code={code}
                          displayName={displayName}
                          isActive={isActive}
                          sortDirection={sortConfig.direction}
                          onSort={toggleSort}
                          thBaseStyle={thBaseStyle}
                          isSelected={selectedMetricCode === code}
                          onSelect={handleMetricSelect}
                        />
                      );
                    })}
                  </SortableContext>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item, index) => (
                  <ScrollableRow
                    key={
                      item.type === "department"
                        ? (item.data as OrganizationDepartment).code
                        : `${
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
