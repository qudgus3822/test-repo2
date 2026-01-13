import { useOrganizationStore } from "@/store/useOrganizationStore";
import { Tabs } from "@/components/ui/Tabs";
import type { TabType } from "@/types/organization.types";

const tabs: { id: TabType; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "bdpi", label: "BDPI" },
];

export const OrganizationTabs = () => {
  const { activeTab, setActiveTab } = useOrganizationStore();

  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
