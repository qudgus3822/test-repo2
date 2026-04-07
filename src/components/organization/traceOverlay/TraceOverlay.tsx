import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useModalAnimation } from "@/hooks";
import { useTraceability } from "@/api/hooks/useTraceability";
import { useSequentialDivisionLoader } from "@/api/hooks/useSequentialDivisionLoader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { collectAllNodeIds } from "@/utils/traceGraphLayout";
import type {
  TraceOverlayContext,
  TraceQuery,
  CompanyTraceNode,
  GraphNodeType,
  TraceNode,
} from "@/types/traceability.types";

import { TraceHeader } from "./TraceHeader";
import { TraceGraphToolbar } from "./TraceGraphToolbar";
import { TraceGraph } from "./TraceGraph";

/** Maps TraceNode root level to the root GraphNodeType for the toolbar legend. */
function getRootType(level: TraceNode["level"]): GraphNodeType {
  switch (level) {
    case "COMPANY":
    case "DIVISION":
      return "DIVISION";
    case "TEAM":
      return "TEAM";
    case "MEMBER":
      return "MEMBER";
  }
}

interface TraceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  context: TraceOverlayContext | null;
  /** Current yearMonth from the organization page (e.g. "2026-03") */
  yearMonth: string;
}

export const TraceOverlay = ({
  isOpen,
  onClose,
  context,
  yearMonth,
}: TraceOverlayProps) => {
  const { shouldRender, isAnimating } = useModalAnimation(isOpen);

  // Build TraceQuery only when context is non-null
  const query: TraceQuery = context
    ? {
        metricName: context.metricApiName,
        periodKey: yearMonth,
        aggregationLevel: context.aggregationLevel,
        departmentCode: context.departmentCode,
        memberId: context.memberId,
      }
    : {
        metricName: "",
        periodKey: "",
        aggregationLevel: "DIVISION",
      };

  const { data, isLoading, isError, error, refetch } = useTraceability(
    query,
    context !== null,
  );

  // -- Expand/collapse state (owned by TraceOverlay, passed to graph components) --
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Tracks which division codes have already been expanded to avoid redundant collectAllNodeIds calls
  const processedDivisionsRef = useRef<Set<string>>(new Set());

  // Sequential loader for company-level traces
  const isCompanyLevel = data?.root?.level === "COMPANY";
  const { divisionStates, retryDivision } = useSequentialDivisionLoader(
    isCompanyLevel ? (data!.root as CompanyTraceNode).children : [],
    data?.query.metricName ?? "",
    data?.query.periodKey ?? "",
    isCompanyLevel,
  );

  // Initialize expand state: expand all on first load (only on root change)
  useEffect(() => {
    if (!data?.root) return;
    // Reset the processed-divisions tracker so newly-loaded divisions are picked up
    processedDivisionsRef.current = new Set();
    const allIds = collectAllNodeIds(data.root, divisionStates);
    setExpandedNodes(new Set(allIds));
    // Mark any already-loaded divisions as processed so the divisionStates effect
    // does not redundantly re-expand them after this root-change effect runs.
    divisionStates.forEach((status, code) => {
      if (status.state === "loaded" && status.data?.root) {
        processedDivisionsRef.current.add(code);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.root]); // Only on root change, NOT on divisionStates change

  // Update expanded set when new divisions load (add only their newly-available children)
  useEffect(() => {
    if (!isCompanyLevel) return;
    const newlyProcessed: string[] = [];
    divisionStates.forEach((status, code) => {
      if (
        status.state === "loaded" &&
        status.data?.root &&
        !processedDivisionsRef.current.has(code)
      ) {
        newlyProcessed.push(code);
        setExpandedNodes((prev) => {
          const next = new Set(prev);
          const newIds = collectAllNodeIds(status.data!.root!, undefined);
          newIds.forEach((id) => next.add(id));
          return next;
        });
      }
    });
    // Mark these divisions as processed so we don't re-expand them on future updates
    newlyProcessed.forEach((code) => processedDivisionsRef.current.add(code));
  }, [divisionStates, isCompanyLevel]);

  const handleToggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    if (!data?.root) return;
    const allIds = collectAllNodeIds(
      data.root,
      isCompanyLevel ? divisionStates : undefined,
    );
    setExpandedNodes(new Set(allIds));
  }, [data?.root, divisionStates, isCompanyLevel]);

  const handleCollapseAll = useCallback(() => {
    if (!data?.root) return;
    if (data.root.level === "COMPANY") {
      setExpandedNodes(
        new Set(
          (data.root as CompanyTraceNode).children.map((d) => d.departmentCode),
        ),
      );
    } else {
      setExpandedNodes(new Set()); // collapse everything
    }
  }, [data?.root]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Centered modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          className={`pointer-events-auto w-[90vw] max-w-[1400px] h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Modal header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {context
                ? (context.metricDisplayName ?? context.metricCode)
                : "역추적"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal body */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* During exit animation context is null — show nothing */}
            {context === null ? null : isLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-red-600 text-sm">
                  데이터를 불러오는 중 오류가 발생했습니다.
                </p>
                <p className="text-gray-500 text-xs">
                  {(error as Error)?.message}
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : data ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                <TraceHeader
                  query={data.query}
                  rawDailyMetric={data.rawDailyMetric}
                  metadata={data.metadata}
                  overlayContext={context}
                />
                <TraceGraphToolbar
                  onExpandAll={handleExpandAll}
                  onCollapseAll={handleCollapseAll}
                  rootType={getRootType(data.root?.level ?? "DIVISION")}
                />
                <TraceGraph
                  root={data.root}
                  metricInfo={data.metricInfo}
                  expandedNodes={expandedNodes}
                  onToggleNode={handleToggleNode}
                  divisionStates={isCompanyLevel ? divisionStates : undefined}
                  retryDivision={isCompanyLevel ? retryDivision : undefined}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">데이터가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
