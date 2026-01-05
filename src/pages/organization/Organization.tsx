import { useEffect, useMemo, useState } from "react";
import { Search, Cable, Network, List, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DateFilter } from "@/components/ui/DateFilter";
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
import { useOrganizationTree } from "@/api/hooks/useOrganizationTree";
import type { OrganizationDepartment } from "@/types/organization.types";
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
  const {
    activeTab,
    setActiveTab,
    period,
    setPeriod,
    currentDate,
    setCurrentDate,
    searchKeyword,
    setSearchKeyword,
    expandAllTeams,
    expandAll,
    collapseToDefault,
    isTeamsExpanded,
  } = useOrganizationStore();

  const { setOrgHistoryModal } = useDashboardStore();

  // 페이지 진입 시 초기화: 당월, 전체 탭으로 설정
  useEffect(() => {
    setPeriod("monthly");
    setCurrentDate(new Date());
    setActiveTab("all");
  }, [setPeriod, setCurrentDate, setActiveTab]);

  // 상세 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] =
    useState<OrganizationDetailItem | null>(null);

  // 추후 개발 예정 기능 표시 여부
  const [isFunctionEnabled] = useState(false);

  // 서브탭 상태: 하이어라키뷰 / 플랫뷰
  const [viewType, setViewType] = useState<"hierarchy" | "flat">("hierarchy");

  // 플랫뷰 필터: 실 / 팀 / 개인
  const [flatViewFilter, setFlatViewFilter] =
    useState<FlatViewFilterType>("room");

  // 보기/펼치기 상태
  const [isExpanded, setIsExpanded] = useState(false);

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

  // 전체 팀 열기/접기를 위해 조직 데이터 조회 (캐시된 데이터 사용)
  const { data, isLoading, isError } = useOrganizationTree(
    yearMonth,
    activeTab,
  );
  const organizations = useMemo(() => data?.tree ?? [], [data?.tree]);

  // 데이터가 있는지 확인 (isEvaluationTarget: true인 조직이 있는지)
  const hasData =
    !isLoading &&
    !isError &&
    organizations.filter((org) => org.isEvaluationTarget).length > 0;

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

  return (
    <div className="flex flex-col gap-6">
      {/* 탭 메뉴 */}
      <Card className="overflow-hidden">
        <OrganizationTabs />

        {/* 첫 번째 줄: 기간 선택 */}
        <div className="h-[84px] relative flex items-center p-4 border-b border-gray-200">
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
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          {/* 좌측: 뷰타입 탭 + 플랫뷰 필터 */}
          <div className="flex items-center">
            <button
              onClick={() => setViewType("hierarchy")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                viewType === "hierarchy"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Network className="w-4 h-4" />
              하이어라키뷰
            </button>
            <button
              onClick={() => setViewType("flat")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                viewType === "flat"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <List className="w-4 h-4" />
              플랫뷰
            </button>

            {/* 플랫뷰일 때만 실/팀/개인 필터 표시 */}
            {viewType === "flat" && (
              <div className="flex items-center ml-4">
                <button
                  onClick={() => setFlatViewFilter("room")}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                    flatViewFilter === "room"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  실
                </button>
                <button
                  onClick={() => setFlatViewFilter("team")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    flatViewFilter === "team"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  팀
                </button>
                <button
                  onClick={() => setFlatViewFilter("member")}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                    flatViewFilter === "member"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  개인
                </button>
              </div>
            )}
          </div>

          {/* 우측: 뷰타입별 영역 + 보기/숨기기 버튼 */}
          <div className="flex items-center gap-2">
            {/* 플랫뷰: 통합검색 */}
            {viewType === "flat" && (
              <div
                className={`relative ${!isFunctionEnabled ? "opacity-40" : ""}`}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="추후 개발 예정"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  disabled={!isFunctionEnabled}
                  className="pl-10 pr-4 py-2 w-[200px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:placeholder-gray-700"
                />
              </div>
            )}
            {/* 하이어라키뷰: 전체 팀 열기/접기 버튼 */}
            {viewType === "hierarchy" && (
              <Button variant="normal" size="sm" onClick={handleToggleTeams}>
                {isTeamsExpanded ? "전체 팀 접기" : "전체 팀 열기"}
              </Button>
            )}
            {/* 보기/숨기기 버튼 */}
            <Button
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
            </Button>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === "all" && (
          <>
            {/* 전체 탭 콘텐츠 */}
            <div className="p-4 border-b border-gray-200">
              {viewType === "hierarchy" ? (
                <OrganizationTable
                  month={yearMonth}
                  activeTab={activeTab}
                  hideValues={isExpanded}
                  onDetailClick={handleDetailClick}
                />
              ) : (
                <OrganizationFlatTable
                  month={yearMonth}
                  activeTab={activeTab}
                  filterType={flatViewFilter}
                  hideValues={isExpanded}
                  onDetailClick={handleDetailClick}
                />
              )}
            </div>

            {hasData && <ScoreLegend />}
          </>
        )}

        {activeTab === "bdpi" && (
          <>
            {/* BDPI 탭 콘텐츠 */}
            <div className="p-4 border-b border-gray-200">
              {viewType === "hierarchy" ? (
                <OrganizationBdpiTable
                  month={yearMonth}
                  activeTab={activeTab}
                  onDetailClick={handleDetailClick}
                />
              ) : (
                <OrganizationBdpiFlatTable
                  month={yearMonth}
                  activeTab={activeTab}
                  filterType={flatViewFilter}
                  onDetailClick={handleDetailClick}
                />
              )}
            </div>

            {hasData && <ScoreLegend />}
          </>
        )}
      </Card>

      {/* 조직/멤버 상세 모달 */}
      <OrganizationDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        item={selectedDetailItem}
      />

      {/* 조직도 변경 히스토리 모달 */}
      <OrgChangeHistoryModal />
    </div>
  );
};

export default OrganizationPage;
