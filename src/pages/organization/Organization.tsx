import { useEffect, useMemo, useState, useRef } from "react";
import {
  Search,
  Cable,
  Network,
  List,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DateFilter } from "@/components/ui/DateFilter";
import { Switch } from "@/components/ui/Switch";
import {
  OrganizationTabs,
  OrganizationTable,
  OrganizationFlatTable,
  OrganizationBdpiTable,
  OrganizationBdpiFlatTable,
  ScoreLegend,
  OrganizationDetailModal,
  type FlatViewFilterType,
} from "@/components/organization";
import { OrgChangeHistoryModal } from "@/components/dashboard";
import type { OrganizationDetailItem } from "@/components/organization";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  useOrganizationTree,
  useMetricOrder,
  organizationTreeKeys,
} from "@/api/hooks/useOrganizationTree";
import { useQueryClient } from "@tanstack/react-query";
import type {
  OrganizationDepartment,
  AggregationType,
} from "@/types/organization.types";
import { formatYearMonth } from "@/utils";

// Level 1(부문) 조직 코드만 수집
// 초기 화면 진입 시 사용 → 실 단위까지 보임
const getLevel1DepartmentCodes = (orgs: OrganizationDepartment[]): string[] => {
  return orgs.filter((org) => org.level === 1).map((org) => org.code);
};

// Level 2(실)까지의 조직 코드 수집 (부문 + 실)
// 전체 팀 열기 클릭 시 사용 → 팀 목록까지 보임 (팀은 접힌 상태)
const getDepartmentCodes = (orgs: OrganizationDepartment[]): string[] => {
  const codes: string[] = [];
  const collect = (org: OrganizationDepartment) => {
    codes.push(org.code);
    // Level 1(부문)만 children 탐색 → Level 2(실)까지만 수집
    if (org.level < 2 && org.children) {
      org.children.forEach((child) => {
        if (child.type === "department") {
          collect(child);
        }
      });
    }
  };
  orgs.forEach((org) => collect(org));
  return codes;
};

