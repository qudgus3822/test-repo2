/**
 * MetricDetailInfo 컴포넌트
 * - 지표 상세 정보 표시 영역
 * - 지표명, 단위, 상세 설명, 목표값 표시
 */

import { X } from "lucide-react";
import {
  METRIC_CODE_NAMES,
  METRIC_CODE_UNITS,
  METRIC_CODE_DESCRIPTIONS,
  METRIC_CODE_TARGETS,
} from "@/utils/metrics";

interface MetricDetailInfoProps {
  metricCode: string;
  onClose: () => void;
}

export const MetricDetailInfo = ({
  metricCode,
  onClose,
}: MetricDetailInfoProps) => {
  const metricName = METRIC_CODE_NAMES[metricCode] || metricCode;
  const metricUnit = METRIC_CODE_UNITS[metricCode] || "-";
  const metricDescription = METRIC_CODE_DESCRIPTIONS[metricCode] || "-";
  const metricTarget = METRIC_CODE_TARGETS[metricCode] || "-";

  return (
    <div className="mb-4 p-5 border-2 border-blue-700 rounded-lg bg-blue-50 relative">
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded cursor-pointer"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>

      {/* 타이틀 */}
      <div className="text-sm text-gray-500 mb-3">지표 상세 정보</div>

      {/* 지표명 */}
      <div className="text-lg font-semibold text-blue-700 mb-4">
        {metricName}
      </div>

      {/* 상세 정보 그리드 */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {/* 좌측 영역 */}
        <div className="space-y-4">
          {/* 지표 단위 */}
          <div>
            <div className="text-sm text-gray-500 mb-1">지표 단위</div>
            <div className="text-sm text-gray-900">{metricUnit}</div>
          </div>

          {/* 지표 상세 설명 */}
          <div>
            <div className="text-sm text-gray-500 mb-1">지표 상세 설명</div>
            <div className="text-sm text-gray-900">{metricDescription}</div>
          </div>
        </div>

        {/* 우측 영역 */}
        <div className="space-y-4">
          {/* 설정된 목표값 */}
          <div>
            <div className="text-sm text-gray-500 mb-1">설정된 목표값</div>
            <div className="text-sm text-gray-900">{metricTarget}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
