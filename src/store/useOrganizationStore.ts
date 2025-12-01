import { create } from "zustand";
import type { PeriodType } from "@/components/ui/DateFilter";
import type {
  OrganizationTabType,
  CompareGroup,
  OrganizationFilterType,
} from "@/types/organization.types";

// 점수 기준값 상수
export const SCORE_EXCELLENT_THRESHOLD = 80;
export const SCORE_GOOD_THRESHOLD = 70;

interface OrganizationStore {
  /**
   * 현재 활성화된 탭 (BDPI, 코드품질, 리뷰품질, 개발효율)
   */
  activeTab: OrganizationTabType;
  /**
   * 기간 유형 (월별/분기별/반기별)
   */
  period: PeriodType;
  /**
   * 현재 선택된 날짜
   */
  currentDate: Date;
  /**
   * 비교 그룹 목록
   */
  compareGroups: CompareGroup[];
  /**
   * 달성률 필터
   */
  filterType: OrganizationFilterType;
  /**
   * 검색어
   */
  searchKeyword: string;
  /**
   * 펼침/접힘 상태를 관리하는 조직 ID Set
   */
  expandedOrganizations: Set<string>;
  /**
   * 멤버(개인) 표시 여부
   */
  showMembers: boolean;
  /**
   * 전체 팀 펼침 상태 (버튼 텍스트 토글용)
   */
  isTeamsExpanded: boolean;
}

interface OrganizationAction {
  /**
   * 활성 탭 설정
   */
  setActiveTab: (tab: OrganizationTabType) => void;
  /**
   * 기간 유형 설정
   */
  setPeriod: (period: PeriodType) => void;
  /**
   * 현재 날짜 설정
   */
  setCurrentDate: (date: Date) => void;
  /**
   * 비교 그룹 추가
   */
  addCompareGroup: (group: CompareGroup) => void;
  /**
   * 비교 그룹 제거
   */
  removeCompareGroup: (groupId: string) => void;
  /**
   * 필터 타입 설정
   */
  setFilterType: (filter: OrganizationFilterType) => void;
  /**
   * 검색어 설정
   */
  setSearchKeyword: (keyword: string) => void;
  /**
   * 조직 펼침/접힘 토글
   */
  toggleOrganization: (orgId: string) => void;
  /**
   * 모든 조직 펼침
   */
  expandAll: (orgIds: string[]) => void;
  /**
   * 모든 조직 접힘
   */
  collapseAll: () => void;
  /**
   * 전체 팀 열기 (팀까지만 펼침, 멤버 숨김)
   */
  expandAllTeams: (orgIds: string[]) => void;
  /**
   * 멤버 표시 여부 설정
   */
  setShowMembers: (show: boolean) => void;
  /**
   * 기본 상태로 접기 (IT부문만 펼침)
   */
  collapseToDefault: () => void;
}

const initialCompareGroups: CompareGroup[] = [
  { id: "a", label: "비교 A", color: "#3B82F6" },
  { id: "b", label: "비교 B", color: "#10B981" },
];

// 기본 펼침 조직 코드 (IT부문만 펼침 → 실 단위까지 보임)
const DEFAULT_EXPANDED_CODES = ["IT01"];

const initState: OrganizationStore = {
  activeTab: "bdpi",
  period: "monthly",
  currentDate: new Date(),
  compareGroups: initialCompareGroups,
  filterType: "all",
  searchKeyword: "",
  expandedOrganizations: new Set(DEFAULT_EXPANDED_CODES), // 초기: IT부문만 펼침 (실 단위까지 보임)
  showMembers: true, // 기본: 멤버 표시
  isTeamsExpanded: false, // 초기: 팀 접힌 상태
};

export const useOrganizationStore = create<
  OrganizationStore & OrganizationAction
>((set) => ({
  ...initState,
  setActiveTab: (tab: OrganizationTabType) => set({ activeTab: tab }),
  setPeriod: (period: PeriodType) => set({ period }),
  setCurrentDate: (date: Date) => set({ currentDate: date }),
  addCompareGroup: (group: CompareGroup) =>
    set((state) => ({
      compareGroups: [...state.compareGroups, group],
    })),
  removeCompareGroup: (groupId: string) =>
    set((state) => ({
      compareGroups: state.compareGroups.filter((g) => g.id !== groupId),
    })),
  setFilterType: (filter: OrganizationFilterType) => set({ filterType: filter }),
  setSearchKeyword: (keyword: string) => set({ searchKeyword: keyword }),
  toggleOrganization: (orgId: string) =>
    set((state) => {
      const newExpanded = new Set(state.expandedOrganizations);
      if (newExpanded.has(orgId)) {
        newExpanded.delete(orgId);
        return { expandedOrganizations: newExpanded };
      } else {
        newExpanded.add(orgId);
        // 펼칠 때 멤버도 표시되도록 설정
        return { expandedOrganizations: newExpanded, showMembers: true };
      }
    }),
  expandAll: (orgIds: string[]) =>
    set(() => ({
      expandedOrganizations: new Set(orgIds),
    })),
  collapseAll: () =>
    set(() => ({
      expandedOrganizations: new Set(),
    })),
  expandAllTeams: (orgIds: string[]) =>
    set(() => ({
      expandedOrganizations: new Set(orgIds),
      showMembers: false,
      isTeamsExpanded: true,
    })),
  setShowMembers: (show: boolean) => set({ showMembers: show }),
  collapseToDefault: () =>
    set(() => ({
      expandedOrganizations: new Set(DEFAULT_EXPANDED_CODES),
      showMembers: true,
      isTeamsExpanded: false,
    })),
}));
