import { Info, Loader2 } from "lucide-react";
import { formatPeriodKey } from "@/utils/traceability.js";
import type {
  TraceResult,
  TraceOverlayContext,
} from "@/types/traceability.types.js";

const ALERT_VARIANTS = {
  info: "flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700",
};

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
  /** Derived by TraceOverlay: true while company-level sequential loader is still pending/loading. */
  isShallowLoading?: boolean;
}

export const TraceHeader = ({
  query,
  rawDailyMetric,
  overlayContext,
  direction,
  isShallowLoading = false,
}: TraceHeaderProps) => {
  const entityName =
    overlayContext.memberName ??
    overlayContext.departmentName ??
    overlayContext.employeeId ??
    overlayContext.departmentCode ??
    "-";

  const periodDisplay = formatPeriodKey(query.periodKey, query.period);

  return (
    <div className="flex flex-col gap-1 shrink-0 px-6 py-3 border-b border-gray-100">
      {/* Single compact row: context pills + optional shallow-loading chip */}
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
        {isShallowLoading && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-700">
            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
            요약 데이터 · 상세 로드 중
          </span>
        )}
      </div>

      {/* Direction hint */}
      <div className={ALERT_VARIANTS.info}>
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>{DIRECTION_HINT[direction]}</span>
      </div>
    </div>
  );
};
