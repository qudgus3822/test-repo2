/**
 * 조직 히트맵 정렬 훅
 * - Summary 카테고리별 또는 지표별 정렬을 지원합니다.
 */

import { useState, useMemo, useCallback } from "react";
import type {
  SortConfig,
  SummaryCategory,
  SummaryCounts,
  MetricData,
} from "./types";
import { calculateSummaryCounts, SUMMARY_CATEGORIES } from "./types";

interface FlatItem {
  type: "department" | "member";
  data: {
    metrics?: Record<string, MetricData>;
    [key: string]: unknown;
  };
  level?: number;
  depth?: number;
  parentName?: string;
}

interface UseOrganizationSortingResult {
  sortConfig: SortConfig;
  sortedItems: FlatItem[];
  itemSummaryCounts: Map<FlatItem, SummaryCounts>;
  toggleSort: (column: SummaryCategory | string) => void;
}

// Summary 카테고리 ID 목록
const SUMMARY_CATEGORY_IDS = SUMMARY_CATEGORIES.map((cat) => cat.id);

export const useOrganizationSorting = (
  items: FlatItem[]
): UseOrganizationSortingResult => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: "desc",
  });

  // 각 아이템의 summary counts 계산
  const itemSummaryCounts = useMemo(() => {
    const countsMap = new Map<FlatItem, SummaryCounts>();
    items.forEach((item) => {
      const counts = calculateSummaryCounts(
        item.data.metrics as Record<string, MetricData> | undefined
      );
      countsMap.set(item, counts);
    });
    return countsMap;
  }, [items]);

  // 정렬된 아이템
  const sortedItems = useMemo(() => {
    const column = sortConfig.column;
    if (!column) {
      return items;
    }

    const sorted = [...items].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      // Summary 카테고리별 정렬 (exceeds, achieved, good, caution)
      if (SUMMARY_CATEGORY_IDS.includes(column as SummaryCategory)) {
        const aCounts = itemSummaryCounts.get(a);
        const bCounts = itemSummaryCounts.get(b);
        aValue = aCounts?.[column as SummaryCategory] ?? 0;
        bValue = bCounts?.[column as SummaryCategory] ?? 0;
      } else {
        // 지표 코드별 정렬
        const aMetrics = a.data.metrics as Record<string, MetricData> | undefined;
        const bMetrics = b.data.metrics as Record<string, MetricData> | undefined;
        aValue = aMetrics?.[column]?.score ?? -1;
        bValue = bMetrics?.[column]?.score ?? -1;
      }

      if (sortConfig.direction === "asc") {
        return aValue - bValue;
      }
      return bValue - aValue;
    });

    return sorted;
  }, [items, sortConfig, itemSummaryCounts]);

  // 정렬 토글
  const toggleSort = useCallback((column: SummaryCategory | string) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        // 같은 컬럼 클릭: 방향 토글
        return {
          column,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      // 다른 컬럼 클릭: 내림차순으로 시작
      return {
        column,
        direction: "desc",
      };
    });
  }, []);

  return {
    sortConfig,
    sortedItems,
    itemSummaryCounts,
    toggleSort,
  };
};

export default useOrganizationSorting;
