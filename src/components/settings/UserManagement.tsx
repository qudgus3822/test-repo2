import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useUserManagement } from "@/api/hooks/useUserManagement";
import { UserTable } from "./UserTable";

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
        <h2 className="text-lg font-semibold text-gray-900">사용자 목록</h2>
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