const OrganizationPage = () => {
  const activeTab = useOrganizationStore((state) => state.activeTab);
  const setActiveTab = useOrganizationStore((state) => state.setActiveTab);
  const period = useOrganizationStore((state) => state.period);
  const setPeriod = useOrganizationStore((state) => state.setPeriod);
  const currentDate = useOrganizationStore((state) => state.currentDate);
  const setCurrentDate = useOrganizationStore((state) => state.setCurrentDate);
  const expandAllTeams = useOrganizationStore((state) => state.expandAllTeams);
  const expandAll = useOrganizationStore((state) => state.expandAll);
  const collapseToDefault = useOrganizationStore(
    (state) => state.collapseToDefault,
  );
  const isTeamsExpanded = useOrganizationStore(
    (state) => state.isTeamsExpanded,
  );
  const isMetricColumnDragged = useOrganizationStore(
    (state) => state.isMetricColumnDragged,
  );
  const setMetricOrder = useOrganizationStore((state) => state.setMetricOrder);
  const setIsMetricColumnDragged = useOrganizationStore(
    (state) => state.setIsMetricColumnDragged,
  );

  // [변경: 2026-01-22, 김병현 수정] 서버에서 저장된 지표 순서 조회
  const { data: metricOrderData } = useMetricOrder();
  // [변경: 2026-01-22 10:00, 김병현 수정] 지표 표시 모드 상태 (실제값/달성률)
  const displayMode = useOrganizationStore((state) => state.displayMode);
  const setDisplayMode = useOrganizationStore((state) => state.setDisplayMode);

  const setOrgHistoryModal = useDashboardStore(
    (state) => state.setOrgHistoryModal,
  );

  const queryClient = useQueryClient();

  // 페이지 진입 시 초기화: 당월, 전체 탭으로 설정
  useEffect(() => {
    setPeriod("monthly");
    setCurrentDate(new Date());
    setActiveTab("all");
    // 드래그 플래그 초기화
    setIsMetricColumnDragged(false);
    // 조직 관련 쿼리 캐시 무효화하여 최신 데이터 조회
    queryClient.invalidateQueries({ queryKey: organizationTreeKeys.all });
  }, [
    setPeriod,
    setCurrentDate,
    setActiveTab,
    setIsMetricColumnDragged,
    queryClient,
  ]);

  // [변경: 2026-01-22, 김병현 수정] 서버에서 저장된 지표 순서를 스토어에 동기화
  useEffect(() => {
    if (metricOrderData?.order && metricOrderData.order.length > 0) {
      setMetricOrder(metricOrderData.order);
    }
  }, [metricOrderData, setMetricOrder]);

  // 상세 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] =
    useState<OrganizationDetailItem | null>(null);

  // [변경: 2026-01-20 15:30, 김병현 수정] 지표 상세 정보 표시 상태 (테이블 내부 MetricDetailInfo)
  const [isMetricDetailOpen, setIsMetricDetailOpen] = useState(false);

  // 서브탭 상태: 하이어라키뷰 / 플랫뷰
  const [viewType, setViewType] = useState<"hierarchy" | "flat">("hierarchy");

  // 플랫뷰 필터: 실 / 팀 / 개인
  const [flatViewFilter, setFlatViewFilter] =
    useState<FlatViewFilterType>("division");

  // 집계 타입 필터: 평균 / 총합 (전체 탭 전용)
  const [aggregationType, setAggregationType] =
    useState<AggregationType>("avg");

  // 검색 영역 표시 상태
  const [isSearchAreaOpen, setIsSearchAreaOpen] = useState(false);

  // 검색 입력 상태 (검색 영역 내 input)
  const [searchInput, setSearchInput] = useState("");

  // 실제 검색에 사용되는 키워드 (검색 버튼 클릭 또는 엔터 시 업데이트)
  const [activeSearchKeyword, setActiveSearchKeyword] = useState("");

  // 검색 결과 개수
  const [searchResultCount, setSearchResultCount] = useState<number | null>(
    null,
  );

  // 검색 실행 핸들러
  const handleSearch = () => {
    setActiveSearchKeyword(searchInput.trim());
  };

  // 검색 입력 엔터 핸들러
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 플랫뷰 필터 변경 시 검색어 초기화
  useEffect(() => {
    setSearchInput("");
    setActiveSearchKeyword("");
    setSearchResultCount(null);
  }, [flatViewFilter]);

  // 검색 영역 닫힐 때 검색어 초기화
  useEffect(() => {
    if (!isSearchAreaOpen) {
      setSearchInput("");
      setActiveSearchKeyword("");
      setSearchResultCount(null);
    }
  }, [isSearchAreaOpen]);

  // 뷰타입 변경 시 검색어 초기화 및 검색 영역 숨김
  useEffect(() => {
    setSearchInput("");
    setActiveSearchKeyword("");
    setSearchResultCount(null);
    setIsSearchAreaOpen(false);
  }, [viewType]);

  // 상세 버튼 클릭 핸들러
  const handleDetailClick = (item: OrganizationDetailItem) => {
    setSelectedDetailItem(item);
    setIsDetailModalOpen(true);
  };

  // 상세 모달 닫기 핸들러
  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedDetailItem(null);
  };

  // 현재 선택된 날짜를 YYYY-MM 형식으로 변환
  const yearMonth = formatYearMonth(currentDate);

  // 탭별 API 옵션 설정 (하위 테이블 컴포넌트와 동일한 queryKey 사용을 위함)
  // 주의: Query Key 일치를 위해 테이블 컴포넌트의 apiOptions 구조와 정확히 동일해야 함
  const apiOptions = useMemo(() => {
    if (activeTab === "all" || activeTab === "bdpi") {
      const baseOptions = {
        aggregation: aggregationType,
      };

      if (viewType === "hierarchy") {
        // OrganizationTable과 동일한 구조 (type 필드 없음)
        return {
          ...baseOptions,
          format: "tree" as const,
        };
      } else {
        // OrganizationFlatTable과 동일한 구조 (search 필드 포함)
        return {
          ...baseOptions,
          format: "list" as const,
          type: flatViewFilter,
          search: activeSearchKeyword.trim() || undefined,
        };
      }
    }
    return undefined;
  }, [
    activeTab,
    aggregationType,
    viewType,
    flatViewFilter,
    activeSearchKeyword,
  ]);

  // 이전 필터 값을 추적하는 ref (필터 변경 감지용)
  const prevFiltersRef = useRef({ viewType, flatViewFilter, aggregationType });

  // 필터 변경 시 드래그 플래그가 true이면 API 재호출하여 칼럼 순서 동기화
  // [변경: 2026-01-22, 김병현 수정] 필터 변경 시에도 드래그된 순서 유지 (서버에 저장되어 있으므로)
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const filtersChanged =
      prevFilters.viewType !== viewType ||
      prevFilters.flatViewFilter !== flatViewFilter ||
      prevFilters.aggregationType !== aggregationType;

    // 이전 필터 값 업데이트
    prevFiltersRef.current = { viewType, flatViewFilter, aggregationType };

    // 필터가 실제로 변경되었고, 드래그 플래그가 true일 때만 플래그 초기화
    if (filtersChanged && isMetricColumnDragged) {
      // 플래그 초기화 (서버에 이미 저장되었으므로 순서는 유지)
      setIsMetricColumnDragged(false);
    }
  }, [
    viewType,
    flatViewFilter,
    aggregationType,
    isMetricColumnDragged,
    setIsMetricColumnDragged,
  ]);

  // 전체 팀 열기/접기를 위해 조직 데이터 조회 (캐시된 데이터 사용)
  const { data, isLoading, isError } = useOrganizationTree(
    yearMonth,
    activeTab,
    true,
    apiOptions,
  );

  const organizations = useMemo(() => data?.tree ?? [], [data?.tree]);

  // 데이터가 있는지 확인 (tree 또는 items에 isEvaluationTarget: true인 조직이 있는지)
  const hasData = useMemo(() => {
    if (isLoading || isError) return false;
    // format=list 응답 (items 배열)
    if (data?.items && data.items.length > 0) {
      return data.items.some((item) => item.isEvaluationTarget);
    }
    // format=tree 응답 (tree 배열)
    return organizations.filter((org) => org.isEvaluationTarget).length > 0;
  }, [isLoading, isError, data?.items, organizations]);

  // 화면 진입 시 Level 1(부문)까지 펼침 상태로 초기화
  useEffect(() => {
    if (organizations.length > 0) {
      const level1Codes = getLevel1DepartmentCodes(organizations);
      if (level1Codes.length > 0) {
        expandAll(level1Codes);
      }
    }
  }, [organizations, expandAll]);

  const handleToggleTeams = () => {
    if (isTeamsExpanded) {
      // 접기: 초기 화면 진입 시와 동일 (Level 1만 펼침 → 실 단위까지 보임)
      const level1Codes = getLevel1DepartmentCodes(organizations);
      collapseToDefault(level1Codes);
    } else {
      // 열기: 실 단위까지 펼침 → 팀 단위까지 보임
      const deptCodes = getDepartmentCodes(organizations);
      expandAllTeams(deptCodes);
    }
  };

  // [변경: 2026-01-19 00:00, 김병현 수정] 100vh 레이아웃 적용 - 상단 영역 고정, 테이블 영역 스크롤
  return (
    <div className="flex flex-col h-full">
      {/* 탭 메뉴 */}
      {/* [변경: 2026-01-20 15:30, 김병현 수정] 지표 상세 정보 표시 시 전체 스크롤 허용 */}
      <Card
        className={`flex-1 min-h-0 flex flex-col ${isMetricDetailOpen ? "overflow-auto" : "overflow-hidden"} `}
      >
        <div className="flex-shrink-0">
          <OrganizationTabs />
        </div>

        {/* 첫 번째 줄: 기간 선택 */}
        <div className="flex-shrink-0 h-[84px] relative flex items-center p-4 border-b border-gray-200">
          <div className="flex items-center gap-5">
            <DateFilter
              period={period}
              onPeriodChange={setPeriod}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
            {/* 조직도 변경 히스토리 팝업 버튼 */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setOrgHistoryModal(true)}
            >
              <Cable className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 서브탭: 하이어라키뷰 / 플랫뷰 */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200">
          {/* 좌측: 뷰타입 탭 + 플랫뷰 필터 */}
          <div className="flex items-center">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewType("hierarchy")}
                className={`cursor-pointer flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors ${
                  viewType === "hierarchy"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Network className="w-4 h-4" />
                하이어라키뷰
              </button>
              <button
                onClick={() => setViewType("flat")}
                className={`cursor-pointer flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium border-l border-slate-200 transition-colors ${
                  viewType === "flat"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List className="w-4 h-4" />
                플랫뷰
              </button>
            </div>

            {/* 플랫뷰일 때만 실/팀/개인 필터 표시 */}
            {viewType === "flat" && (
              <div className="flex items-center ml-4 border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setFlatViewFilter("division")}
                  className={`cursor-pointer px-4 py-1.5 text-sm font-medium transition-colors ${
                    flatViewFilter === "division"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  실
                </button>
                <button
                  onClick={() => setFlatViewFilter("team")}
                  className={`cursor-pointer px-4 py-1.5 text-sm font-medium border-l border-slate-200 transition-colors ${
                    flatViewFilter === "team"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  팀
                </button>
                <button
                  onClick={() => setFlatViewFilter("member")}
                  className={`cursor-pointer px-4 py-1.5 text-sm font-medium border-l border-slate-200 transition-colors ${
                    flatViewFilter === "member"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  개인
                </button>
              </div>
            )}

            {/* 전체/BDPI 탭: 평균/총합 필터 */}
            {(activeTab === "all" || activeTab === "bdpi") && (
              <div className="flex items-center ml-4 border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setAggregationType("avg")}
                  className={`cursor-pointer px-4 py-1.5 text-sm font-medium transition-colors ${
                    aggregationType === "avg" || activeTab === "bdpi"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  평균
                </button>
                <button
                  onClick={() =>
                    activeTab !== "bdpi" && setAggregationType("total")
                  }
                  disabled={activeTab === "bdpi"}
                  className={`px-4 py-1.5 border-l border-slate-200 text-sm font-medium transition-colors ${
                    activeTab === "bdpi"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : aggregationType === "total"
                        ? "bg-blue-600 text-white cursor-pointer"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
                  }`}
                >
                  총합
                </button>
              </div>
            )}
          </div>

          {/* 우측: 뷰타입별 영역 + 보기/숨기기 버튼 */}
          <div className="flex items-center gap-2">
            {/* 플랫뷰: 검색 아이콘 버튼 */}
            {viewType === "flat" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsSearchAreaOpen(!isSearchAreaOpen)}
              >
                <span className="flex items-center gap-1.5">
                  <Search className="w-4 h-4" />
                  통합 검색
                  {isSearchAreaOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </span>
              </Button>
            )}
            {/* 하이어라키뷰: 전체 팀 열기/접기 버튼 */}
            {viewType === "hierarchy" && (
              <Button variant="normal" size="sm" onClick={handleToggleTeams}>
                {isTeamsExpanded ? "전체 팀 접기" : "전체 팀 열기"}
              </Button>
            )}
            {/* 보기/숨기기 버튼 */}
            {/* <Button
              variant="normal"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  보기
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4" />
                  숨기기
                </span>
              )}
            </Button> */}
            {/* [변경: 2026-01-22 15:00, 김병현 수정] 달성률/실제값 전환 스위치 (달성률이 기본) */}
            {activeTab === "all" && (
              <Switch
                checked={displayMode === "value"}
                onChange={(checked) =>
                  setDisplayMode(checked ? "value" : "rate")
                }
                leftLabel="달성률"
                rightLabel="실제값"
              />
            )}
          </div>
        </div>

        {/* 검색 영역: 플랫뷰일 때만 표시 */}
        {viewType === "flat" && isSearchAreaOpen && (
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 gap-5 flex flex-col min-h-[120px]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  flatViewFilter === "division"
                    ? "실 이름을 입력하세요"
                    : flatViewFilter === "team"
                      ? "팀 이름을 입력하세요"
                      : "이름을 입력하세요"
                }
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-[calc(100%-55px)] h-10 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSearch}
                className="w-[55px]"
              >
                검색
              </Button>
            </div>
            {/* 검색 결과 메시지 */}
            {activeSearchKeyword && searchResultCount !== null && (
              <div className="text-sm flex items-center justify-center">
                {searchResultCount > 0 ? (
                  <span className="text-gray-600">
                    검색 결과 총{" "}
                    <span className="font-semibold text-blue-600">
                      {searchResultCount}
                    </span>
                    건이 있습니다.
                  </span>
                ) : (
                  <span className="text-gray-500">
                    '{activeSearchKeyword}'에 대한 검색 결과가 없습니다.
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* [변경: 2026-01-20 11:10, 김병현 수정] 탭 콘텐츠 - 자식 요소 크기에 맞게 조절 */}
        {/* [변경: 2026-01-20 15:30, 김병현 수정] 지표 상세 정보 표시 시 min-h 설정하여 전체 스크롤 허용 */}
        {/* [변경: 2026-01-20 15:45, 김병현 수정] 테이블 max-h 지정하여 테이블 내부 스크롤 유지 */}
        <div
          className={`flex-1 flex flex-col ${isMetricDetailOpen ? "" : "min-h-0"}`}
        >
          {activeTab === "all" && (
            <>
              {/* 전체 탭 콘텐츠 */}
              <div
                className={`p-4 border-b border-gray-200 ${isMetricDetailOpen ? "min-h-[800px] max-h-[800px]" : "min-h-0"}`}
              >
                {viewType === "hierarchy" ? (
                  <OrganizationTable
                    month={yearMonth}
                    activeTab={activeTab}
                    onDetailClick={handleDetailClick}
                    aggregationType={aggregationType}
                    onMetricDetailChange={setIsMetricDetailOpen}
                  />
                ) : (
                  <OrganizationFlatTable
                    month={yearMonth}
                    activeTab={activeTab}
                    filterType={flatViewFilter}
                    onDetailClick={handleDetailClick}
                    searchKeyword={activeSearchKeyword}
                    onSearchResult={setSearchResultCount}
                    aggregationType={aggregationType}
                    onMetricDetailChange={setIsMetricDetailOpen}
                  />
                )}
              </div>

              {hasData && <ScoreLegend />}
            </>
          )}

          {activeTab === "bdpi" && (
            <>
              {/* BDPI 탭 콘텐츠 */}
              <div
                className={`p-4 border-b border-gray-200 ${isMetricDetailOpen ? "min-h-[800px] max-h-[800px]" : "min-h-0"}`}
              >
                {viewType === "hierarchy" ? (
                  <OrganizationBdpiTable
                    month={yearMonth}
                    activeTab={activeTab}
                  />
                ) : (
                  <OrganizationBdpiFlatTable
                    month={yearMonth}
                    activeTab={activeTab}
                    filterType={flatViewFilter}
                    searchKeyword={activeSearchKeyword}
                    onSearchResult={setSearchResultCount}
                  />
                )}
              </div>

              {hasData && <ScoreLegend />}
            </>
          )}
        </div>
      </Card>

      {/* 조직/멤버 상세 모달 */}
      <OrganizationDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        item={selectedDetailItem}
      />

      {/* 조직도 변경 히스토리 모달 */}
      <OrgChangeHistoryModal targetMonth={yearMonth} />
    </div>
  );
};

export default OrganizationPage;
