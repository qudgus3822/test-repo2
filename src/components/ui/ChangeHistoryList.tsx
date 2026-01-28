{/* [변경: 2026-01-28 14:05, 임도휘 수정] 변경자, 변경 조직, 변경 이력에 반응형 말줄임 + 툴팁 적용 */}
import { useMemo } from "react";
import { OrgTypeBadge } from "@/components/ui/OrgTypeBadge";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import { TruncateWithTooltip } from "@/components/ui/TruncateWithTooltip";
import { useOrgChangeHistory } from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDisplayDateTime } from "@/utils/date";
import { getChangeDetailWithSuffix } from "@/utils/organization";
import type { OrgHistoryItem } from "@/types/organization.types";

// 테스트 데이터 (글자수 초과 확인용)
const TEST_DATA: OrgHistoryItem[] = [
  {
    changeType: "ADD",
    changeDate: "2026-01-27 18:02:48",
    category: "POLICY",
    target: "2000",
    name: "모두플랫폼개발실",
    changeDetail: "개발유형추가",
    processedBy: "수동(moco.junhyuk)",
    isEvaluationTarget: true,
  },
  {
    changeType: "EXCLUDE",
    changeDate: "2026-01-27 16:53:15",
    category: "POLICY",
    target: "2100",
    name: "글로벌디지털혁신추진본부개발팀",
    changeDetail: "개발유형제외 - 조직개편으로 인한 유형 변경",
    processedBy: "수동(moco.administrator.junhyuk)",
    isEvaluationTarget: false,
  },
  {
    changeType: "CREATED",
    changeDate: "2026-01-09 13:26:00",
    category: "GROUP",
    target: "1000",
    name: "IT부문",
    changeDetail: "실 생성 : IT부문",
    processedBy: "자동(LDAP)",
    isEvaluationTarget: true,
  },
  {
    changeType: "CREATED",
    changeDate: "2026-01-09 13:26:00",
    category: "GROUP",
    target: "2000",
    name: "모두플랫폼개발실솔루션사업부",
    changeDetail: "실 생성 : 모두플랫폼개발실솔루션사업부 신규 조직 생성",
    processedBy: "수동(moco.dohyun.administrator)",
    isEvaluationTarget: true,
  },
  {
    changeType: "ADD",
    changeDate: "2026-01-06 16:19:19",
    category: "POLICY",
    target: "3100",
    name: "C플랫폼개발팀",
    changeDetail: "개발유형추가",
    processedBy: "수동(moco.dohyun)",
    isEvaluationTarget: true,
  },
];

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
  // 테스트 모드: USE_TEST_DATA를 true로 변경하면 TEST_DATA 사용
  const USE_TEST_DATA = true;
  const filteredData = useMemo<OrgHistoryItem[]>(() => {
    const sourceData = USE_TEST_DATA ? TEST_DATA : data?.changes;
    if (!sourceData) return [];
    return sourceData.filter(
      (item) => item.category === "GROUP" || item.category === "POLICY",
    );
  }, [data, USE_TEST_DATA]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-gray-500 text-sm">
        변경 이력이 없습니다.
      </div>
    );
  }

  return (
    <table className={`w-full text-sm text-gray-600 table-fixed ${className}`}>
      <tbody className="block overflow-y-auto" style={{ maxHeight }}>
        {filteredData.map((item, index) => (
          <tr key={`${item.changeDate}-${index}`} className="w-full table table-fixed">
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
              className={`py-1.5 ${
                item.processedBy && item.processedBy !== "자동(LDAP)"
                  ? "text-blue-600 font-medium"
                  : "text-gray-600"
              }`}
              style={{ width: colWidths.processedBy }}
            >
              <TruncateWithTooltip text={item.processedBy || "-"} />
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
            >
              <TruncateWithTooltip text={item.name || "-"} />
            </td>
            <td
              className="text-gray-700 py-1.5"
              style={{ width: colWidths.detail }}
            >
              <TruncateWithTooltip
                text={
                  getChangeDetailWithSuffix(
                    item.changeDetail,
                    item.category,
                    item.changeType,
                  ) || "-"
                }
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ChangeHistoryList;
