import { useState } from "react";
import { Check, Loader2, AlertCircle, ChevronRight, ChevronDown, Minus } from "lucide-react";
import { useSequentialDivisionLoader } from "@/api/hooks/useTraceability";
import { formatMetricValue, formatCount, getAggregationMethodLabel, getScoreColor } from "@/utils/traceability";
import { DivisionNode } from "./DivisionNode";
import type { CompanyTraceNode, MetricInfo, TraceResult } from "@/types/traceability.types";

interface CompanyNodeProps {
  node: CompanyTraceNode;
  metricInfo: MetricInfo;
  query: TraceResult["query"];
}

export const CompanyNode = ({ node, metricInfo, query }: CompanyNodeProps) => {
  const { divisionStates, retryDivision } = useSequentialDivisionLoader(
    node.children,
    query.metricName,
    query.periodKey,
    true,
  );

  // Track which divisions are collapsed (default: expanded when loaded)
  const [collapsedDivisions, setCollapsedDivisions] = useState<Set<string>>(new Set());

  const toggleDivision = (deptCode: string) => {
    setCollapsedDivisions(prev => {
      const next = new Set(prev);
      if (next.has(deptCode)) {
        next.delete(deptCode);
      } else {
        next.add(deptCode);
      }
      return next;
    });
  };

  const companyFormatted = formatMetricValue(
    node.metric.value,
    node.metric.rawValue,
    metricInfo.displayUnit,
    metricInfo.rawUnit,
    metricInfo.timeUnitConversion,
  );
  const companyCountStr = formatCount(node.metric.count, node.metric.countLabel);
  const aggregationLabel = getAggregationMethodLabel(node.aggregationMethod);

  return (
    <div>
      {/* Company summary */}
      <div className="flex items-start justify-between gap-2 py-2 px-3 bg-gray-100 rounded-lg">
        <div>
          <span className="text-sm font-bold text-gray-900">전사</span>
          <span className="ml-2 text-xs text-gray-500">{aggregationLabel}</span>
        </div>
        <div className="flex items-center gap-3 text-xs flex-shrink-0">
          <span className="text-gray-700">{companyFormatted.display}</span>
          <span className={`font-medium ${getScoreColor(node.metric.score)}`}>
            {node.metric.score}점
          </span>
          <span className="text-gray-500">{companyCountStr}</span>
        </div>
      </div>

      {/* Division list */}
      <div className="mt-3 flex flex-col gap-3">
        {node.children.map(division => {
          const status = divisionStates.get(division.departmentCode);
          const state = status?.state ?? "pending";
          const isCollapsed = collapsedDivisions.has(division.departmentCode);

          const divFormatted = formatMetricValue(
            division.metric.value,
            division.metric.rawValue,
            metricInfo.displayUnit,
            metricInfo.rawUnit,
            metricInfo.timeUnitConversion,
          );
          const divCountStr = formatCount(division.metric.count, division.metric.countLabel);

          return (
            <div key={division.departmentCode} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Division header row */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white">
                {/* Status icon */}
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {state === "pending" && (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                  {state === "loading" && (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  {state === "loaded" && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {state === "error" && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>

                {/* Division name + summary (clickable to collapse when loaded) */}
                <button
                  type="button"
                  className="flex-1 flex items-center justify-between gap-2 text-left"
                  onClick={() => state === "loaded" && toggleDivision(division.departmentCode)}
                  disabled={state !== "loaded"}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {division.departmentName}
                    </span>
                    {state === "loaded" && (
                      isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      )
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{divFormatted.display}</span>
                    <span>{divCountStr}</span>
                  </div>
                </button>

                {/* Retry button for error state */}
                {state === "error" && (
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:text-red-800 underline flex-shrink-0"
                    onClick={() => retryDivision(division.departmentCode)}
                  >
                    재시도
                  </button>
                )}
              </div>

              {/* Error message */}
              {state === "error" && status?.error && (
                <div className="px-3 py-1.5 text-xs text-red-600 bg-red-50 border-t border-red-100">
                  {status.error}
                </div>
              )}

              {/* Loaded division details */}
              {state === "loaded" && !isCollapsed && status?.data?.root && status.data.root.level === "DIVISION" && (
                <div className="px-3 py-2 border-t border-gray-100">
                  <DivisionNode
                    node={status.data.root}
                    metricInfo={metricInfo}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
