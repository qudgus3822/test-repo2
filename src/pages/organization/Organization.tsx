import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DateFilter } from "@/components/ui/DateFilter";
import {
  OrganizationTabs,
  CompareGroupSelector,
  OrganizationTable,
  ScoreLegend,
  OrganizationDetailModal,
} from "@/components/organization";
import type { OrganizationDetailItem } from "@/components/organization";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useOrganizationTree } from "@/api/hooks/useOrganizationTree";
import type { OrganizationDepartment } from "@/types/organization.types";

// Level 1(부문) 조직 코드만 수집
// 초기 화면 진입 시 사용 → 실 단위까지 보임
const getLevel1DepartmentCodes = (orgs: OrganizationDepartment[]): string[] => {
  return orgs.filter((org) => org.level === 1).map((org) => org.code);
};

// Level 3(팀)까지의 조직 코드 수집 (부문 + 실 + 팀)
// 전체 팀 열기 클릭 시 사용 → 팀 멤버까지 보임
const getDepartmentCodes = (orgs: OrganizationDepartment[]): string[] => {
  const codes: string[] = [];
  const collect = (org: OrganizationDepartment) => {
    codes.push(org.code);
    // Level 1(부문), Level 2(실), Level 3(팀)까지 수집
    if (org.level <= 3 && org.children) {
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

  // 상세 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] =
    useState<OrganizationDetailItem | null>(null);

  // 추후 개발 예정 기능 표시 여부
  const [isFunctionEnabled] = useState(false);

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
  const yearMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  // 전체 팀 열기/접기를 위해 조직 데이터 조회 (캐시된 데이터 사용)
  const { data, isLoading, isError } = useOrganizationTree(
    yearMonth,
    activeTab,
  );
  const organizations = data?.tree ?? [];

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
      // 접기: IT부문만 펼침 → 실 단위까지 보임
      collapseToDefault();
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

        {/* 첫 번째 줄: 기간 선택 + 통합검색 + 전체 팀 열기 */}
        <div className="h-[84px] relative flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-5">
            <DateFilter
              period={period}
              onPeriodChange={setPeriod}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
          </div>
          {/* 통합검색 (추후 개발 예정) + 전체 팀 열기 버튼 */}
          <div className="flex items-center gap-2">
            {/* 통합검색 */}
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
            {/* 전체 팀 열기/접기 버튼 */}
            <Button variant="normal" size="sm" onClick={handleToggleTeams}>
              {isTeamsExpanded ? "전체 팀 접기" : "전체 팀 열기"}
            </Button>
          </div>
        </div>

        {/* 두 번째 줄: 비교 그룹 + 비교 입력 (추후 개발 예정) */}
        <div
          className={`h-[84px] relative flex items-center justify-between p-4 border-b border-gray-200 ${
            !isFunctionEnabled ? "cursor-not-allowed select-none" : ""
          }`}
        >
          <CompareGroupSelector />
          {/* 추후 개발 예정 안내 */}
          {!isFunctionEnabled && (
            <span className="absolute left-1/2 -translate-x-1/2 text-sm text-gray-400 font-medium">
              추후 개발 예정
            </span>
          )}
          {/* 비교 입력 버튼 */}
          <Button variant="primary" size="sm" disabled={!isFunctionEnabled}>
            비교 입력
          </Button>
        </div>

        {/* 조직 테이블 + 범례 (데이터가 있을 때만 범례 표시) */}
        <div className="p-4 border-b border-gray-200">
          <OrganizationTable
            month={yearMonth}
            activeTab={activeTab}
            onDetailClick={handleDetailClick}
          />
        </div>

        {hasData && <ScoreLegend />}
      </Card>

      {/* 조직/멤버 상세 모달 */}
      <OrganizationDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        item={selectedDetailItem}
      />
    </div>
  );
};

export default OrganizationPage;
