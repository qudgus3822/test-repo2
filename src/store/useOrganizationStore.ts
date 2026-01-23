import { create } from "zustand";
import type { PeriodType } from "@/components/ui/DateFilter";
import type {
  TabType,
  CompareGroup,
  OrganizationFilterType,
} from "@/types/organization.types";

// 점수 기준값 상수
export const SCORE_EXCELLENT_THRESHOLD = 80;
export const SCORE_GOOD_THRESHOLD = 70;

interface OrganizationStore {
  /**
   * 현재 활성화된 탭 (전체, BDPI)
   */
  activeTab: TabType;
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
  /**
   * 지표 칼럼 순서 (드래그앤드롭으로 변경된 순서, null이면 API 응답 순서 사용)
   */
  metricOrder: string[] | null;
  /**
   * 지표 칼럼 드래그앤드롭 발생 여부 (필터 변경 시 API 재호출 트리거용)
   */
  isMetricColumnDragged: boolean;
  /**
   * [변경: 2026-01-22 10:00, 김병현 수정] 지표 표시 모드 (value: 실제값, rate: 달성률)
   */
  displayMode: "value" | "rate";
  /**
   * 지표별 데이터 출처 (metricCode → sources 매핑)
   */
  metricSources: Record<string, string[]>;
}

interface OrganizationAction {
  /**
   * 활성 탭 설정
   */
  setActiveTab: (tab: TabType) => void;
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
   * 전체 팀 열기 (실까지 펼침, 팀은 접힌 상태로 표시, 실 직속 멤버 표시)
   */
  expandAllTeams: (orgIds: string[]) => void;
  /**
   * 멤버 표시 여부 설정
   */
  setShowMembers: (show: boolean) => void;
  /**
   * 기본 상태로 접기 (초기 화면 진입 시와 동일)
   */
  collapseToDefault: (orgIds: string[]) => void;
  /**
   * 지표 칼럼 순서 설정 (드래그앤드롭 시)
   */
  setMetricOrder: (order: string[]) => void;
  /**
   * 지표 칼럼 순서 초기화 (필터 변경 시 API 응답 순서 사용하도록)
   */
  clearMetricOrder: () => void;
  /**
   * 지표 칼럼 드래그앤드롭 발생 여부 설정
   */
  setIsMetricColumnDragged: (isDragged: boolean) => void;
  /**
   * [변경: 2026-01-22 10:00, 김병현 수정] 지표 표시 모드 설정 (value: 실제값, rate: 달성률)
   */
  setDisplayMode: (mode: "value" | "rate") => void;
  /**
   * 지표별 데이터 출처 설정
   */
  setMetricSources: (sources: Record<string, string[]>) => void;
}

const initialCompareGroups: CompareGroup[] = [
  { id: "a", label: "비교 A", color: "#3B82F6" },
  { id: "b", label: "비교 B", color: "#10B981" },
];

// 기본 펼침 조직 코드 (IT부문만 펼침 → 실 단위까지 보임)
const DEFAULT_EXPANDED_CODES = ["IT01"];

const initState: OrganizationStore = {
  activeTab: "all",
  period: "monthly",
  currentDate: new Date(),
  compareGroups: initialCompareGroups,
  filterType: "all",
  searchKeyword: "",
  expandedOrganizations: new Set(DEFAULT_EXPANDED_CODES), // 초기: IT부문만 펼침 (실 단위까지 보임)
  showMembers: true, // 기본: 멤버 표시
  isTeamsExpanded: false, // 초기: 팀 접힌 상태
  metricOrder: null, // 초기: API 응답 순서 사용
  isMetricColumnDragged: false, // 초기: 드래그 발생 안 함
  displayMode: "value", // [변경: 2026-01-22 15:00, 김병현 수정] 초기: 실제값 표시
  metricSources: {}, // 초기: 빈 객체
};

export const useOrganizationStore = create<
  OrganizationStore & OrganizationAction
>((set) => ({
  ...initState,
  setActiveTab: (tab: TabType) => set({ activeTab: tab }),
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
      showMembers: true,
      isTeamsExpanded: true,
    })),
  setShowMembers: (show: boolean) => set({ showMembers: show }),
  collapseToDefault: (orgIds: string[]) =>
    set(() => ({
      expandedOrganizations: new Set(orgIds),
      showMembers: true,
      isTeamsExpanded: false,
    })),
  setMetricOrder: (order: string[]) => set({ metricOrder: order }),
  clearMetricOrder: () => set({ metricOrder: null }),
  setIsMetricColumnDragged: (isDragged: boolean) =>
    set({ isMetricColumnDragged: isDragged }),
  // [변경: 2026-01-22 10:00, 김병현 수정] 지표 표시 모드 설정
  setDisplayMode: (mode: "value" | "rate") => set({ displayMode: mode }),
  setMetricSources: (sources: Record<string, string[]>) =>
    set({ metricSources: sources }),
}));
