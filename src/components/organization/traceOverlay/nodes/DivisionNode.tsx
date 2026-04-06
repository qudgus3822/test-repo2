import { formatMetricValue, formatCount, getAggregationMethodLabel, getScoreColor } from "@/utils/traceability";
import { TeamNode } from "./TeamNode";
import type { DivisionTraceNode, MetricInfo } from "@/types/traceability.types";

interface DivisionNodeProps {
  node: DivisionTraceNode;
  metricInfo: MetricInfo;
}

export const DivisionNode = ({ node, metricInfo }: DivisionNodeProps) => {
  const formatted = formatMetricValue(
    node.metric.value,
    node.metric.rawValue,
    metricInfo.displayUnit,
    metricInfo.rawUnit,
    metricInfo.timeUnitConversion,
  );

  const countStr = formatCount(node.metric.count, node.metric.countLabel);
  const aggregationLabel = getAggregationMethodLabel(node.aggregationMethod);

  return (
    <div className="py-2 border-l-2 border-indigo-100 pl-3">
      {/* Division summary */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-semibold text-gray-800">{node.departmentName}</span>
          <span className="ml-2 text-xs text-gray-400 bg-indigo-50 px-1.5 py-0.5 rounded">부문/실</span>
          <span className="ml-2 text-xs text-gray-400">{aggregationLabel}</span>
        </div>
        <div className="flex items-center gap-3 text-xs flex-shrink-0">
          <span className="text-gray-700">{formatted.display}</span>
          <span className={`font-medium ${getScoreColor(node.metric.score)}`}>
            {node.metric.score}점
          </span>
          <span className="text-gray-500">{countStr}</span>
        </div>
      </div>

      {/* Children */}
      {node.children === null ? (
        <p className="mt-2 ml-6 text-xs text-gray-400">하위 데이터 없음</p>
      ) : node.children.length === 0 ? (
        <p className="mt-2 ml-6 text-xs text-gray-400">하위 팀 데이터가 없습니다.</p>
      ) : (
        <div className="mt-1">
          {node.children.map(team => (
            <TeamNode
              key={team.departmentCode}
              node={team}
              metricInfo={metricInfo}
            />
          ))}
        </div>
      )}
    </div>
  );
};
