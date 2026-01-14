/**
 * OrganizationFlatTable 컴포넌트
 * - 플랫뷰 테이블 (실/팀/개인 필터)
 * - 고정 영역 (좌측 5개 컬럼) + 스크롤 영역 (30개 지표 + BDPI)
 * - 히트맵 시각화 (ProgressSquare 사용)
 * - 지표별 정렬 기능 포함
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowDownUp,
  GripHorizontal,
  Info,
} from "lucide-react";
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
} from "@/utils/organization";
import {
  METRIC_CODE_NAMES,
  METRIC_CODE_DISPLAY_NAMES,
  METRIC_CODE_ORDER,
} from "@/utils/metrics";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  useOrganizationTree,
  useUpdateMetricOrder,
} from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { HeatmapCell } from "./heatmap/HeatmapCell";
import { MetricDetailInfo } from "./MetricDetailInfo";
import { MemberMetricRankingModal } from "./MemberMetricRankingModal";
import {
  calculateSummaryCounts,
  SUMMARY_CATEGORIES,
  SUMMARY_BG_COLORS,
  type MetricData,
  type SummaryCounts,
  type SortConfig,
} from "./heatmap/types";

// 플랫뷰 필터 타입 (API 파라미터와 동일)
export type FlatViewFilterType = "division" | "team" | "member";

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
  filterType: FlatViewFilterType = "division",
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

      if (filterType === "division" && dept.level === 2) {
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

// filterType에 따른 행 높이
const getRowHeight = (filterType: FlatViewFilterType) => {
  switch (filterType) {
    case "team":
    case "member":
      return "h-[79px]";
    default:
      return "h-[64px]";
  }
};

// 고정 영역 행 컴포넌트
const FixedRow = ({
  item,
  summaryCounts,
  filterType,
  onMemberClick,
}: {
  item: FlatItem;
  summaryCounts: SummaryCounts;
  filterType: FlatViewFilterType;
  onMemberClick?: (member: OrganizationMember, event: React.MouseEvent) => void;
}) => {
  const data = item.data;
  const isDepartment = item.type === "department";
  const rowHeight = getRowHeight(filterType);

  const displayName = isDepartment
    ? (data as OrganizationDepartment).name
    : (data as OrganizationMember).name;

  const memberCount = isDepartment
    ? (data as OrganizationDepartment).memberCount
    : null;

  const member = !isDepartment ? (data as OrganizationMember) : null;

  // 상위 조직 표시 텍스트 생성
  // API 응답의 divisionName, teamName 우선 사용, 없으면 item.roomName, item.teamName 사용
  const getParentInfo = () => {
    // API 응답 필드 (format=list) - 타입 가드로 안전하게 접근
    const dataWithApiFields = data as { divisionName?: string; teamName?: string };
    const divisionName = dataWithApiFields.divisionName;
    const teamNameFromApi = dataWithApiFields.teamName;

    // 팀 필터: 실 이름 표시
    if (filterType === "team") {
      return divisionName || item.roomName || null;
    }
    // 개인 필터: 실 > 팀 표시
    if (filterType === "member") {
      const division = divisionName || item.roomName;
      const team = teamNameFromApi || item.teamName;
      const parts = [];
      if (division) parts.push(division);
      if (team) parts.push(team);
      return parts.length > 0 ? parts.join(" > ") : null;
    }
    return null;
  };

  const parentInfo = getParentInfo();

  return (
    <tr
      className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 ${rowHeight}`}
    >
      <td
        className={`px-2 py-4 align-middle whitespace-nowrap border-r border-gray-200 w-[350px] ${rowHeight}`}
      >
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
          <div
            className="flex flex-col justify-center h-full gap-0.5 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1"
            onClick={(e) => onMemberClick?.(member!, e)}
          >
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
          </div>
        )}
      </td>
      {SUMMARY_CATEGORIES.map((cat) => (
        <td
          key={cat.id}
          className={`px-2 py-4 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[72px] ${rowHeight}`}
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
  isSelected?: boolean;
  onSelect?: (code: string) => void;
}

const SortableMetricHeader = ({
  code,
  displayName,
  isActive,
  sortDirection,
  onSort,
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
  filterType = "division",
}: {
  item: FlatItem;
  metricOrder: string[];
  hideValue?: boolean;
  aggregationType?: AggregationType;
  filterType?: FlatViewFilterType;
}) => {
  const data = item.data;
  const metrics = data.metrics as unknown as Record<string, MetricData>;
  const bdpiMetrics = data.metrics as BdpiMetrics;
  const rowHeight = getRowHeight(filterType);

  return (
    <tr
      className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 ${rowHeight}`}
    >
      {metricOrder.map((code) => {
        // BDPI 칼럼 특별 처리 (총합 모드에서도 데이터 표시)
        if (code === "bdpi") {
          return (
            <td
              key={code}
              className={`px-2 py-1 text-center text-sm font-semibold align-middle border-r border-gray-200 w-[74px] min-w-[74px] max-w-[74px] ${rowHeight}`}
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
              className={`px-2 py-1 text-center align-middle border-r border-gray-200 w-[74px] min-w-[74px] max-w-[74px] ${rowHeight} bg-gray-50`}
            />
          );
        }

        const metric = metrics?.[code];
        const hasData =
          metric && typeof metric.value === "number" && metric.isUsed !== false;
        const score = hasData ? metric?.score ?? null : null;
        // 총합 모드일 경우 totalValue 사용, 없으면 value 사용
        const value = hasData
          ? aggregationType === "total"
            ? metric?.totalValue ?? metric?.value ?? null
            : metric?.value ?? null
          : null;
        const targetValue = metric?.targetValue ?? null;
        const unit = metric?.unit;

        return (
          <td
            key={code}
            className={`px-2 py-1 text-center align-middle border-r border-gray-200 w-[74px] min-w-[74px] max-w-[74px] ${rowHeight}`}
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

export const OrganizationFlatTable = ({
  month,
  activeTab,
  filterType = "division",
  hideValues = false,
  searchKeyword = "",
  onSearchResult,
  aggregationType = "average",
}: OrganizationFlatTableProps) => {
  // 전체 탭일 경우 API 옵션 설정 (검색 키워드 포함)
  const apiOptions =
    activeTab === "all"
      ? {
          aggregation:
            aggregationType === "average"
              ? ("avg" as const)
              : ("total" as const),
          format: "list" as const,
          type: filterType,
          search: searchKeyword.trim() || undefined,
        }
      : undefined;

  const { data, isLoading, isError, isFetching } = useOrganizationTree(
    month,
    activeTab,
    true,
    apiOptions,
  );

  // 지표 순서 변경 hook
  const updateMetricOrderMutation = useUpdateMetricOrder();

  // 전역 스토어에서 지표 순서 상태 가져오기 (뷰 전환 시에도 유지됨)
  const {
    metricOrder: globalMetricOrder,
    setMetricOrder: setGlobalMetricOrder,
    setIsMetricColumnDragged,
  } = useOrganizationStore();

  // 실제 사용할 지표 순서 (전역 스토어에 값이 있으면 사용, 없으면 기본값)
  const metricOrder = globalMetricOrder ?? ALL_METRIC_CODES;

  // API 응답에서 thresholds 추출
  const thresholds = data?.thresholds;

  // format=list일 경우 items 배열 사용, 아니면 tree를 flatten
  // 검색은 API에서 처리하므로 클라이언트 필터링 불필요
  const flatItems = useMemo(() => {
    // format=list 응답 (items 배열이 있는 경우)
    if (data?.items && data.items.length > 0) {
      return data.items
        .filter((node) => node.isEvaluationTarget)
        .map((node) => ({
          type: node.type,
          data: node as OrganizationDepartment | OrganizationMember,
          level: node.level,
        })) as FlatItem[];
    }
    // format=tree 응답 (기존 로직)
    return flattenTree(data?.tree ?? [], filterType);
  }, [data?.items, data?.tree, filterType]);

  // 검색 결과 콜백 (API 검색 결과 기반)
  useEffect(() => {
    if (onSearchResult && searchKeyword.trim()) {
      onSearchResult(flatItems.length);
    }
  }, [flatItems.length, searchKeyword, onSearchResult]);

  // API에서 조회한 순서로 상태 업데이트 (데이터가 fresh하고, 전역 스토어에 값이 없을 때만)
  useEffect(() => {
    // 데이터를 로딩 중이거나 가져오는 중이면 대기
    if (isLoading || isFetching) return;
    // 전역 스토어에 이미 순서가 있으면 (드래그앤드롭으로 설정된 경우) API 응답으로 덮어쓰지 않음
    if (globalMetricOrder !== null) return;

    // API 응답의 metrics 객체 키 순서 사용 (fresh 데이터)
    if (data?.items && data.items.length > 0 && data.items[0].metrics) {
      // format=list 응답
      const apiMetricOrder = Object.keys(data.items[0].metrics);
      // BDPI 키를 소문자로 변환 (기존 코드와 일관성 유지)
      const normalizedOrder = apiMetricOrder.map((key) =>
        key === "BDPI" ? "bdpi" : key,
      );
      setGlobalMetricOrder(normalizedOrder);
    } else if (data?.tree && data.tree.length > 0 && data.tree[0].metrics) {
      // format=tree 응답
      const apiMetricOrder = Object.keys(data.tree[0].metrics);
      // BDPI가 없으면 마지막에 추가
      if (!apiMetricOrder.includes("bdpi")) {
        apiMetricOrder.push("bdpi");
      }
      setGlobalMetricOrder(apiMetricOrder);
    }
  }, [data, globalMetricOrder, setGlobalMetricOrder, isLoading, isFetching]);

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

  // 멤버 지표 순위 모달 상태
  const [selectedMember, setSelectedMember] =
    useState<OrganizationMember | null>(null);
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // 멤버 클릭 핸들러 (개인 필터일 때만 동작)
  const handleMemberClick = useCallback(
    (member: OrganizationMember, event: React.MouseEvent) => {
      if (filterType !== "member") return;
      // 클릭된 div의 위치 정보 가져오기
      const rect = event.currentTarget.getBoundingClientRect();
      setModalPosition({ x: rect.left, y: rect.bottom });
      setSelectedMember(member);
    },
    [filterType],
  );

  // 멤버 모달 닫기 핸들러
  const handleMemberModalClose = useCallback(() => {
    setSelectedMember(null);
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
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = metricOrder.indexOf(active.id as string);
        const newIndex = metricOrder.indexOf(over.id as string);

        // 낙관적 업데이트: 전역 스토어 상태 먼저 변경 (뷰 전환 시에도 유지됨)
        const newOrder = arrayMove([...metricOrder], oldIndex, newIndex);
        setGlobalMetricOrder(newOrder);

        // API 호출하여 순서 저장 (저장 완료 후 플래그 설정)
        updateMetricOrderMutation.mutate(
          { fromIndex: oldIndex, toIndex: newIndex },
          {
            onSuccess: () => {
              // 저장 API 완료 후 드래그 플래그 설정 (필터 변경 시 API 재호출 트리거)
              setIsMetricColumnDragged(true);
            },
            onError: (error) => {
              console.error("지표 순서 저장 실패:", error);
            },
          },
        );
      }
    },
    [metricOrder, updateMetricOrderMutation, setGlobalMetricOrder, setIsMetricColumnDragged],
  );

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
    flatItems.forEach((item) => {
      const counts = calculateSummaryCounts(
        item.data.metrics as unknown as Record<string, MetricData>,
      );
      map.set(item, counts);
    });
    return map;
  }, [flatItems]);

  // Summary 카테고리 ID 목록
  const summaryCategoryIds = SUMMARY_CATEGORIES.map((cat) => cat.id);

  // 정렬된 아이템
  const sortedItems = useMemo(() => {
    // 정렬이 비활성화된 경우 원본 순서 유지
    if (!sortConfig.column || !sortConfig.direction) {
      return flatItems;
    }

    return [...flatItems].sort((a, b) => {
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
          overAchieved: 0,
          excellent: 0,
          warning: 0,
          danger: 0,
        };
        const bCounts = itemSummaryCountsMap.get(b) ?? {
          overAchieved: 0,
          excellent: 0,
          warning: 0,
          danger: 0,
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
  }, [flatItems, sortConfig, itemSummaryCountsMap, summaryCategoryIds]);

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
  if (flatItems.length === 0 && searchKeyword.trim()) {
    return (
      <div className="flex items-center justify-center min-h-[510px]">
        <p className="text-gray-500">'{searchKeyword}' 검색 결과가 없습니다.</p>
      </div>
    );
  }

  const thBaseStyle =
    "px-2 py-4 text-center text-sm font-medium text-gray-700 whitespace-nowrap";

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
                  const isActive =
                    sortConfig.column === cat.id &&
                    sortConfig.direction !== null;

                  // API 응답의 thresholds 값 사용 (fallback: excellent=80, danger=60)
                  const excellentThreshold = thresholds?.excellent ?? 80;
                  const dangerThreshold = thresholds?.danger ?? 60;

                  // 공통 기준 툴팁 텍스트
                  const criteriaTooltip = `초과달성: 100% 초과\n우수: ${excellentThreshold}% 이상 ~ 100% 이하\n경고: ${dangerThreshold}% 이상 ~ ${excellentThreshold}% 미만\n위험: ${dangerThreshold}% 미만`;

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
                      className={`px-2 py-2 text-center text-sm font-medium text-gray-700 whitespace-nowrap border-r border-gray-200 w-[72px] h-[113px] cursor-pointer hover:brightness-95 select-none ${
                        isActive ? "ring-2 ring-inset ring-blue-400" : ""
                      }`}
                      style={{ backgroundColor: SUMMARY_BG_COLORS[cat.id] }}
                      onClick={() => toggleSort(cat.id)}
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
                    onMemberClick={handleMemberClick}
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
                    filterType={filterType}
                  />
                ))}
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>

      {/* 멤버 지표 순위 모달 */}
      {selectedMember && filterType === "member" && (
        <MemberMetricRankingModal
          member={selectedMember}
          month={month}
          position={modalPosition}
          onClose={handleMemberModalClose}
        />
      )}
    </>
  );
};
