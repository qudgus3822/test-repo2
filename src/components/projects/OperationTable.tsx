import { ExternalLink, Info } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import type { OperationItem } from "@/types/project.types";
import { formatDateString } from "@/utils/date";

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

  // [변경: 2026-01-19 00:00, 김병현 수정] thead 고정, tbody만 스크롤되도록 변경
  return (
    <div className="overflow-auto h-full">
      <table className="w-full">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-700">
            <th className="px-4 py-3 min-w-[200px] whitespace-nowrap">운영 에픽명</th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1.5">
                <span>활성<br />티켓 수</span>
                <Tooltip content="해당 월에 활성화 된 티켓 개수" direction="bottom">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1.5">
                <span>업데이트<br />수</span>
                <Tooltip content="해당 월에 업데이트 된 개수이며, 생성과 완료는 집계 제외" direction="bottom">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1.5">
                <span>완료<br />티켓수</span>
                <Tooltip content="해당 월에 완료된 티켓 개수" direction="bottom">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1.5">
                <span>생성<br />티켓수</span>
                <Tooltip content="해당 월에 신규로 생성된 티켓 개수" direction="bottom">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">생성일자</th>
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
                <span className="inline-block pr-5">{item.activeTicketCount}</span>
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                <span className="inline-block pr-5">{item.updatedCount}</span>
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                <span className="inline-block pr-5">{item.completedCount}</span>
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                <span className="inline-block pr-5">{item.createdCount}</span>
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {formatDateString(item.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
