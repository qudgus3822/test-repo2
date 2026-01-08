/**
 * MetricHeader 컴포넌트
 * - 지표 컬럼 헤더를 표시합니다.
 * - 정렬 기능을 포함합니다.
 * - 참조 프로젝트 구조 기반 (div flex 레이아웃)
 */

import type { SortConfig } from "./types";
import { MetricHeaderItem } from "./MetricHeaderItem";

interface MetricHeaderProps {
  metricCodes: string[];
  sortConfig: SortConfig;
  onSort: (column: string) => void;
}

export const MetricHeader = ({
  metricCodes,
  sortConfig,
  onSort,
}: MetricHeaderProps) => {
  return (
    <div className="flex flex-1">
      {metricCodes.map((code) => (
        <MetricHeaderItem
          key={code}
          metricCode={code}
          sortConfig={sortConfig}
          onSort={onSort}
        />
      ))}
    </div>
  );
};

export default MetricHeader;
