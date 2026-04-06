import { AlertCircle } from "lucide-react";
import { formatPeriodKey } from "@/utils/traceability";
import type { MetricInfo, TraceResult, TraceOverlayContext } from "@/types/traceability.types";

interface TraceHeaderProps {
  metricInfo: MetricInfo;
  query: TraceResult["query"];
  rawDailyMetric: TraceResult["rawDailyMetric"];
  metadata: TraceResult["metadata"];
  overlayContext: TraceOverlayContext;
}

export const TraceHeader = ({
  metricInfo,
  query,
  rawDailyMetric,
  metadata,
  overlayContext,
}: TraceHeaderProps) => {
  const entityName =
    overlayContext.memberName ??
    overlayContext.departmentName ??
    overlayContext.memberId ??
    overlayContext.departmentCode ??
    "-";

  const periodDisplay = formatPeriodKey(query.periodKey, query.period);

  return (
    <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-3">
      {/* Metric title row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{metricInfo.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{query.metricName}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Category badge */}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
            {metricInfo.category}
          </span>
          {/* Aggregation type badge */}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
            {metricInfo.aggregationType}
          </span>
        </div>
      </div>

      {/* Context row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
        <span>
          <span className="text-gray-500">기간: </span>
          {periodDisplay}
        </span>
        <span>
          <span className="text-gray-500">대상: </span>
          {entityName}
        </span>
        <span>
          <span className="text-gray-500">집계: </span>
          {query.aggregationLevel}
        </span>
      </div>

      {/* Data summary row */}
      {rawDailyMetric && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>
            {rawDailyMetric.dateStart} ~ {rawDailyMetric.dateEnd}
          </span>
          <span>문서 {rawDailyMetric.documentCount}건</span>
          <span>사용자 {rawDailyMetric.totalUsers}명</span>
        </div>
      )}

      {/* Shallow response warning */}
      {metadata.isShallowResponse && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>요약 데이터입니다. 각 부문의 상세 데이터를 순차적으로 불러오는 중입니다.</span>
        </div>
      )}
    </div>
  );
};
