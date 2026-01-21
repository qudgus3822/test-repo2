import { ExternalLink, Info } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import type { OperationItem } from "@/types/project.types";
import { formatDateString } from "@/utils/date";

// 단위 상수
const UNIT_COUNT = "개";
const NULL_DISPLAY = "--";

// 숫자 포맷 헬퍼 (null → "--", 0 이상 → 숫자 + 단위)
const formatCount = (value: number | null | undefined, unit: string): string => {
  if (value === null || value === undefined) return NULL_DISPLAY;
  return `${value}${unit}`;
};

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
          <tr className="border-t border-b border-gray-200 text-left text-sm font-medium text-gray-700">
            <th className="px-4 py-3 min-w-[200px] whitespace-nowrap">운영 에픽명</th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip content="해당 월에 활성화 된 티켓 개수" direction="top">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span>활성<br />티켓 수</span>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip content="해당 월에 업데이트 된 개수이며, 생성과 완료는 집계 제외" direction="top">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span>업데이트<br />수</span>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip content="해당 월에 완료된 티켓 개수" direction="top">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span>완료<br />티켓수</span>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip content="해당 월에 신규로 생성된 티켓 개수" direction="top">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span>생성<br />티켓수</span>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip content="해당 에픽 생성일" direction="top">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="leading-[2.5]">생성일자</span>
              </div>
            </th>
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
                {formatCount(item.activeTicketCount, UNIT_COUNT)}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {formatCount(item.updatedCount, UNIT_COUNT)}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {formatCount(item.completedCount, UNIT_COUNT)}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {formatCount(item.createdCount, UNIT_COUNT)}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {item.createdAt ? formatDateString(item.createdAt) : NULL_DISPLAY}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
