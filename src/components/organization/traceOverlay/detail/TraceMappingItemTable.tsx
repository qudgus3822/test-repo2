import type { TraceMappingField } from "@/types/traceability.types.js";
import type { TableRow } from "@/utils/traceMappingUtils.js";

interface TraceMappingItemTableProps {
  columns: TraceMappingField[];
  rows: TableRow[];
  emptyMessage?: string;
}

/**
 * Dynamic table driven by traceMapping columns.
 * Header shows label + unit in parentheses when unit is defined.
 * Body cells display the pre-formatted row.display[col.key] value.
 */
export function TraceMappingItemTable({
  columns,
  rows,
  emptyMessage,
}: TraceMappingItemTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-4 text-xs text-gray-400 text-center">
        {emptyMessage ?? "항목이 없습니다."}
      </p>
    );
  }

  return (
    <div>
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 z-10 bg-white">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="py-1.5 pr-3 text-left text-gray-500 font-medium whitespace-nowrap">
                {col.unit ? `${col.label} (${col.unit})` : col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map(col => (
                <td key={col.key} className="py-1.5 pr-3 border-b border-gray-50 last:border-0 text-gray-800">
                  {row.display[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
