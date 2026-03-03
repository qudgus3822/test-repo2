import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { OrganizationManagement } from "@/components/settings/OrganizationManagement";
import { UserManagement } from "@/components/settings/UserManagement";
import { Tabs } from "@/components/ui/Tabs";
import { Tooltip } from "@/components/ui/Tooltip";
import { Card } from "@/components/ui/Card";

type SettingsTab = "organization" | "user";

const tabs: { id: SettingsTab; label: string }[] = [
  { id: "organization", label: "조직도 관리" },
  { id: "user", label: "사용자 관리" },
];

const USER_MANAGEMENT_TOOLTIP = `현재는 단일 관리자 권한으로, 인사 정보 기준 총괄/실장/팀장 직책만 로그인 권한이 자동으로 주어집니다.\n이외 사용자 추가 요청이 필요한 경우 슬랙 #휴넷모두의코딩 채널로 연락주세요.`;

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
          <div className="flex items-center gap-2">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            {activeTab === "user" && (
              <Tooltip
                content={USER_MANAGEMENT_TOOLTIP}
                direction="bottom"
                maxWidth={380}
                wrapperClassName="inline-flex items-center pb-4 -mb-3"
              >
                <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </Tooltip>
            )}
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === "organization" && <OrganizationManagement />}
        {activeTab === "user" && <UserManagement />}
      </Card>
    </div>
  );
};

export default SettingsPage;
