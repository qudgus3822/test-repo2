import type { ReactNode } from "react";
import { formatValueByType } from "@/utils/traceMappingUtils.js";
import type { SummaryEntry } from "@/utils/traceMappingUtils.js";

const CHIP_STYLE = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-xs text-gray-700";

type PrimitiveRecord = Record<string, string | number | boolean>;

function isKeyValueMap(value: unknown): value is PrimitiveRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return false;
  return entries.every(([, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean');
}

function KeyValueChips({ data }: { data: PrimitiveRecord }) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(data).map(([key, val]) => (
        <span key={key} className={CHIP_STYLE}>
          <span className="text-gray-500">{key}</span>
          <span className="font-medium">{String(val)}</span>
        </span>
      ))}
    </div>
  );
}

function renderSummaryValue(entry: SummaryEntry): ReactNode {
  if (isKeyValueMap(entry.value)) {
    return <KeyValueChips data={entry.value} />;
  }
  return (
    <p className="text-sm font-medium text-gray-800">
      {formatValueByType(entry.value, entry.type, entry.unit)}
    </p>
  );
}

interface TraceMappingSummaryProps {
  entries: SummaryEntry[];
}

/**
 * Horizontal grid of summary metric cards.
 * Returns null when entries is empty so parent can skip rendering.
 */
export function TraceMappingSummary({ entries }: TraceMappingSummaryProps) {
  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {entries.map(entry => (
        <div key={entry.label} className="bg-gray-50 rounded px-3 py-2">
          <p className="text-xs text-gray-500">{entry.label}</p>
          {renderSummaryValue(entry)}
        </div>
      ))}
    </div>
  );
}
