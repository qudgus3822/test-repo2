import { AlertCircle, Info } from "lucide-react";
import { formatPeriodKey } from "@/utils/traceability";
import type {
  TraceResult,
  TraceOverlayContext,
} from "@/types/traceability.types";

const DIRECTION_HINT: Record<"FORWARD" | "REVERSE", string> = {
  FORWARD: "정방향 메트릭이므로, 높은 기여도는 긍정적인 의미입니다.",
  REVERSE: "역방향 메트릭이므로, 높은 기여도는 부정적인 의미입니다.",
};

interface TraceHeaderProps {
  query: TraceResult["query"];
  rawDailyMetric: TraceResult["rawDailyMetric"];
  metadata: TraceResult["metadata"];
  overlayContext: TraceOverlayContext;
  direction: "FORWARD" | "REVERSE";
}

export const TraceHeader = ({
  query,
  rawDailyMetric,
  metadata,
  overlayContext,
  direction,
}: TraceHeaderProps) => {
  const entityName =
    overlayContext.memberName ??
    overlayContext.departmentName ??
    overlayContext.memberId ??
    overlayContext.departmentCode ??
    "-";

  const periodDisplay = formatPeriodKey(query.periodKey, query.period);

  return (
    <div className="px-6 py-3 border-b border-gray-100 flex flex-col gap-1 shrink-0">
      {/* Single compact row: context pills */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
        <span className="text-xs text-gray-500">
          <span className="text-gray-400">기간: </span>
          {periodDisplay}
        </span>
        {rawDailyMetric && (
          <span className="text-xs text-gray-400">
            {rawDailyMetric.dateStart} ~ {rawDailyMetric.dateEnd}
          </span>
        )}
        <span className="text-xs text-gray-500">
          <span className="text-gray-400">대상: </span>
          {entityName}
        </span>
      </div>

      {/* Direction hint */}
      <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-1">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>{DIRECTION_HINT[direction]}</span>
      </div>

      {/* Shallow response warning */}
      {metadata.isShallowResponse && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            요약 데이터입니다. 각 부문의 상세 데이터를 순차적으로 불러오는
            중입니다.
          </span>
        </div>
      )}
    </div>
  );
};
