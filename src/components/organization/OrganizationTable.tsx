/**
 * OrganizationTable 컴포넌트
 * - 하이어라키뷰 테이블 (트리 구조)
 * - 고정 영역 (좌측 5개 컬럼) + 스크롤 영역 (30개 지표 + BDPI)
 * - 히트맵 시각화 (ProgressSquare 사용)
 * - 지표 칼럼 드래그 앤 드롭 정렬 기능
 */

import { useState, useCallback, useEffect, useMemo } from "react";
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
  AggregationType,
} from "@/types/organization.types";
import {
  getMemberRoleOrPositionLabel,
  getMemberEmail,
  getLevelBackgroundColor,
} from "@/utils/organization";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  useOrganizationTree,
  useUpdateMetricOrder,
} from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { HeatmapCell } from "./heatmap/HeatmapCell";
import { MetricDetailInfo } from "./MetricDetailInfo";
import { StatusBadge } from "./StatusBadge";
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

interface OrganizationTableProps {
  month: string;
  activeTab: TabType;
  hideValues?: boolean;
  onDetailClick?: (item: OrganizationDepartment | OrganizationMember) => void;
  aggregationType?: AggregationType;
  // [변경: 2026-01-20 15:30, 김병현 수정] 지표 상세 정보 표시 상태 콜백 추가
  onMetricDetailChange?: (isOpen: boolean) => void;
}

// 트리를 플랫 배열로 변환 (expand 상태 고려)
const flattenTreeWithExpand = (
  organizations: OrganizationDepartment[],
  expandedOrganizations: Set<string>,
  showMembers: boolean,
): FlatTreeItem[] => {
  const result: FlatTreeItem[] = [];

  const traverse = (node: OrganizationNode, depth: number) => {
    // if (!node.isEvaluationTarget) return;

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
              (child): child is OrganizationMember => child.type === "member",
              // child.type === "member" && child.isEvaluationTarget,
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
        const childDepts = dept.children.filter(
          (child): child is OrganizationDepartment =>
            child.type === "department",
          // child.type === "department" && child.isEvaluationTarget,
        );
        // sort order 는 현재 사용하지 않음
        // .sort((a, b) => a.sortOrder - b.sortOrder);

        childDepts.forEach((child) => traverse(child, depth + 1));
      }
    }
  };

  organizations.forEach((org) => traverse(org, 0));

  return result;
};

