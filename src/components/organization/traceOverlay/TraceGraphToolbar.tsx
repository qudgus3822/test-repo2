import { GRAPH_COLORS } from "@/utils/traceGraphPresentation.js";
import type { GraphNodeType } from "@/types/traceability.types";

interface TraceGraphToolbarProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  /** Root node type — determines the starting legend item */
  rootType: GraphNodeType;
}

const LEGEND_ITEMS: { type: GraphNodeType; label: string }[] = [
  { type: 'DIVISION', label: '부문/실' },
  { type: 'TEAM', label: '팀' },
  { type: 'MEMBER', label: '개인' },
  { type: 'MR', label: 'MR' },
];

const TYPE_ORDER: GraphNodeType[] = ['DIVISION', 'TEAM', 'MEMBER', 'MR'];

/**
 * Toolbar between header and graph: expand/collapse all buttons + legend.
 * Shows all node types from rootType onward (Division -> Team -> Member -> MR).
 */
export const TraceGraphToolbar = ({
  onExpandAll,
  onCollapseAll,
  rootType,
}: TraceGraphToolbarProps) => {
  const startIdx = TYPE_ORDER.indexOf(rootType);
  const visibleTypes = new Set(TYPE_ORDER.slice(startIdx));

  const visibleLegend = LEGEND_ITEMS.filter(item => visibleTypes.has(item.type));

  return (
    <div className="flex items-center gap-2 px-6 py-2 border-b border-gray-100 flex-shrink-0">
      <button
        type="button"
        onClick={onExpandAll}
        className="text-xs px-3 py-1.5 border border-gray-200 rounded-md bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
      >
        모두 펼치기
      </button>
      <button
        type="button"
        onClick={onCollapseAll}
        className="text-xs px-3 py-1.5 border border-gray-200 rounded-md bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
      >
        모두 접기
      </button>
      <div className="flex-1" />
      {/* Legend — shows only node types relevant to the current root/column layout */}
      <div className="flex items-center gap-3 text-[11px] text-gray-400">
        {visibleLegend.map(item => (
          <span key={item.type} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: GRAPH_COLORS[item.type].stroke }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};
