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

  // [변경: 2026-01-19 00:30, 김병현 수정] 100vh 레이아웃 적용 - 탭 고정, 콘텐츠 영역 스크롤
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Card className="overflow-hidden flex-1 min-h-0 flex flex-col">
        {/* 탭 네비게이션 */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* 탭 콘텐츠 */}
        <div className="flex-1 min-h-0 overflow-auto">
          {activeTab === "organization" && <OrganizationManagement />}
          {activeTab === "user" && <UserManagement />}
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
