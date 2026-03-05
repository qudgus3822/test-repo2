import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useUserManagement } from "@/api/hooks/useUserManagement";
import { UserTable } from "./UserTable";
import { Info } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

const USER_MANAGEMENT_TOOLTIP = `현재는 단일 관리자 권한으로, 인사 정보 기준 총괄/실장/팀장 직책만 로그인 권한이 자동으로 주어집니다.\n이외 사용자 추가 요청이 필요한 경우 슬랙 #휴넷모두의코딩 채널로 연락주세요.`;

/**
 * 사용자 관리 탭 컴포넌트
 */
export const UserManagement = () => {
  const { data, isLoading, error } = useUserManagement({ page: 1 });

  const users = data?.data ?? [];

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-semibold text-gray-900">사용자 목록</h2>
          <Tooltip
            content={USER_MANAGEMENT_TOOLTIP}
            direction="bottom"
            maxWidth={380}
            noWrap
          >
            <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
          </Tooltip>
        </div>
        <p className="text-sm text-amber-500 mt-1">
          LDAP 프로토콜의 정보가 자동으로 반영됩니다.
        </p>
      </div>

      {/* 테이블 */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      ) : (
        <UserTable users={users} />
      )}
    </div>
  );
};

export default UserManagement;
