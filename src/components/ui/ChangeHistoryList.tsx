import { useMemo } from "react";
import { OrgTypeBadge } from "@/components/ui/OrgTypeBadge";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import { useOrgChangeHistory } from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDisplayDateTime } from "@/utils/date";
import { getChangeDetailWithSuffix } from "@/utils/organization";
import type { OrgHistoryItem } from "@/types/organization.types";

export interface ChangeHistoryColWidths {
  bullet: string;
  date: string;
  divider: string;
  processedBy: string;
  changeType: string;
  orgType: string;
  name: string;
  detail: string;
}

interface ChangeHistoryListProps {
  yearMonth: string;
  colWidths?: Partial<ChangeHistoryColWidths>;
  maxHeight?: string;
  className?: string;
}

// 기본 칼럼 너비
const defaultColWidths: ChangeHistoryColWidths = {
  bullet: "3%",
  date: "15%",
  divider: "2%",
  processedBy: "19%",
  changeType: "9%",
  orgType: "9%",
  name: "14%",
  detail: "27%",
};

export const ChangeHistoryList = ({
  yearMonth,
  colWidths: customColWidths,
  maxHeight = "calc(100% - 1px)",
  className = "",
}: ChangeHistoryListProps) => {
  const { data, isLoading } = useOrgChangeHistory(yearMonth);

  // 칼럼 너비 병합
  const colWidths = useMemo(
    () => ({ ...defaultColWidths, ...customColWidths }),
    [customColWidths],
  );

  // GROUP, POLICY 카테고리만 필터링
  const filteredData = useMemo<OrgHistoryItem[]>(() => {
    if (!data?.changes) return [];
    return data.changes.filter(
      (item) => item.category === "GROUP" || item.category === "POLICY",
    );
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center text-gray-500 text-sm">
        변경 이력이 없습니다.
      </div>
    );
  }

  return (
    <table className={`w-full text-sm text-gray-600 table-fixed ${className}`}>
      <tbody className="block overflow-y-auto" style={{ maxHeight }}>
        {filteredData.map((item, index) => (
          <tr key={`${item.changeDate}-${index}`} className="w-full table">
            <td
              className="text-gray-400 text-center py-1.5"
              style={{ width: colWidths.bullet }}
            >
              •
            </td>
            <td className="py-1.5" style={{ width: colWidths.date }}>
              {formatDisplayDateTime(item.changeDate)}
            </td>
            <td
              className="text-gray-400 text-center py-1.5"
              style={{ width: colWidths.divider }}
            >
              |
            </td>
            <td
              className={`truncate py-1.5 ${
                item.processedBy && item.processedBy !== "자동(LDAP)"
                  ? "text-blue-600 font-medium"
                  : "text-gray-600"
              }`}
              style={{ width: colWidths.processedBy }}
              title={item.processedBy}
            >
              {item.processedBy || "-"}
            </td>
            <td
              className="text-center py-1.5"
              style={{ width: colWidths.changeType }}
            >
              <ChangeTypeBadge type={item.changeType} fixedWidth />
            </td>
            <td
              className="text-center py-1.5"
              style={{ width: colWidths.orgType }}
            >
              <OrgTypeBadge
                isEvaluationTarget={item.isEvaluationTarget}
                fixedWidth
              />
            </td>
            <td
              className="text-gray-700 py-1.5"
              style={{ width: colWidths.name }}
              title={item.name || "-"}
            >
              {item.name || "-"}
            </td>
            <td
              className="text-gray-700 truncate py-1.5"
              style={{ width: colWidths.detail }}
              title={getChangeDetailWithSuffix(
                item.changeDetail,
                item.category,
                item.changeType,
              )}
            >
              {getChangeDetailWithSuffix(
                item.changeDetail,
                item.category,
                item.changeType,
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ChangeHistoryList;
