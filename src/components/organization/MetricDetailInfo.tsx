/**
 * MetricDetailInfo 컴포넌트
 * - 지표 상세 정보 표시 영역
 * - 지표명, 단위, 상세 설명: 유틸 함수에서 가져옴
 * - 목표값, 계산식, 전월대비 추세: API 응답값 사용
 */

import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  METRIC_CODE_NAMES,
  METRIC_CODE_UNITS,
  METRIC_CODE_DETAIL_DESCRIPTIONS,
} from "@/utils/metrics";
import { TREND_COLORS } from "@/styles/colors";
import { fetchMetricDefinition, type MetricTrend } from "@/api/organization";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface MetricDetailInfoProps {
  metricCode: string;
  onClose: () => void;
}

// 추세 표시 컴포넌트
const TrendDisplay = ({ trend }: { trend?: MetricTrend | null }) => {
  const direction = trend?.direction;

  // new, no_data, null인 경우: 회색 | --
  if (!direction || direction === "new" || direction === "no_data") {
    return <span className="text-sm text-gray-400">--</span>;
  }

  // same인 경우: 회색 | 변화 없음
  if (direction === "same") {
    return <span className="text-sm text-gray-500">변화 없음</span>;
  }

  // up인 경우: 초록색 | ▲ 증가 추세
  if (direction === "up") {
    return (
      <div
        className="flex items-center gap-1 text-sm font-medium"
        style={{ color: TREND_COLORS.increase }}
      >
        <span>▲</span>
        <span>증가 추세</span>
      </div>
    );
  }

  // down인 경우: 빨간색 | ▼ 감소 추세
  return (
    <div
      className="flex items-center gap-1 text-sm font-medium"
      style={{ color: TREND_COLORS.decrease }}
    >
      <span>▼</span>
      <span>감소 추세</span>
    </div>
  );
};

export const MetricDetailInfo = ({
  metricCode,
  onClose,
}: MetricDetailInfoProps) => {
  // API 호출
  const { data, isLoading } = useQuery({
    queryKey: ["metricDefinition", metricCode],
    queryFn: () => fetchMetricDefinition(metricCode),
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 유틸 함수에서 가져오는 값
  const metricName = METRIC_CODE_NAMES[metricCode] || metricCode;
  const metricUnit = METRIC_CODE_UNITS[metricCode] || "-";
  const metricDescription = METRIC_CODE_DETAIL_DESCRIPTIONS[metricCode] || "-";

  // API 응답값에서 가져오는 값
  const metricTarget = data?.targetValue || "-";
  const metricFormula = data?.formula || "";
  const trend = data?.trend;

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

          {/* 계산식 */}
          <div>
            <div className="text-sm text-gray-500 mb-1">계산식</div>
            {isLoading ? (
              <LoadingSpinner size="sm" showMessage={false} />
            ) : metricFormula ? (
              <div className="text-sm text-gray-900 bg-white border border-gray-200 rounded px-3 py-2">
                {metricFormula}
              </div>
            ) : (
              <div className="text-sm text-gray-400">-</div>
            )}
          </div>
        </div>

        {/* 우측 영역 */}
        <div className="space-y-4">
          {/* 설정된 목표값 */}
          <div>
            <div className="text-sm text-gray-500 mb-1">설정된 목표값</div>
            {isLoading ? (
              <LoadingSpinner size="sm" showMessage={false} />
            ) : (
              <div className="text-sm text-gray-900">{metricTarget}</div>
            )}
          </div>

          {/* 전월 대비 지표 추세 */}
          <div>
            <div className="text-sm text-gray-500 mb-1">
              전월 대비 지표 추세
            </div>
            {isLoading ? (
              <LoadingSpinner size="sm" showMessage={false} />
            ) : (
              <div className="inline-block bg-white border border-gray-200 rounded px-3 py-2">
                <TrendDisplay trend={trend} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 지표 상세 설명 - 전체 너비 */}
      <div className="mt-4">
        <div className="text-sm text-gray-500 mb-1">지표 상세 설명</div>
        <div className="text-sm text-gray-900">{metricDescription}</div>
      </div>
    </div>
  );
};
