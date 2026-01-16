import { ExternalLink, Info } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import type { OperationItem } from "@/types/project.types";

// 테이블 헤더 정보 아이콘 컴포넌트
const HeaderWithInfo = ({
  label,
  tooltip,
}: {
  label: React.ReactNode;
  tooltip: string;
}) => (
  <div className="flex items-center justify-center gap-1.5">
    <span>{label}</span>
    <Tooltip content={tooltip} direction="bottom">
      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
    </Tooltip>
  </div>
);

interface OperationTableProps {
  items: OperationItem[];
}

/**
 * 운영 에픽 테이블 컴포넌트
 */
export const OperationTable = ({ items }: OperationTableProps) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">수집된 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-700">
            <th className="px-4 py-3 min-w-[200px]">운영 에픽명</th>
            <th className="px-4 py-3 text-center">
              <HeaderWithInfo
                label={
                  <>
                    활성
                    <br />
                    티켓 수
                  </>
                }
                tooltip="현재 진행 중인 티켓 수"
              />
            </th>
            <th className="px-4 py-3 text-center">
              <HeaderWithInfo
                label={
                  <>
                    업데이트
                    <br />수
                  </>
                }
                tooltip="해당 기간 동안 업데이트된 티켓 수"
              />
            </th>
            <th className="px-4 py-3 text-center">
              <HeaderWithInfo
                label={
                  <>
                    완료
                    <br />
                    티켓수
                  </>
                }
                tooltip="해당 기간 동안 완료된 티켓 수"
              />
            </th>
            <th className="px-4 py-3 text-center">
              <HeaderWithInfo
                label={
                  <>
                    생성
                    <br />
                    티켓수
                  </>
                }
                tooltip="해당 기간 동안 생성된 티켓 수"
              />
            </th>
            <th className="px-4 py-3 text-center">생성일자</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {item.name}
                </div>
                <a
                  href={item.epicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1"
                >
                  {item.epicId}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {item.activeTicketCount}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {item.updatedCount}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {item.completedCount}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {item.createdCount}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {item.createdAt}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
