import { useEffect } from "react";
import { X } from "lucide-react";
import { useModalAnimation } from "@/hooks";
import { useTraceability } from "@/api/hooks/useTraceability";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { TraceOverlayContext, TraceQuery } from "@/types/traceability.types";
import { TraceHeader } from "./TraceHeader";
import { TraceTree } from "./TraceTree";

interface TraceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  context: TraceOverlayContext | null;
  /** Current yearMonth from the organization page (e.g. "2026-03") */
  yearMonth: string;
}

export const TraceOverlay = ({ isOpen, onClose, context, yearMonth }: TraceOverlayProps) => {
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

  const { data, isLoading, isError, error, refetch } = useTraceability(query, context !== null);

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

      {/* Slide panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[700px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Panel header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {context ? (context.metricDisplayName ?? context.metricCode) : "역추적"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
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
                <p className="text-gray-500 text-xs">{(error as Error)?.message}</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : data ? (
              <div className="flex flex-col gap-4">
                <TraceHeader
                  metricInfo={data.metricInfo}
                  query={data.query}
                  rawDailyMetric={data.rawDailyMetric}
                  metadata={data.metadata}
                  overlayContext={context}
                />
                <TraceTree
                  root={data.root}
                  metricInfo={data.metricInfo}
                  query={data.query}
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
