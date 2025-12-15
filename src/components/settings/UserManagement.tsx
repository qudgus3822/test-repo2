import { Card } from "@/components/ui/Card";
import { Users } from "lucide-react";

/**
 * 사용자 관리 탭 컴포넌트
 * TODO: 상세 기능 구현 예정
 */
export const UserManagement = () => {
  return (
    <Card className="min-h-[400px] flex items-center justify-center">
      <div className="text-center text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-600">사용자 관리</p>
        <p className="text-sm mt-2">추후 개발 예정입니다.</p>
      </div>
    </Card>
  );
};

export default UserManagement;
