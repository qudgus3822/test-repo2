import { CompanyNode } from "./nodes/CompanyNode";
import { DivisionNode } from "./nodes/DivisionNode";
import { TeamNode } from "./nodes/TeamNode";
import { MemberNode } from "./nodes/MemberNode";
import type { TraceNode, MetricInfo, TraceResult } from "@/types/traceability.types";

interface TraceTreeProps {
  root: TraceNode | null;
  metricInfo: MetricInfo;
  query: TraceResult["query"];
}

export const TraceTree = ({ root, metricInfo, query }: TraceTreeProps) => {
  if (root === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400 text-sm">데이터가 없습니다.</p>
      </div>
    );
  }

  switch (root.level) {
    case "COMPANY":
      return <CompanyNode node={root} metricInfo={metricInfo} query={query} />;
    case "DIVISION":
      return <DivisionNode node={root} metricInfo={metricInfo} />;
    case "TEAM":
      return <TeamNode node={root} metricInfo={metricInfo} />;
    case "MEMBER":
      return <MemberNode node={root} metricInfo={metricInfo} />;
  }
};