// [변경: 2026-01-19 03:00, 김병현 수정] 통합 행 컴포넌트 (부서) - 고정 영역 + 스크롤 영역을 하나의 행으로 합침
const CombinedDepartmentRow = ({
  item,
  summaryCounts,
  onToggle,
  metricOrder,
  hideValue = false,
  aggregationType = "avg",
}: {
  item: FlatTreeItem;
  summaryCounts: SummaryCounts;
  onToggle: (code: string) => void;
  metricOrder: string[];
  hideValue?: boolean;
  aggregationType?: AggregationType;
}) => {
  const dept = item.data as OrganizationDepartment;
  const paddingLeft = 16 + item.depth * 24;
  const metrics = item.data.metrics as unknown as Record<string, MetricData>;
  const bgColor = getLevelBackgroundColor(dept.level);
  const borderColor = dept.level === 3 ? "border-gray-100" : "border-gray-200";

  return (
    <tr
      className={`border-b ${borderColor} hover:bg-gray-50/50  h-[64px]`}
      style={{ backgroundColor: bgColor }}
    >
      <td
        className={`py-0 align-middle whitespace-nowrap border-r border-b ${borderColor} w-[350px] h-[64px] sticky left-0 z-10`}
        style={{
          paddingLeft: `${paddingLeft}px`,
          boxShadow: "2px 0 4px -2px rgba(0, 0, 0, 0.1)",
          backgroundColor: bgColor,
        }}
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
      {/* 고정 영역 - Summary 카테고리 */}
      {SUMMARY_CATEGORIES.map((cat, catIndex) => (
        <td
          key={cat.id}
          className={`px-2 py-4 text-center text-sm font-semibold align-middle border-r border-b w-[72px] ${borderColor} h-[64px] sticky z-10`}
          style={{
            left: `${350 + catIndex * 72}px`,
            boxShadow:
              catIndex === SUMMARY_CATEGORIES.length - 1
                ? "4px 0 8px -2px rgba(0, 0, 0, 0.1)"
                : undefined,
            backgroundColor: bgColor,
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
              className={`px-2 py-1 text-center text-sm font-semibold align-middle border-r border-b ${borderColor} w-[74px] min-w-[74px] max-w-[74px] h-[64px]`}
              style={{ backgroundColor: bgColor }}
            >
              {bdpiValue !== undefined && bdpiValue !== null
                ? `${bdpiValue.toFixed(0)}%`
                : "--"}
            </td>
          );
        }

        const metric = metrics?.[code];

        // isUsed가 false인 경우(수집불가 지표) - 하이어라키뷰에서는 조직별 배경색 적용
        if (metric?.isUsed === false) {
          return (
            <td
              key={code}
              className={`px-2 py-1 text-center align-middle border-r border-b ${borderColor} w-[74px] min-w-[74px] max-w-[74px] h-[64px]`}
              style={{ backgroundColor: bgColor }}
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
        const status = metric?.status;

        return (
          <td
            key={code}
            className={`px-2 py-1 text-center align-middle border-r border-b ${borderColor} w-[74px] min-w-[74px] max-w-[74px] h-[64px]`}
            style={{ backgroundColor: bgColor }}
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
              status={status}
            />
          </td>
        );
      })}
    </tr>
  );
};

// [변경: 2026-01-19 03:00, 김병현 수정] 통합 행 컴포넌트 (멤버) - 고정 영역 + 스크롤 영역을 하나의 행으로 합침
const CombinedMemberRow = ({
  item,
  summaryCounts,
  metricOrder,
  hideValue = false,
  aggregationType = "avg",
}: {
  item: FlatTreeItem;
  summaryCounts: SummaryCounts;
  metricOrder: string[];
  hideValue?: boolean;
  aggregationType?: AggregationType;
}) => {
  const member = item.data as OrganizationMember;
  const paddingLeft = 24 + item.depth * 24;
  const metrics = item.data.metrics as unknown as Record<string, MetricData>;
  const bgColor = getLevelBackgroundColor(member.level);
  const borderColor =
    member.level === 3 ? "border-gray-100" : "border-gray-200";

  return (
    <tr
      className={`border-b ${borderColor}  h-[64px]`}
      style={{ backgroundColor: bgColor }}
    >
      {/* 고정 영역 - 멤버 이름 */}
      <td
        className={`py-0 align-middle whitespace-nowrap border-r border-b ${borderColor} w-[350px] h-[64px] sticky left-0 z-10`}
        style={{
          paddingLeft: `${paddingLeft}px`,
          boxShadow: "2px 0 4px -2px rgba(0, 0, 0, 0.1)",
          backgroundColor: bgColor,
        }}
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
      {/* 고정 영역 - Summary 카테고리 */}
      {SUMMARY_CATEGORIES.map((cat, catIndex) => (
        <td
          key={cat.id}
          className={`px-2 py-4 text-center text-sm font-semibold align-middle border-r border-b ${borderColor} w-[72px] h-[64px] sticky z-10`}
          style={{
            left: `${350 + catIndex * 72}px`,
            boxShadow:
              catIndex === SUMMARY_CATEGORIES.length - 1
                ? "4px 0 8px -2px rgba(0, 0, 0, 0.1)"
                : undefined,
            backgroundColor: bgColor,
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
              className={`px-2 py-1 text-center text-sm font-semibold align-middle border-r border-b ${borderColor} w-[74px] min-w-[74px] max-w-[74px] h-[64px]`}
              style={{ backgroundColor: bgColor }}
            >
              {bdpiValue !== undefined && bdpiValue !== null
                ? `${bdpiValue.toFixed(0)}%`
                : "--"}
            </td>
          );
        }

        const metric = metrics?.[code];

        // isUsed가 false인 경우(수집불가 지표) - 하이어라키뷰에서는 조직별 배경색 적용
        if (metric?.isUsed === false) {
          return (
            <td
              key={code}
              className={`px-2 py-1 text-center align-middle border-r border-b ${borderColor} w-[74px] min-w-[74px] max-w-[74px] h-[64px]`}
              style={{ backgroundColor: bgColor }}
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
        const status = metric?.status;

        return (
          <td
            key={code}
            className={`px-2 py-1 text-center align-middle border-r border-b ${borderColor} w-[74px] min-w-[74px] max-w-[74px] h-[64px]`}
            style={{ backgroundColor: bgColor }}
          >
            <HeatmapCell
              metricCode={code}
              metricName={metricName}
              score={score}
              value={value}
              hideValue={hideValue}
              targetValue={targetValue}
              unit={unit}
              status={status}
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
  isSelected?: boolean;
  onSelect?: (code: string) => void;
}

const SortableMetricHeader = ({
  code,
  displayName,
  metricName,
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
          onClick={handleClick}
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
      </div>
    </th>
  );
};

export const OrganizationTable = ({
  month,
  activeTab,
  hideValues = false,
  aggregationType = "avg",
  onMetricDetailChange,
}: OrganizationTableProps) => {
  // 전체 탭일 경우 API 옵션 설정
  const apiOptions =
    activeTab === "all"
      ? {
          aggregation: aggregationType,
          format: "tree" as const,
        }
      : undefined;

  const { data, isLoading, isError, isFetching } = useOrganizationTree(
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
  const showMembers = useOrganizationStore((state) => state.showMembers);

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
    if (data?.tree && data.tree.length > 0 && data.tree[0].metrics) {
      const apiMetricOrder = Object.keys(data.tree[0].metrics);
      // BDPI가 없으면 마지막에 추가 (대소문자 모두 확인)
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

  // API 응답에서 thresholds 추출
  const thresholds = data?.thresholds;

  // API 응답에서 지표 정보(metricName, metricDisplayName) 추출
  const metricInfoMap = useMemo(() => {
    const map: Record<
      string,
      { metricName?: string; metricDisplayName?: string }
    > = {};
    if (data?.tree && data.tree.length > 0) {
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
  }, [data?.tree]);

  const organizations = (data?.tree ?? [])
    // .filter((org) => org.isEvaluationTarget)
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
      {/* [변경: 2026-01-20 10:55, 김병현 수정] 클래스명 일치하도록 수정 */}
      <style>{`
        .org-table-container::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .org-table-container::-webkit-scrollbar-track {
          background: transparent;
          margin-left: 638px;
        }
        .org-table-container::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .org-table-container::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .org-table-container::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
      <div className="org-table-container border border-gray-200 rounded-lg overflow-auto flex-1 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="border-separate border-spacing-0 table-fixed">
            {/* [변경: 2026-01-21 10:30, 김병현 수정] sticky 헤더에 shadow 추가하여 border 효과 적용 */}
            <thead
              className="sticky top-0 z-20 bg-white"
              style={{ boxShadow: "0 1px 0 0 #e5e7eb" }}
            >
              <tr className="bg-gray-50 h-[113px]">
                {/* 고정 영역 헤더 - 조직 이름 */}
                <th
                  className={`${thBaseStyle} text-left border-r border-b border-gray-200 w-[350px] min-w-[350px] h-[113px] bg-gray-50 sticky left-0 z-30`}
                >
                  조직 이름
                </th>
                {/* 고정 영역 헤더 - Summary 카테고리 */}
                {SUMMARY_CATEGORIES.map((cat, catIndex) => {
                  // API 응답의 thresholds 값 사용 (fallback: excellent=80, danger=60)
                  const excellentThreshold = thresholds?.excellent ?? 80;
                  const dangerThreshold = thresholds?.danger ?? 60;

                  // 공통 기준 툴팁 텍스트
                  const criteriaTooltip = `초과달성: 100% 초과\n우수: ${excellentThreshold}% 이상 ~ 100% 이하\n경고: ${dangerThreshold}% 이상 ~ ${excellentThreshold}% 미만\n위험: ${dangerThreshold}% 미만`;

                  return (
                    <th
                      key={cat.id}
                      className="px-2 py-2 text-center text-sm font-medium text-gray-700 whitespace-nowrap border-r border-gray-200 w-[72px] min-w-[72px] h-[113px] sticky z-30"
                      style={{
                        backgroundColor: SUMMARY_BG_COLORS[cat.id],
                        left: `${350 + catIndex * 72}px`,
                        boxShadow:
                          catIndex === SUMMARY_CATEGORIES.length - 1
                            ? "inset 0 -1px 0 #e5e7eb, 4px 0 8px -2px rgba(0, 0, 0, 0.1)"
                            : undefined,
                      }}
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
                {/* 스크롤 영역 헤더 - 지표 칼럼들 */}
                <SortableContext
                  items={metricOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {metricOrder.map((code) => {
                    const metricInfo = metricInfoMap[code];

                    return (
                      <SortableMetricHeader
                        key={code}
                        code={code}
                        displayName={metricInfo?.metricDisplayName}
                        metricName={metricInfo?.metricName}
                        isSelected={selectedMetricCode === code}
                        onSelect={handleMetricSelect}
                      />
                    );
                  })}
                </SortableContext>
              </tr>
            </thead>
            <tbody>
              {flatItems.map((item, index) => {
                const summaryCounts =
                  itemSummaryCountsMap.get(item) ??
                  calculateSummaryCounts(undefined);
                return item.type === "department" ? (
                  <CombinedDepartmentRow
                    key={`row-${(item.data as OrganizationDepartment).code}`}
                    item={item}
                    summaryCounts={summaryCounts}
                    onToggle={toggleOrganization}
                    metricOrder={metricOrder}
                    hideValue={hideValues}
                    aggregationType={aggregationType}
                  />
                ) : (
                  <CombinedMemberRow
                    key={`row-${
                      (item.data as OrganizationMember).employeeID
                    }-${index}`}
                    item={item}
                    summaryCounts={summaryCounts}
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
    </div>
  );
};
