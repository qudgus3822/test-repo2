type SettingsTab = "organization" | "user";

interface Tab {
  id: SettingsTab;
  label: string;
}

const tabs: Tab[] = [
  { id: "organization", label: "조직도 관리" },
  { id: "user", label: "사용자 관리" },
];

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export const SettingsTabs = ({ activeTab, onTabChange }: SettingsTabsProps) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
      <div className="flex space-x-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-4 px-1 font-medium border-b-2 -mb-[12px] transition-colors cursor-pointer ${
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

export type { SettingsTab };
