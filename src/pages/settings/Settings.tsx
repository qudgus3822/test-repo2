import { useState } from "react";
import { OrganizationManagement } from "@/components/settings/OrganizationManagement";
import { UserManagement } from "@/components/settings/UserManagement";
import {
  SettingsTabs,
  type SettingsTab,
} from "@/components/settings/SettingsTabs";
import { Card } from "@/components/ui/Card";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("organization");

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden min-h-[700px]">
        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === "organization" && <OrganizationManagement />}
        {activeTab === "user" && <UserManagement />}
      </Card>
    </div>
  );
};

export default SettingsPage;
