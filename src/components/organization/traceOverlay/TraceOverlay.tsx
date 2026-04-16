import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useModalAnimation } from "@/hooks/index.js";
import { useTraceability } from "@/api/hooks/useTraceability.js";
import { useSequentialDivisionLoader } from "@/api/hooks/useSequentialDivisionLoader.js";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner.js";
import { collectAllNodeIds } from "@/utils/traceGraphLayout.js";
import { getItemTypeLabel } from "@/utils/traceMappingUtils.js";
import type {
  TraceOverlayContext,
  TraceQuery,
  CompanyTraceNode,
  GraphNodeType,
  TraceNode,
  MemberTraceNode,
} from "@/types/traceability.types.js";

import { TraceHeader } from "./TraceHeader.js";
import { TraceGraphToolbar } from "./TraceGraphToolbar.js";
import { TraceGraph } from "./TraceGraph.js";
import { TraceDetailModal } from "./detail/TraceDetailModal.js";
import { TraceMappingErrorBoundary } from "./detail/TraceMappingErrorBoundary.js";

// ── Variant constants ─────────────────────────────────────────────────────────

const ICON_BUTTON = "text-gray-400 hover:text-gray-600 cursor-pointer";
const PRIMARY_BUTTON = "px-4 py-2 bg-blue-600 rounded text-sm text-white hover:bg-blue-700 transition-colors";

/** Maps TraceNode root level to the root GraphNodeType for the toolbar legend. */
function getRootType(level: TraceNode["level"]): GraphNodeType {
  switch (level) {
    case "COMPANY":
      return "COMPANY";
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
        employeeId: context.employeeId,
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
  const { divisionStates, retryDivision, allSettled } = useSequentialDivisionLoader(
    isCompanyLevel ? (data!.root as CompanyTraceNode).children : [],
    data?.query.metricName ?? "",
    data?.query.periodKey ?? "",
    isCompanyLevel,
  );

  // Derive shallow-loading signal for the header banner.
  // A1: size === 0 carve-out covers the first frame after the COMPANY response
  // arrives but before useSequentialDivisionLoader's init effect has populated
  // the map — without this guard, some() on an empty map returns false and the
  // banner flickers off for one paint.
  const isShallowLoading =
    isCompanyLevel &&
    (data?.metadata?.isShallowResponse ?? false) &&
    (divisionStates.size === 0 ||
      Array.from(divisionStates.values()).some(
        (s) => s.state === "pending" || s.state === "loading",
      ));

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
    const allNewIds: string[] = [];
    const newlyProcessed: string[] = [];
    divisionStates.forEach((status, code) => {
      if (
        status.state === "loaded" &&
        status.data?.root &&
        !processedDivisionsRef.current.has(code)
      ) {
        newlyProcessed.push(code);
        const newIds = collectAllNodeIds(status.data!.root!, undefined);
        allNewIds.push(...newIds);
      }
    });
    if (allNewIds.length > 0) {
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        allNewIds.forEach((id) => next.add(id));
        return next;
      });
    }
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
      setExpandedNodes(new Set(["__company_root__"]));
    } else if (data.root.level === "MEMBER") {
      setExpandedNodes(new Set([data.root.memberId]));
    } else {
      setExpandedNodes(new Set([data.root.departmentCode]));
    }
  }, [data?.root]);

  // -- Selected member state (for detail panel) --
  const [selectedMember, setSelectedMember] = useState<MemberTraceNode | null>(null);

  // Clear selection when root data changes (new query)
  useEffect(() => {
    setSelectedMember(null);
  }, [data?.root]);

  const handleSelectMember = useCallback((member: MemberTraceNode) => {
    setSelectedMember(prev =>
      prev?.memberId === member.memberId ? null : member,
    );
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedMember(null);
  }, []);

  // Close on Escape key — closes detail modal first, then the overlay
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedMember) {
          handleCloseDetail();
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, selectedMember, handleCloseDetail]);

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
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Centered modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
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
              className={ICON_BUTTON}
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
              <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
                <p className="text-red-600 text-sm">
                  요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className={PRIMARY_BUTTON}
                >
                  다시 시도
                </button>
                {import.meta.env.DEV && (error as Error)?.message && (
                  <details className="text-xs text-gray-400 max-w-full">
                    <summary className="cursor-pointer select-none">
                      상세 정보 (dev only)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap break-all text-left">
                      {(error as Error).message}
                    </pre>
                  </details>
                )}
              </div>
            ) : data ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                <TraceHeader
                  query={data.query}
                  rawDailyMetric={data.rawDailyMetric}
                  metadata={data.metadata}
                  overlayContext={context}
                  direction={data.metricInfo.direction}
                  isShallowLoading={isShallowLoading}
                />
                <TraceGraphToolbar
                  onExpandAll={handleExpandAll}
                  onCollapseAll={handleCollapseAll}
                  rootType={getRootType(data.root?.level ?? "DIVISION")}
                />
                <div className="relative flex flex-1 overflow-hidden">
                  <TraceGraph
                    root={data.root}
                    metricInfo={data.metricInfo}
                    expandedNodes={expandedNodes}
                    onToggleNode={handleToggleNode}
                    divisionStates={isCompanyLevel ? divisionStates : undefined}
                    retryDivision={isCompanyLevel ? retryDivision : undefined}
                    onSelectMember={handleSelectMember}
                    selectedNodeId={selectedMember?.memberId ?? null}
                    itemType={data.traceMapping?.itemType}
                    validPath={data.traceMapping?.itemsLocation.validPath}
                    allDivisionsSettled={isCompanyLevel ? allSettled : false}
                    companyLabel={isCompanyLevel ? context.departmentName : undefined}
                  />
                  {selectedMember && data.traceMapping && (
                    <TraceMappingErrorBoundary key={selectedMember.memberId}>
                      <TraceDetailModal
                        traceMapping={data.traceMapping}
                        rawDailyData={selectedMember.rawDailyData}
                        mergeRequests={selectedMember.mergeRequests}
                        aggregatedSummary={selectedMember.aggregatedSummary}
                        period={data.query.period}
                        memberName={selectedMember.memberName}
                        itemTypeLabel={getItemTypeLabel(data.traceMapping.itemType)}
                        onClose={handleCloseDetail}
                      />
                    </TraceMappingErrorBoundary>
                  )}
                </div>
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
