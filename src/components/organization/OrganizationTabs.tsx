import { useShallow } from "zustand/react/shallow";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { Tabs } from "@/components/ui/Tabs";
import type { TabType } from "@/types/organization.types";

const tabs: { id: TabType; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "bdpi", label: "BDPI" },
];

export const OrganizationTabs = () => {
  // [변경: 2026-01-25 15:30, 김병현 수정] useShallow를 사용하여 store 상태 한번에 선언
  const { activeTab, setActiveTab, setDisplayMode } = useOrganizationStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
      setDisplayMode: state.setDisplayMode,
    })),
  );

  // [변경: 2026-01-22 00:00, 김병현 수정] 탭 선택 시 displayMode 변경 (전체: 달성률, BDPI: 실제값)
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "bdpi") {
      setDisplayMode("value");
    } else if (tab === "all") {
      setDisplayMode("rate");
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};
