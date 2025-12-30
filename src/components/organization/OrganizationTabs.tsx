import { useOrganizationStore } from "@/store/useOrganizationStore";
import type { TabType } from "@/types/organization.types";

interface Tab {
  id: TabType;
  label: string;
}

const tabs: Tab[] = [
  { id: "all", label: "전체" },
  { id: "bdpi", label: "BDPI" },
];

export const OrganizationTabs = () => {
  const { activeTab, setActiveTab } = useOrganizationStore();

  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
      <div className="flex space-x-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-1 text-sm font-medium border-b-2 -mb-[12px] transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
