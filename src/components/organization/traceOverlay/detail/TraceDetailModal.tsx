import { useMemo } from "react";
import { X } from "lucide-react";
import {
  isTraceMappingValid,
  buildUnifiedTable,
} from "@/utils/traceMappingUtils.js";
import { CollapsibleSection } from "../CollapsibleSection.js";
import { TraceMappingSummary } from "./TraceMappingSummary.js";
import { TraceMappingItemTable } from "./TraceMappingItemTable.js";
import type { TraceMapping, DailyUserMetric, MergeRequestSummary } from "@/types/traceability.types.js";

interface TraceDetailModalProps {
  traceMapping: TraceMapping;
  rawDailyData: DailyUserMetric[] | null;
  mergeRequests: MergeRequestSummary[] | null;
  aggregatedSummary?: Record<string, unknown> | null;
  period: 'DAILY' | 'MONTHLY';
  memberName: string;
  itemTypeLabel: string;
  onClose: () => void;
}

/**
 * Centered modal overlay for trace member detail.
 * Renders unified table (MR general info + metric-specific columns) for valid items.
 * Renders collapsible section for invalid items when applicable.
 * Positioned absolutely within the TraceOverlay container (relative parent required).
 */
export function TraceDetailModal({
  traceMapping,
  rawDailyData,
  mergeRequests,
  aggregatedSummary,
  period,
  memberName,
  itemTypeLabel,
  onClose,
}: TraceDetailModalProps) {
  // ── Validation guard ───────────────────────────────────────────────────────

  if (!isTraceMappingValid(traceMapping)) {
    return (
      <ModalShell memberName={memberName} itemTypeLabel={itemTypeLabel} rowCount={null} onClose={onClose}>
        <p className="py-6 text-sm text-gray-400 text-center">이 지표에 대한 상세 데이터 형식이 올바르지 않습니다.</p>
      </ModalShell>
    );
  }

  // ── No data guard ──────────────────────────────────────────────────────────

  if (!rawDailyData || rawDailyData.length === 0) {
    return (
      <ModalShell memberName={memberName} itemTypeLabel={itemTypeLabel} rowCount={null} onClose={onClose}>
        <p className="py-6 text-sm text-gray-400 text-center">원본 데이터가 없습니다.</p>
      </ModalShell>
    );
  }

  return (
    <ModalContent
      traceMapping={traceMapping}
      rawDailyData={rawDailyData}
      mergeRequests={mergeRequests}
      aggregatedSummary={aggregatedSummary}
      period={period}
      memberName={memberName}
      itemTypeLabel={itemTypeLabel}
      onClose={onClose}
    />
  );
}

// ── ModalContent: separated to allow hooks (useMemo) after guards ─────────────

interface ModalContentProps extends TraceDetailModalProps {
  rawDailyData: DailyUserMetric[]; // narrowed: non-null after guard
}

function ModalContent({
  traceMapping,
  rawDailyData,
  mergeRequests,
  aggregatedSummary,
  period,
  memberName,
  itemTypeLabel,
  onClose,
}: ModalContentProps) {
  const { columns, rows, summaryEntries, invalidColumns, invalidRows } = useMemo(
    () => buildUnifiedTable(traceMapping, rawDailyData, mergeRequests, period, aggregatedSummary),
    [traceMapping, rawDailyData, mergeRequests, period, aggregatedSummary],
  );

  const invalidLabel = traceMapping.itemsLocation.invalidLabel ?? '무효 항목';

  return (
    <ModalShell
      memberName={memberName}
      itemTypeLabel={itemTypeLabel}
      rowCount={rows.length}
      onClose={onClose}
    >
      {/* Summary cards */}
      <TraceMappingSummary entries={summaryEntries} />

      {/* Main table or no-data message */}
      {columns.length === 0 ? (
        <p className="py-6 text-sm text-gray-400 text-center">이 지표는 항목별 상세 데이터가 없습니다.</p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-sm text-gray-400 text-center">해당 항목이 없습니다.</p>
      ) : (
        <TraceMappingItemTable
          columns={columns}
          rows={rows}
        />
      )}

      {/* Collapsible invalid items section */}
      {traceMapping.invalidItemFields.length > 0 && invalidRows.length > 0 && (
        <CollapsibleSection
          title={`${invalidLabel} (${invalidRows.length}건)`}
          defaultExpanded={false}
        >
          <TraceMappingItemTable
            columns={invalidColumns}
            rows={invalidRows}
          />
        </CollapsibleSection>
      )}
    </ModalShell>
  );
}

// ── Variant constants ─────────────────────────────────────────────────────────

const ICON_BUTTON = "text-gray-400 hover:text-gray-600 cursor-pointer";

// ── ModalShell: backdrop + centered container ─────────────────────────────────

interface ModalShellProps {
  memberName: string;
  itemTypeLabel: string;
  rowCount: number | null;
  onClose: () => void;
  children: React.ReactNode;
}

function ModalShell({ memberName, itemTypeLabel, rowCount, onClose, children }: ModalShellProps) {
  return (
    /* Backdrop: absolute inset-0 within the relative TraceOverlay flex container */
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/10"
      onClick={onClose}
    >
      {/* Modal container: stops backdrop click propagation */}
      <div
        className="w-[90%] max-w-[900px] max-h-[80%] flex flex-col bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 shrink-0">
          <h3 className="text-sm font-semibold text-gray-800">
            {memberName} — {itemTypeLabel} 상세
            {rowCount !== null && (
              <span className="ml-2 text-gray-400 font-normal">총 {rowCount}건</span>
            )}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={ICON_BUTTON}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: scrollable, overflow-x-auto for wide tables */}
        <div className="flex-1 overflow-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
