import { AlertCircle } from "lucide-react";
import { formatPeriodKey } from "@/utils/traceability";
import type {
  //MetricInfo,
  TraceResult,
  TraceOverlayContext,
} from "@/types/traceability.types";

interface TraceHeaderProps {
  //metricInfo: MetricInfo;
  query: TraceResult["query"];
  rawDailyMetric: TraceResult["rawDailyMetric"];
  metadata: TraceResult["metadata"];
  overlayContext: TraceOverlayContext;
}

export const TraceHeader = ({
  //metricInfo,
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
    <div className="px-6 py-3 border-b border-gray-100 flex flex-col gap-1 flex-shrink-0">
      {/* Single compact row: metric name + badges + context pills */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
        {/* <span className="text-sm font-semibold text-gray-900">
          {metricInfo.title}
        </span> */}
        {/* <span className="text-xs text-gray-400">{query.metricName}</span> */}
        {/* Category badge */}
        {/* <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
          {metricInfo.category}
        </span> */}
        {/* Aggregation type badge */}
        {/* <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
          {metricInfo.aggregationType}
        </span> */}
        <span className="text-xs text-gray-500">
          <span className="text-gray-400">기간: </span>
          {periodDisplay}
        </span>
        {rawDailyMetric && (
          <>
            <span className="text-xs text-gray-400">
              {rawDailyMetric.dateStart} ~ {rawDailyMetric.dateEnd}
            </span>
            {/* <span className="text-xs text-gray-400">문서 {rawDailyMetric.documentCount}건</span>
            <span className="text-xs text-gray-400">사용자 {rawDailyMetric.totalUsers}명</span> */}
          </>
        )}
        <span className="text-xs text-gray-500">
          <span className="text-gray-400">대상: </span>
          {entityName}
        </span>
        {/* <span className="text-xs text-gray-500">
          <span className="text-gray-400">집계: </span>
          {query.aggregationLevel}
        </span> */}
      </div>

      {/* Shallow response warning */}
      {metadata.isShallowResponse && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            요약 데이터입니다. 각 부문의 상세 데이터를 순차적으로 불러오는
            중입니다.
          </span>
        </div>
      )}
    </div>
  );
};
