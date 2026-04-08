import { formatValueByType } from "@/utils/traceMappingUtils.js";
import type { SummaryEntry } from "@/utils/traceMappingUtils.js";

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
          <p className="text-sm font-medium text-gray-800">
            {formatValueByType(entry.value, entry.type, entry.unit)}
          </p>
        </div>
      ))}
    </div>
  );
}
