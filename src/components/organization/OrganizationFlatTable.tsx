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
  ChevronRight,
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
  ChangeInfo,
  AggregationType,
} from "@/types/organization.types";
import {
  hasChangeInfo,
  formatChangeDate,
  getChangeDetailWithSuffix,
  getMemberRoleOrPositionLabel,
} from "@/utils/organization";
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


interface OrganizationFlatTableProps {
  month: string;
  activeTab: TabType;
  filterType?: FlatViewFilterType;
  hideValues?: boolean;
  onDetailClick?: (item: OrganizationDepartment | OrganizationMember) => void;
  searchKeyword?: string;
  onSearchResult?: (resultCount: number) => void;
  aggregationType?: AggregationType;
  // [변경: 2026-01-20 15:30, 김병현 수정] 지표 상세 정보 표시 상태 콜백 추가
  onMetricDetailChange?: (isOpen: boolean) => void;
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

// [변경: 2026-01-20 10:30, 김병현 수정] 모든 필터에서 동일한 행 높이 사용
const getRowHeight = () => {
  return "h-[64px]";
};

// [변경: 2026-01-19 03:00, 김병현 수정] 통합 행 컴포넌트 - 고정 영역 + 스크롤 영역을 하나의 행으로 합침
const CombinedRow = ({
  item,
  summaryCounts,
  filterType,
  onMemberClick,
  metricOrder,
  hideValue = false,
  aggregationType = "avg",
}: {
  item: FlatItem;
  summaryCounts: SummaryCounts;
  filterType: FlatViewFilterType;
  onMemberClick?: (member: OrganizationMember, event: React.MouseEvent) => void;
  metricOrder: string[];
  hideValue?: boolean;
  aggregationType?: AggregationType;
}) => {
  const data = item.data;
  const isDepartment = item.type === "department";
  const rowHeight = getRowHeight();
  const metrics = data.metrics as unknown as Record<string, MetricData>;

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
    const dataWithApiFields = data as {
      divisionName?: string;
      teamName?: string;
    };
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
    <tr className={`border-b border-gray-200 hover:bg-gray-50/50 ${rowHeight}`}>
      {/* 고정 영역 - 조직/멤버 이름 */}
      <td
        className={`align-middle whitespace-nowrap border-r border-b border-gray-200 w-[350px] min-w-[350px] ${rowHeight} bg-white sticky left-0 z-10`}
        style={{ boxShadow: "2px 0 4px -2px rgba(0, 0, 0, 0.1)" }}
      >
        {isDepartment ? (
          <div className="flex flex-col justify-center h-full gap-0.5 px-2">
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
          // [변경: 2026-01-20 10:35, 김병현 수정] 클릭 가능 표시를 hover 배경색 + 아이콘으로 변경
          <div
            className="group flex items-center justify-between h-full cursor-pointer hover:bg-blue-100 rounded-md px-4 -mx-1 select-none transition-colors"
            onClick={(e) => onMemberClick?.(member!, e)}
          >
            <div className="flex flex-col justify-center gap-0.5">
              <div className="flex items-center">
                <span className="font-medium text-gray-900 transition-colors">
                  {displayName}
                </span>
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
            <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </td>
      {/* 고정 영역 - Summary 카테고리 */}
      {SUMMARY_CATEGORIES.map((cat, catIndex) => (
        <td
          key={cat.id}
          className={`px-2 py-4 text-center text-sm font-semibold align-middle border-r border-b border-gray-200 w-[72px] min-w-[72px] ${rowHeight} bg-white sticky z-10`}
          style={{
            left: `${350 + catIndex * 72}px`,
            boxShadow:
              catIndex === SUMMARY_CATEGORIES.length - 1
                ? "4px 0 8px -2px rgba(0, 0, 0, 0.1)"
                : undefined,
          }}
        >
          {summaryCounts[cat.id]}
        </td>
      ))}
      {/* 스크롤 영역 - 지표 칼럼들 */}
      {metricOrder.map((code) => {
        // BDPI 칼럼 특별 처리
        if (code === "bdpi" || code === "BDPI") {
          const bdpiData = metrics?.["BDPI"] ?? metrics?.["bdpi"];
          const bdpiValue = bdpiData?.avgRate ?? bdpiData?.score;
          return (
            <td
              key={code}
              className={`px-2 py-1 text-center text-sm font-semibold align-middle border-r border-b border-gray-200 w-[74px] min-w-[74px] max-w-[74px] ${rowHeight}`}
            >
              {bdpiValue !== undefined && bdpiValue !== null
                ? `${bdpiValue.toFixed(0)}%`
                : "--"}
            </td>
          );
        }

        const metric = metrics?.[code];

        // isUsed가 false인 경우(수집불가 지표) 회색 처리
        if (metric?.isUsed === false) {
          return (
            <td
              key={code}
              className={`px-2 py-1 text-center align-middle border-r border-b border-gray-200 w-[74px] min-w-[74px] max-w-[74px] ${rowHeight} bg-gray-50`}
            />
          );
        }

        const hasData = metric && typeof metric.value === "number";
        const score = hasData ? (metric?.score ?? null) : null;
        const value = hasData
          ? aggregationType === "total"
            ? (metric?.totalValue ?? null)
            : (metric?.value ?? null)
          : null;
        const targetValue = metric?.targetValue ?? null;
        const unit = metric?.unit;
        const metricName = metric?.metricName;
        const description = metric?.tooltip;
        // [변경: 2026-01-22 10:00, 김병현 수정] 달성률 추가
        const avgRate = hasData ? (metric?.avgRate ?? null) : null;

        return (
          <td
            key={code}
            className={`px-2 py-1 text-center align-middle border-r border-b border-gray-200 w-[74px] min-w-[74px] max-w-[74px] ${rowHeight}`}
          >
            <HeatmapCell
              metricCode={code}
              metricName={metricName}
              score={score}
              value={value}
              hideValue={hideValue}
              targetValue={targetValue}
              unit={unit}
              description={description}
              avgRate={avgRate}
            />
          </td>
        );
      })}
    </tr>
  );
};

// 드래그 가능한 지표 헤더 컴포넌트
interface SortableMetricHeaderProps {
  code: string;
  displayName: string | undefined; // API 응답값 (줄바꿈 포함 문자열)
  metricName: string | undefined; // fallback용 지표명
  isActive: boolean;
  sortDirection: "asc" | "desc" | null;
  onSort: (code: string) => void;
  isSelected?: boolean;
  onSelect?: (code: string) => void;
}

const SortableMetricHeader = ({
  code,
  displayName,
  metricName,
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
    if (code === "bdpi" || code === "BDPI") return;
    onSelect?.(code);
  };

  // displayName을 줄바꿈으로 분리하여 배열로 변환
  const displayNameLines = displayName?.split("\n");

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`px-2 py-3 text-center text-sm font-medium text-gray-700 whitespace-nowrap border-r border-b border-gray-200 w-[74px] min-w-[74px] max-w-[74px] h-[113px] select-none ${
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
            code === "bdpi" || code === "BDPI"
              ? "cursor-default"
              : "cursor-pointer hover:bg-gray-200"
          }`}
        >
          <span className="h-[32px] flex items-center justify-center text-center leading-tight">
            {code === "bdpi" ? (
              "BDPI"
            ) : displayNameLines ? (
              <>
                {displayNameLines[0]}
                <br />
                {displayNameLines[1]}
              </>
            ) : (
              metricName?.slice(0, 4) || code.slice(0, 4)
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


export const OrganizationFlatTable = ({
  month,
  activeTab,
  filterType = "division",
  hideValues = false,
  searchKeyword = "",
  onSearchResult,
  aggregationType = "avg",
  onMetricDetailChange,
}: OrganizationFlatTableProps) => {
  // 전체 탭일 경우 API 옵션 설정 (검색 키워드 포함)
  const apiOptions =
    activeTab === "all"
      ? {
          aggregation: aggregationType,
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

  // API 응답에서 지표 순서 추출
  const getMetricOrderFromApi = useCallback(() => {
    // format=list 응답
    if (data?.items && data.items.length > 0 && data.items[0].metrics) {
      const apiMetricOrder = Object.keys(data.items[0].metrics);
      if (
        !apiMetricOrder.includes("BDPI") &&
        !apiMetricOrder.includes("bdpi")
      ) {
        apiMetricOrder.push("BDPI");
      }
      return apiMetricOrder;
    }
    // format=tree 응답
    if (data?.tree && data.tree.length > 0 && data.tree[0].metrics) {
      const apiMetricOrder = Object.keys(data.tree[0].metrics);
      if (
        !apiMetricOrder.includes("BDPI") &&
        !apiMetricOrder.includes("bdpi")
      ) {
        apiMetricOrder.push("BDPI");
      }
      return apiMetricOrder;
    }
    return [];
  }, [data]);

  // 실제 사용할 지표 순서 (전역 스토어 > API 응답 순서)
  const metricOrder = globalMetricOrder ?? getMetricOrderFromApi();

  // API 응답에서 thresholds 추출
  const thresholds = data?.thresholds;

  // API 응답에서 지표 정보(metricName, metricDisplayName) 추출
  const metricInfoMap = useMemo(() => {
    const map: Record<
      string,
      { metricName?: string; metricDisplayName?: string }
    > = {};
    // format=list 응답
    if (data?.items && data.items.length > 0) {
      const firstMetrics = data.items[0].metrics as unknown as Record<
        string,
        MetricData
      >;
      if (firstMetrics) {
        Object.entries(firstMetrics).forEach(([code, metric]) => {
          map[code] = {
            metricName: metric?.metricName,
            metricDisplayName: metric?.metricDisplayName,
          };
        });
      }
    }
    // format=tree 응답
    else if (data?.tree && data.tree.length > 0) {
      const firstMetrics = data.tree[0].metrics as unknown as Record<
        string,
        MetricData
      >;
      if (firstMetrics) {
        Object.entries(firstMetrics).forEach(([code, metric]) => {
          map[code] = {
            metricName: metric?.metricName,
            metricDisplayName: metric?.metricDisplayName,
          };
        });
      }
    }
    return map;
  }, [data?.items, data?.tree]);

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

  // API에서 조회한 순서로 전역 스토어 업데이트 (최초 1회)
  useEffect(() => {
    if (isLoading || isFetching) return;
    if (globalMetricOrder !== null) return;

    const apiOrder = getMetricOrderFromApi();
    if (apiOrder.length > 0) {
      setGlobalMetricOrder(apiOrder);
    }
  }, [
    data,
    globalMetricOrder,
    setGlobalMetricOrder,
    isLoading,
    isFetching,
    getMetricOrderFromApi,
  ]);

  // 정렬 상태
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: null,
  });

  // 선택된 지표 코드 (상세 정보 표시용)
  const [selectedMetricCode, setSelectedMetricCode] = useState<string | null>(
    null,
  );

  // [변경: 2026-01-20 15:30, 김병현 수정] 지표 상세 정보 표시 상태 변경 시 부모에게 알림
  useEffect(() => {
    onMetricDetailChange?.(selectedMetricCode !== null);
  }, [selectedMetricCode, onMetricDetailChange]);

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
    [
      metricOrder,
      updateMetricOrderMutation,
      setGlobalMetricOrder,
      setIsMetricColumnDragged,
    ],
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

  // [변경: 2026-01-20 14:00, 김병현 수정] MetricDetailInfo 표시 시 테이블 높이 조정을 위한 flex 컨테이너 추가
  return (
    <div className="flex flex-col h-full max-h-full">
      {/* 지표 상세 정보 영역 */}
      {selectedMetricCode && (
        <MetricDetailInfo
          metricCode={selectedMetricCode}
          onClose={handleMetricDetailClose}
        />
      )}

      {/* [변경: 2026-01-19 03:00, 김병현 수정] 하나의 통합 테이블로 변경 - 고정 영역은 sticky로 처리 */}
      {/* [변경: 2026-01-19 03:30, 김병현 수정] 스크롤바를 스크롤 영역에만 표시 (고정 영역 너비: 350 + 72*4 = 638px) */}
      {/* [변경: 2026-01-20 10:50, 김병현 수정] 스크롤바 슬림하게 변경 */}
      <style>{`
        .org-flat-table-container::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .org-flat-table-container::-webkit-scrollbar-track {
          background: transparent;
          margin-left: 638px;
        }
        .org-flat-table-container::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .org-flat-table-container::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .org-flat-table-container::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
      <div className="org-flat-table-container border border-gray-200 rounded-lg overflow-auto flex-1 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="border-separate border-spacing-0 table-fixed">
            <thead className="sticky top-0 z-20">
              <tr className="border-b border-gray-200 bg-gray-50 h-[113px]">
                {/* 고정 영역 헤더 - 조직 이름 */}
                <th
                  className={`${thBaseStyle} text-left border-r border-b border-gray-200 w-[350px] min-w-[350px] h-[113px] bg-gray-50 sticky left-0 z-30`}
                >
                  조직 이름
                </th>
                {/* 고정 영역 헤더 - Summary 카테고리 */}
                {SUMMARY_CATEGORIES.map((cat, catIndex) => {
                  const isActive =
                    sortConfig.column === cat.id &&
                    sortConfig.direction !== null;

                  const excellentThreshold = thresholds?.excellent ?? 80;
                  const dangerThreshold = thresholds?.danger ?? 60;
                  const criteriaTooltip = `초과달성: 100% 초과\n우수: ${excellentThreshold}% 이상 ~ 100% 이하\n경고: ${dangerThreshold}% 이상 ~ ${excellentThreshold}% 미만\n위험: ${dangerThreshold}% 미만`;

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
                      className={`px-2 py-2 text-center text-sm font-medium text-gray-700 whitespace-nowrap border-r border-gray-200 w-[72px] min-w-[72px] h-[113px] cursor-pointer hover:brightness-95 select-none sticky z-30 ${
                        isActive ? "ring-2 ring-inset ring-blue-400" : ""
                      }`}
                      style={{
                        backgroundColor: SUMMARY_BG_COLORS[cat.id],
                        left: `${350 + catIndex * 72}px`,
                        boxShadow:
                          catIndex === SUMMARY_CATEGORIES.length - 1
                            ? "4px 0 8px -2px rgba(0, 0, 0, 0.1)"
                            : undefined,
                      }}
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
                {/* 스크롤 영역 헤더 - 지표 칼럼들 */}
                <SortableContext
                  items={metricOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {metricOrder.map((code) => {
                    const metricInfo = metricInfoMap[code];
                    const isActive =
                      sortConfig.column === code &&
                      sortConfig.direction !== null;

                    return (
                      <SortableMetricHeader
                        key={code}
                        code={code}
                        displayName={metricInfo?.metricDisplayName}
                        metricName={metricInfo?.metricName}
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
              {sortedItems.map((item, index) => {
                const summaryCounts =
                  itemSummaryCountsMap.get(item) ??
                  calculateSummaryCounts(undefined);
                return (
                  <CombinedRow
                    key={
                      item.type === "department"
                        ? `row-${(item.data as OrganizationDepartment).code}`
                        : `row-${(item.data as OrganizationMember).employeeID}-${index}`
                    }
                    item={item}
                    summaryCounts={summaryCounts}
                    filterType={filterType}
                    onMemberClick={handleMemberClick}
                    metricOrder={metricOrder}
                    hideValue={hideValues}
                    aggregationType={aggregationType}
                  />
                );
              })}
            </tbody>
          </table>
        </DndContext>
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
    </div>
  );
};
