import { useMemo } from "react";
import {
  formatMetricValue,
  formatCount,
  formatDateKey,
  enrichMergeRequests,
  getScoreColor,
} from "@/utils/traceability";
import { CollapsibleSection } from "../CollapsibleSection";
import { GenericDetail } from "../GenericDetail";
import type { MemberTraceNode, MetricInfo } from "@/types/traceability.types";

interface MemberNodeProps {
  node: MemberTraceNode;
  metricInfo: MetricInfo;
}

export const MemberNode = ({ node, metricInfo }: MemberNodeProps) => {
  const formatted = formatMetricValue(
    node.metric.value,
    node.metric.rawValue,
    metricInfo.displayUnit,
    metricInfo.rawUnit,
    metricInfo.timeUnitConversion,
  );

  const countStr = formatCount(node.metric.count, node.metric.countLabel);

  // Find the last day with metric-specific details for the GenericDetail panel.
  // 월별 집계 시 마지막 날짜의 details만 표시 (일별 상세는 rawDailyData 섹션에서 각각 확인 가능)
  const dayWithDetails = useMemo(() => {
    if (!node.rawDailyData) return undefined;
    for (let i = node.rawDailyData.length - 1; i >= 0; i--) {
      const day = node.rawDailyData[i];
      if (day.details && Object.keys(day.details).length > 0) {
        return day;
      }
    }
    return undefined;
  }, [node.rawDailyData]);

  // Enrich MRs if both daily details and MR summaries are available.
  // Memoized to avoid rebuilding the Map on every parent re-render.
  const enrichedMRs = useMemo(() => {
    if (!node.mergeRequests || node.mergeRequests.length === 0) return null;
    if (!node.rawDailyData) return null;

    const allDetailMRs: Array<Record<string, unknown>> = [];
    node.rawDailyData.forEach(day => {
      if (day.details && Array.isArray((day.details as Record<string, unknown>)["mergeRequests"])) {
        const mrs = (day.details as Record<string, unknown>)["mergeRequests"] as Array<Record<string, unknown>>;
        allDetailMRs.push(...mrs);
      }
    });

    if (allDetailMRs.length === 0) return null;
    return enrichMergeRequests(allDetailMRs, node.mergeRequests, node.memberEmployeeId);
  }, [node.rawDailyData, node.mergeRequests, node.memberEmployeeId]);

  return (
    <div className="ml-6 py-2 border-l-2 border-gray-100 pl-3">
      {/* Member summary */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-gray-800">{node.memberName}</span>
          <span className="ml-2 text-xs text-gray-500">{node.memberEmployeeId}</span>
        </div>
        <div className="flex items-center gap-3 text-xs flex-shrink-0">
          <span className="text-gray-700">{formatted.display}</span>
          <span className={`font-medium ${getScoreColor(node.metric.score)}`}>
            {node.metric.score}점
          </span>
          <span className="text-gray-500">{countStr}</span>
        </div>
      </div>

      {/* Daily data table */}
      {node.rawDailyData && node.rawDailyData.length > 0 && (
        <CollapsibleSection title={`일별 데이터 (${node.rawDailyData.length}일)`}>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-1 pr-2 text-left text-gray-500 font-medium">날짜</th>
                <th className="py-1 pr-2 text-right text-gray-500 font-medium">값</th>
                <th className="py-1 text-right text-gray-500 font-medium">건수</th>
              </tr>
            </thead>
            <tbody>
              {node.rawDailyData.map(day => (
                <tr key={day.date} className="border-b border-gray-50 last:border-0">
                  <td className="py-1 pr-2 text-gray-700">{formatDateKey(day.date, "iso")}</td>
                  <td className="py-1 pr-2 text-right text-gray-800">{day.value}</td>
                  <td className="py-1 text-right text-gray-500">{day.totalCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>
      )}

      {/* MR list */}
      {node.mergeRequests !== null && (
        <CollapsibleSection
          title={
            node.mergeRequests.length === 0
              ? "연관된 MR 없음"
              : `MR 목록 (${node.mergeRequests.length}건)`
          }
        >
          {node.mergeRequests.length === 0 ? (
            <p className="text-xs text-gray-400">연관된 MR이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {(enrichedMRs ?? node.mergeRequests).map(mr => (
                <div
                  key={`${mr.iid}-${mr.repositoryId}`}
                  className="bg-gray-50 rounded p-2 text-xs"
                >
                  <div className="font-medium text-gray-800 truncate">
                    !{mr.iid} {mr.title}
                  </div>
                  <div className="text-gray-500 mt-0.5">
                    <span>{mr.repositoryName}</span>
                    <span className="mx-1">·</span>
                    <span>
                      {mr.sourceBranch} → {mr.targetBranch}
                    </span>
                  </div>
                  {"isAuthor" in mr && (
                    <div className="text-gray-400 mt-0.5">
                      작성자: {mr.author}
                      {mr.reviewers.length > 0 && (
                        <span> · 리뷰어: {mr.reviewers.join(", ")}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Metric-specific details (memoized from the last day with non-empty details) */}
      {dayWithDetails && (
        <CollapsibleSection title="지표 상세">
          <GenericDetail details={dayWithDetails.details} />
        </CollapsibleSection>
      )}
    </div>
  );
};
