/**
 * OrganizationBdpiFlatTable 컴포넌트
 * - BDPI 탭용 플랫 테이블
 * - 조직 이름, 코드품질, 리뷰품질, 개발효율, BDPI, 전월비교, 상세 컬럼
 * - 헤더별 정렬 기능 포함
 */

import { useState, useMemo, useCallback } from "react";
import { Search as SearchIcon, ArrowUp, ArrowDown } from "lucide-react";
import upIcon from "@/assets/icons/up_icon_green.svg";
import downIcon from "@/assets/icons/down_icon_red.svg";
import {
  SCORE_EXCELLENT_THRESHOLD,
  SCORE_GOOD_THRESHOLD,
} from "@/store/useOrganizationStore";
import type {
  OrganizationDepartment,
  OrganizationMember,
  OrganizationNode,
  TabType,
  ScoreLevel,
  BdpiMetrics,
  MonthlyComparison,
} from "@/types/organization.types";
import { SCORE_COLORS, TREND_COLORS } from "@/styles/colors";
import { clsx } from "clsx";
import { useOrganizationTree } from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// 플랫뷰 필터 타입
export type FlatViewFilterType = "room" | "team" | "member";

interface OrganizationBdpiFlatTableProps {
  month: string;
  activeTab: TabType;
  filterType?: FlatViewFilterType;
  onDetailClick?: (item: OrganizationDepartment | OrganizationMember) => void;
}

// 플랫 데이터 아이템 타입
interface FlatItem {
  type: "department" | "member";
  data: OrganizationDepartment | OrganizationMember;
  level: number;
  parentName?: string;
}

// 정렬 가능한 컬럼 타입
type SortColumn = "quality" | "review" | "efficiency" | "bdpi" | null;

interface SortConfig {
  column: SortColumn;
  direction: "asc" | "desc";
}

// 정렬 가능한 헤더 정의
const SORTABLE_HEADERS: { id: SortColumn; label: string }[] = [
  { id: "quality", label: "코드품질" },
  { id: "review", label: "리뷰품질" },
  { id: "efficiency", label: "개발효율" },
  { id: "bdpi", label: "BDPI" },
];

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
}: {
  score: number | null;
  isFirst?: boolean;
}) => {
  const isNoScore = score === null;

  return (
    <td
      className={clsx(
        "px-2 text-center text-sm font-medium align-middle border-r border-gray-200 w-[80px] min-w-[80px]",
        isFirst && "border-l",
        !isNoScore && getScoreTextColor(score)
      )}
      style={{
        backgroundColor: isNoScore ? SCORE_COLORS.noScore : getScoreBgColor(score),
      }}
    >
      {score !== null ? score.toFixed(1) : "--"}
    </td>
  );
};

// 트리를 플랫 배열로 변환하는 함수
const flattenTree = (
  nodes: OrganizationNode[],
  filterType: FlatViewFilterType = "room"
): FlatItem[] => {
  const result: FlatItem[] = [];

  const traverse = (node: OrganizationNode, parentName?: string) => {
    if (!node.isEvaluationTarget) return;

    if (node.type === "department") {
      const dept = node as OrganizationDepartment;

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
        });
      }

      if (dept.children) {
        dept.children.forEach((child) => traverse(child, dept.name));
      }
    } else if (node.type === "member") {
      if (filterType === "member") {
        result.push({
          type: "member",
          data: node,
          level: node.level,
          parentName,
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
  onDetailClick,
}: {
  item: FlatItem;
  onDetailClick?: (item: OrganizationDepartment | OrganizationMember) => void;
}) => {
  const data = item.data;
  const isDepartment = item.type === "department";
  const bdpiMetrics = data.metrics as BdpiMetrics;

  const displayName = isDepartment
    ? (data as OrganizationDepartment).name
    : (data as OrganizationMember).name;

  const memberCount = isDepartment
    ? (data as OrganizationDepartment).memberCount
    : null;

  return (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 h-[50px]">
      <td className="px-4 align-middle whitespace-nowrap">
        <div className="flex items-center">
          <input
            type="checkbox"
            disabled
            className="mr-3 w-4 h-4 rounded border-gray-300 opacity-30 cursor-not-allowed"
          />
          <span className="font-medium text-gray-900">{displayName}</span>
          {memberCount !== null && (
            <span className="ml-2 text-sm text-gray-500">({memberCount})</span>
          )}
        </div>
        {item.parentName && (
          <div className="text-xs text-gray-500 mt-0.5 ml-7">
            {item.parentName}
          </div>
        )}
      </td>
      <ScoreCell score={bdpiMetrics?.quality?.score ?? null} isFirst />
      <ScoreCell score={bdpiMetrics?.review?.score ?? null} />
      <ScoreCell score={bdpiMetrics?.efficiency?.score ?? null} />
      <ScoreCell score={bdpiMetrics?.bdpi?.score ?? null} />
      <td className="px-3 text-center align-middle">
        <ChangeRateDisplay comparison={bdpiMetrics?.monthlyComparison} />
      </td>
      <td className="px-3 text-center align-middle">
        <button
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
          onClick={() => onDetailClick?.(data)}
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

export const OrganizationBdpiFlatTable = ({
  month,
  activeTab,
  filterType = "room",
  onDetailClick,
}: OrganizationBdpiFlatTableProps) => {
  const { data, isLoading, isError } = useOrganizationTree(month, activeTab);
  const flatItems = flattenTree(data?.tree ?? [], filterType);

  // 정렬 상태
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: "desc",
  });

  // 정렬 토글
  const toggleSort = useCallback((column: SortColumn) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return {
        column,
        direction: "desc",
      };
    });
  }, []);

  // 정렬된 아이템
  const sortedItems = useMemo(() => {
    if (!sortConfig.column) {
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

  const thStyle = "px-3 py-3 text-center text-sm font-medium text-gray-700";

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full table-fixed">
        <colgroup>
          <col />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className={`${thStyle} text-left whitespace-nowrap`}>조직 이름</th>
            {SORTABLE_HEADERS.map((header) => {
              const isActive = sortConfig.column === header.id;
              const isDesc = sortConfig.direction === "desc";
              return (
                <th
                  key={header.id}
                  className={`${thStyle} w-[7%] cursor-pointer hover:bg-gray-100 select-none ${
                    isActive ? "bg-blue-50" : ""
                  }`}
                  onClick={() => toggleSort(header.id)}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{header.label}</span>
                    {isActive && (
                      isDesc ? (
                        <ArrowDown className="w-3 h-3 text-blue-600" />
                      ) : (
                        <ArrowUp className="w-3 h-3 text-blue-600" />
                      )
                    )}
                  </div>
                </th>
              );
            })}
            <th className={`${thStyle} w-[7%]`}>전월비교</th>
            <th className={`${thStyle} w-[7%]`}>상세</th>
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
              onDetailClick={onDetailClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
