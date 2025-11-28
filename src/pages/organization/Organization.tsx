import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DateFilter } from "@/components/ui/DateFilter";
import {
  OrganizationTabs,
  CompareGroupSelector,
  OrganizationTable,
  ScoreLegend,
} from "@/components/organization";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { mockOrganizationList } from "@/mocks/organization.mock";
import type { OrganizationUnit } from "@/types/organization.types";

// "실" 단위까지의 조직 ID 수집 (IT부문 + 실)
const getDepartmentOrgIds = (orgs: OrganizationUnit[]): string[] => {
  const ids: string[] = [];
  const collect = (org: OrganizationUnit, depth: number) => {
    ids.push(org.id);
    // depth 0: 부문, depth 1: 실 - 실까지만 수집
    if (depth < 1) {
      org.children?.forEach((child) => collect(child, depth + 1));
    }
  };
  orgs.forEach((org) => collect(org, 0));
  return ids;
};

const OrganizationPage = () => {
  const {
    period,
    setPeriod,
    currentDate,
    setCurrentDate,
    searchKeyword,
    setSearchKeyword,
    expandAllTeams,
    collapseToDefault,
    isTeamsExpanded,
  } = useOrganizationStore();

  const handleToggleTeams = () => {
    if (isTeamsExpanded) {
      // 접기: IT부문만 펼침
      collapseToDefault();
    } else {
      // 열기: 실 단위까지 펼침
      const deptOrgIds = getDepartmentOrgIds(mockOrganizationList);
      expandAllTeams(deptOrgIds);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 탭 메뉴 */}
      <Card className="overflow-hidden">
        <OrganizationTabs />

        {/* 첫 번째 줄: 기간 선택 + 통합검색 + 전체 팀 열기 */}
        <div className="h-[84px] flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-5">
            <DateFilter
              period={period}
              onPeriodChange={setPeriod}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
          </div>
          {/* 통합검색 + 전체 팀 열기 버튼 */}
          <div className="flex items-center gap-2">
            {/* 통합검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="통합검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10 pr-4 py-2 w-[200px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* 전체 팀 열기/접기 버튼 */}
            <Button variant="normal" size="sm" onClick={handleToggleTeams}>
              {isTeamsExpanded ? "전체 팀 접기" : "전체 팀 열기"}
            </Button>
          </div>
        </div>

        {/* 두 번째 줄: 비교 그룹 + 비교 입력 (추후 고도화 예정) */}
        <div className="h-[84px] relative flex items-center justify-between p-4 border-b border-gray-200 opacity-60 cursor-not-allowed select-none">
          <CompareGroupSelector />
          {/* 추후 개발 예정 안내 */}
          <span className="absolute left-1/2 -translate-x-1/2 text-sm text-gray-700 font-medium">
            추후 개발 예정
          </span>
          {/* 비교 입력 버튼 */}
          <Button variant="primary" size="sm" disabled>
            비교 입력
          </Button>
        </div>

        {/* 조직 테이블 */}
        <div className="p-4">
          <OrganizationTable organizations={mockOrganizationList} />
        </div>

        {/* 범례 */}
        <div className="border-t border-gray-200">
          <ScoreLegend />
        </div>
      </Card>
    </div>
  );
};

export default OrganizationPage;
