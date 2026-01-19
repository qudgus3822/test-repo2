import { useState, useEffect } from "react";
import { OrganizationManagement } from "@/components/settings/OrganizationManagement";
import { UserManagement } from "@/components/settings/UserManagement";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";

type SettingsTab = "organization" | "user";

const tabs: { id: SettingsTab; label: string }[] = [
  { id: "organization", label: "조직도 관리" },
  { id: "user", label: "사용자 관리" },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("organization");

  // 페이지 진입 시 초기화: 조직도 관리 탭으로 설정
  useEffect(() => {
    setActiveTab("organization");
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden min-h-[700px]">
        {/* 탭 네비게이션 */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === "organization" && <OrganizationManagement />}
        {activeTab === "user" && <UserManagement />}
      </Card>
    </div>
  );
};

export default SettingsPage;
