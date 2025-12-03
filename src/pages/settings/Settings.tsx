import { useState } from "react";
import { OrganizationManagement } from "@/components/settings/OrganizationManagement";
import { UserManagement } from "@/components/settings/UserManagement";

type SettingsTab = "organization" | "user";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "organization", label: "조직도 관리" },
  { id: "user", label: "사용자 관리" },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("organization");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 탭 네비게이션 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "organization" && <OrganizationManagement />}
      {activeTab === "user" && <UserManagement />}
    </div>
  );
};

export default SettingsPage;
