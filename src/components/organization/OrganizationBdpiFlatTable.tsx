/**
 * OrganizationBdpiFlatTable 컴포넌트
 * - BDPI 탭용 플랫 테이블
 * - 조직 이름, 코드품질, 리뷰품질, 개발효율, BDPI, 전월대비, 상세 컬럼
 * - 헤더별 정렬 기능 포함
 * - 히트맵 시각화 (HeatmapCell 사용)
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowUp, ArrowDown, ArrowDownUp } from "lucide-react";
import upIcon from "@/assets/icons/up_icon_green.svg";
import downIcon from "@/assets/icons/down_icon_red.svg";
import type {
  OrganizationDepartment,
  OrganizationMember,
  OrganizationNode,
  TabType,
  BdpiMetrics,
  MonthlyComparison,
  ChangeInfo,
  AggregationType,
} from "@/types/organization.types";
import {
  hasChangeInfo,
  formatChangeDate,
  getChangeDetailWithSuffix,
  getMemberRoleOrPositionLabel,
} from "@/utils/organization";
import { TREND_COLORS } from "@/styles/colors";
import { Tooltip } from "@/components/ui/Tooltip";
import { useOrganizationTree } from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import { HeatmapCell } from "./heatmap/HeatmapCell";

// 플랫뷰 필터 타입 (API 파라미터와 동일)
export type FlatViewFilterType = "division" | "team" | "member";


interface OrganizationBdpiFlatTableProps {
  month: string;
  activeTab: TabType;
  filterType?: FlatViewFilterType;
  hideValues?: boolean;
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

// 정렬 가능한 컬럼 타입
type SortColumn = "quality" | "review" | "efficiency" | "bdpi" | null;

interface SortConfig {
  column: SortColumn;
  direction: "asc" | "desc" | null;
}

// BDPI 지표 코드 목록
const BDPI_METRIC_CODES = ["quality", "review", "efficiency", "bdpi"] as const;

// 정렬 가능한 헤더 정의
const SORTABLE_HEADERS: { id: SortColumn; label: string }[] = [
  { id: "quality", label: "코드품질" },
  { id: "review", label: "리뷰품질" },
  { id: "efficiency", label: "개발효율" },
  { id: "bdpi", label: "BDPI" },
];

// 전월대비 표시
const ChangeRateDisplay = ({
  comparison,
}: {
  comparison: MonthlyComparison | undefined;
}) => {
  if (!comparison) return <span className="text-gray-400">--</span>;

  const { changePercent, direction } = comparison;

  // 전월 데이터 없음 또는 당월 데이터 없음
  if (direction === "new" || direction === "no_data") {
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

// 플랫 테이블 행 컴포넌트
const FlatRow = ({
  item,
  hideValues = false,
  filterType,
}: {
  item: FlatItem;
  hideValues?: boolean;
  filterType: FlatViewFilterType;
}) => {
  const data = item.data;
  const isDepartment = item.type === "department";
  const bdpiMetrics = data.metrics as BdpiMetrics;
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
    <tr
      className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 ${rowHeight}`}
    >
      <td
        className={`px-5 py-4 align-middle whitespace-nowrap border-r border-gray-200 w-[350px] ${rowHeight}`}
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
          </div>
        )}
      </td>
      {BDPI_METRIC_CODES.map((code) => {
        const metric = bdpiMetrics?.[code];
        const score = metric?.score ?? null;
        return (
          <td
            key={code}
            className={`px-2 py-1 text-center align-middle border-r border-gray-200 w-[100px] min-w-[100px] ${rowHeight}`}
          >
            <HeatmapCell
              metricCode={code}
              score={score}
              value={score}
              hideValue={hideValues}
              showTooltip={false}
            />
          </td>
        );
      })}
      <td className="px-3 text-center align-middle">
        <ChangeRateDisplay comparison={bdpiMetrics?.monthlyComparison} />
      </td>
    </tr>
  );
};

export const OrganizationBdpiFlatTable = ({
  month,
  activeTab,
  filterType = "division",
  hideValues = false,
  searchKeyword = "",
  onSearchResult,
  aggregationType = "avg",
}: OrganizationBdpiFlatTableProps) => {
  // BDPI 탭일 경우 API 옵션 설정 (검색 키워드 포함)
  const apiOptions =
    activeTab === "bdpi"
      ? {
          aggregation: aggregationType,
          format: "list" as const,
          type: filterType,
          search: searchKeyword.trim() || undefined,
        }
      : undefined;

  const { data, isLoading, isError } = useOrganizationTree(
    month,
    activeTab,
    true,
    apiOptions,
  );

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

  // 정렬 상태
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: null,
  });

  // 정렬 토글 (3단계: null → asc → desc → null)
  const toggleSort = useCallback((column: SortColumn) => {
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

  // 정렬된 아이템
  const sortedItems = useMemo(() => {
    // 정렬이 비활성화된 경우 원본 순서 유지
    if (!sortConfig.column || !sortConfig.direction) {
      return flatItems;
    }

    return [...flatItems].sort((a, b) => {
      const aMetrics = a.data.metrics as BdpiMetrics;
      const bMetrics = b.data.metrics as BdpiMetrics;

      let aValue: number | null = null;
      let bValue: number | null = null;

      switch (sortConfig.column) {
        case "quality":
          aValue = aMetrics?.quality?.score ?? null;
          bValue = bMetrics?.quality?.score ?? null;
          break;
        case "review":
          aValue = aMetrics?.review?.score ?? null;
          bValue = bMetrics?.review?.score ?? null;
          break;
        case "efficiency":
          aValue = aMetrics?.efficiency?.score ?? null;
          bValue = bMetrics?.efficiency?.score ?? null;
          break;
        case "bdpi":
          aValue = aMetrics?.bdpi?.score ?? null;
          bValue = bMetrics?.bdpi?.score ?? null;
          break;
      }

      // null 값은 -1로 처리
      const aNum = aValue ?? -1;
      const bNum = bValue ?? -1;

      if (sortConfig.direction === "asc") {
        return aNum - bNum;
      }
      return bNum - aNum;
    });
  }, [flatItems, sortConfig]);

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

  const thStyle = "px-3 py-3 text-center text-sm font-medium text-gray-700";

  // [변경: 2026-01-19 00:00, 김병현 수정] thead 고정, tbody만 스크롤되도록 변경
  return (
    <div className="overflow-auto h-full border border-gray-200 rounded-lg">
      <table className="w-full table-fixed">
        <colgroup>
          <col />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-gray-200 bg-gray-50 h-[67px]">
            <th
              className={`${thStyle} text-left whitespace-nowrap border-r border-gray-200`}
            >
              조직 이름
            </th>
            {SORTABLE_HEADERS.map((header) => {
              const isActive =
                sortConfig.column === header.id &&
                sortConfig.direction !== null;

              // 정렬 아이콘 렌더링
              const renderSortIcon = () => {
                if (!isActive) {
                  return <ArrowDownUp className="w-4.5 h-4.5 text-gray-500" />;
                }
                if (sortConfig.direction === "asc") {
                  return <ArrowUp className="w-4.5 h-4.5 text-blue-600" />;
                }
                return <ArrowDown className="w-4.5 h-4.5 text-blue-600" />;
              };

              return (
                <th
                  key={header.id}
                  className={`${thStyle} w-[7%] cursor-pointer hover:bg-gray-100 select-none border-r border-gray-200 ${
                    isActive ? "bg-blue-50" : ""
                  }`}
                  onClick={() => toggleSort(header.id)}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span>{header.label}</span>
                    <span>{renderSortIcon()}</span>
                  </div>
                </th>
              );
            })}
            <th className={`${thStyle} w-[7%]`}>전월대비</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item, index) => (
            <FlatRow
              key={
                item.type === "department"
                  ? (item.data as OrganizationDepartment).code
                  : `${(item.data as OrganizationMember).employeeID}-${index}`
              }
              item={item}
              hideValues={hideValues}
              filterType={filterType}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
