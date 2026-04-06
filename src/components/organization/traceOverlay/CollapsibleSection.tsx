import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="mt-2">
      <button
        type="button"
        className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
        onClick={() => setExpanded(prev => !prev)}
      >
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        {title}
      </button>
      {expanded && <div className="mt-1 ml-4">{children}</div>}
    </div>
  );
}
