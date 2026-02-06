import { useState, useEffect, useCallback } from "react";
import type { FlatViewFilterType } from "@/components/organization";
import type { AggregationType } from "@/types/organization.types";
import { useOrganizationStore } from "@/store/useOrganizationStore";

/**
 * 뷰 모드 관련 상태 관리 훅
 * - 하이어라키뷰 / 플랫뷰 전환
 * - 플랫뷰 필터 (실/팀/개인)
 * - 집계 타입 (평균/총합)
 * - 테이블 줌 모드
 * - 지표 상세 정보 표시 상태
 * - 날짜 변경 시 모든 상태 초기화
 */
export const useViewMode = (activeTab: string, currentDate?: Date) => {
  // 서브탭 상태: 하이어라키뷰 / 플랫뷰
  const [viewType, setViewTypeState] = useState<"hierarchy" | "flat">("hierarchy");

  // [변경: 2026-01-30 10:30, 임도휘 수정] 뷰 타입 변경 시 전체 팀 펼침 상태 초기화
  const setIsTeamsExpanded = useOrganizationStore(
    (state) => state.setIsTeamsExpanded,
  );

  const setViewType = useCallback(
    (type: "hierarchy" | "flat") => {
      setViewTypeState(type);
      setIsTeamsExpanded(false);
    },
    [setIsTeamsExpanded],
  );

  // 플랫뷰 필터: 실 / 팀 / 개인
  const [flatViewFilter, setFlatViewFilter] =
    useState<FlatViewFilterType>("division");

  // 집계 타입 필터: 평균 / 총합 (전체 탭 전용)
  const [aggregationType, setAggregationType] =
    useState<AggregationType>("avg");

  // 테이블 전체보기 (zoom 축소) 모드
  const [isTableZoomed, setIsTableZoomed] = useState(false);

  // [변경: 2026-01-20 15:30, 김병현 수정] 지표 상세 정보 표시 상태 (테이블 내부 MetricDetailInfo)
  const [isMetricDetailOpen, setIsMetricDetailOpen] = useState(false);

  // 탭 변경 시 전체보기 모드 초기화
  useEffect(() => {
    setIsTableZoomed(false);
  }, [activeTab]);

  // [변경: 2026-02-06 00:00, 임도휘 수정] 날짜 변경 시 모든 뷰 모드 상태 초기화
  useEffect(() => {
    if (currentDate) {
      setViewTypeState("hierarchy");
      setFlatViewFilter("division");
      setAggregationType("avg");
      setIsTableZoomed(false);
      setIsMetricDetailOpen(false);
      setIsTeamsExpanded(false);
    }
  }, [currentDate, setIsTeamsExpanded]);

  return {
    viewType,
    setViewType,
    flatViewFilter,
    setFlatViewFilter,
    aggregationType,
    setAggregationType,
    isTableZoomed,
    setIsTableZoomed,
    isMetricDetailOpen,
    setIsMetricDetailOpen,
  };
};
