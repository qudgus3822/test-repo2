import type { UserItem } from "@/api/users";
import { getMemberRoleOrPositionLabel } from "@/utils/organization";

// 날짜 포맷 함수
const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

interface UserTableProps {
  users: UserItem[];
}

/**
 * 사용자 테이블 컴포넌트
 */
export const UserTable = ({ users }: UserTableProps) => (
  <div className="flex border border-gray-200 rounded-lg overflow-hidden">
    <table className="w-full">
      <colgroup>
        <col className="w-[18%]" />
        <col className="w-[18%]" />
        <col className="w-[24%]" />
        <col className="w-[12%]" />
        <col className="w-[12%]" />
        <col className="w-[16%]" />
      </colgroup>
      <thead>
        <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-700 bg-gray-50">
          <th className="px-4 py-3">사용자ID</th>
          <th className="px-4 py-3">사용자명</th>
          <th className="px-4 py-3">소속조직</th>
          <th className="px-4 py-3">직책/직급</th>
          <th className="px-4 py-3 text-center">권한</th>
          <th className="px-4 py-3 text-center">등록일</th>
        </tr>
      </thead>
      <tbody>
        {users.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
              등록된 사용자가 없습니다.
            </td>
          </tr>
        ) : (
          users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 align-middle whitespace-nowrap text-sm text-gray-900"
            >
              <td className="px-4 py-3">{user.employeeID}</td>
              <td className="px-4 py-3">{user.name}</td>
              <td className="px-4 py-3">{user.departmentName}</td>
              <td className="px-4 py-3">
                {user.departmentName === "모두의코딩" ? "-" : getMemberRoleOrPositionLabel(user.title, user.personalTitle)}
              </td>
              <td className="px-4 py-3 text-center">{user.role}</td>
              <td className="px-4 py-3 text-center">
                {user.registeredAt ? formatDate(user.registeredAt) : "-"}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
