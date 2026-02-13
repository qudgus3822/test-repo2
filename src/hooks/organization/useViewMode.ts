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
 * - 날짜 변경 시 펼침 상태 초기화 (필터는 유지)
 */
export const useViewMode = (activeTab: string, currentDate?: Date) => {
  // 서브탭 상태: 하이어라키뷰 / 플랫뷰
  const [viewType, setViewTypeState] = useState<"hierarchy" | "flat">("hierarchy");

  // [변경: 2026-01-30 10:30, 임도휘 수정] 뷰 타입 변경 시 전체 팀 펼침 상태 초기화
  const setIsTeamsExpanded = useOrganizationStore(
    (state) => state.setIsTeamsExpanded,
  );

  // [변경: 2026-02-13 13:52, 임도휘 수정] 필터 변경 시 테이블 헤더 정렬 초기화를 위해 setSortConfig 가져옴
  const setSortConfig = useOrganizationStore(
    (state) => state.setSortConfig,
  );

  const setViewType = useCallback(
    (type: "hierarchy" | "flat") => {
      setViewTypeState(type);
      setIsTeamsExpanded(false);
      // [변경: 2026-02-13 13:52, 임도휘 수정] 뷰 타입 변경 시 정렬 초기화
      setSortConfig({ column: null, direction: null });
    },
    [setIsTeamsExpanded, setSortConfig],
  );

  // 플랫뷰 필터: 실 / 팀 / 개인
  const [flatViewFilter, setFlatViewFilterState] =
    useState<FlatViewFilterType>("division");

  // [변경: 2026-02-13 13:52, 임도휘 수정] 실/팀/개인 필터 변경 시 정렬 초기화
  const setFlatViewFilter = useCallback(
    (filter: FlatViewFilterType) => {
      setFlatViewFilterState(filter);
      setSortConfig({ column: null, direction: null });
    },
    [setSortConfig],
  );

  // 집계 타입 필터: 평균 / 총합 (전체 탭 전용)
  const [aggregationType, setAggregationTypeState] =
    useState<AggregationType>("avg");

  // [변경: 2026-02-13 13:52, 임도휘 수정] 평균/총합 필터 변경 시 정렬 초기화
  const setAggregationType = useCallback(
    (type: AggregationType) => {
      setAggregationTypeState(type);
      setSortConfig({ column: null, direction: null });
    },
    [setSortConfig],
  );

  // 테이블 전체보기 (zoom 축소) 모드
  const [isTableZoomed, setIsTableZoomed] = useState(false);

  // [변경: 2026-01-20 15:30, 김병현 수정] 지표 상세 정보 표시 상태 (테이블 내부 MetricDetailInfo)
  const [isMetricDetailOpen, setIsMetricDetailOpen] = useState(false);

  // 탭 변경 시 전체보기 모드 초기화
  useEffect(() => {
    setIsTableZoomed(false);
  }, [activeTab]);

  // [변경: 2026-02-06 00:00, 임도휘 수정] 날짜 변경 시 펼침 상태만 초기화 (필터는 유지)
  useEffect(() => {
    if (currentDate) {
      // 펼침 상태만 초기화
      setIsTeamsExpanded(false);
      // 지표 상세 정보 닫기
      setIsMetricDetailOpen(false);
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
