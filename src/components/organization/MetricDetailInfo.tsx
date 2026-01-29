/**
 * MetricDetailInfo 컴포넌트
 * - 지표 상세 정보 표시 영역
 * - 모든 데이터는 API 응답값 사용 (지표명, 단위, 상세 설명, 목표값, 계산식, 전월대비 추세)
 */

import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
      className="flex items-center gap-1 bg-white text-sm font-medium"
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

  // API 응답값에서 가져오는 값
  const metricName = data?.title || "--";
  const metricUnit = data?.unit || "--";
  const metricDescription = data?.description || "--";
  const metricTarget = data?.targetValue || "--";
  const metricFormula = data?.formula || "";
  const trend = data?.trend;

  // 로딩 중일 때 전체 영역에 로딩 스피너 표시
  if (isLoading) {
    return (
      <div className="mb-4 p-5 border-2 border-blue-700 rounded-lg bg-blue-50 relative min-h-[200px] flex items-center justify-center">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded cursor-pointer"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <LoadingSpinner />
      </div>
    );
  }

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
      {/* <div className="text-sm text-gray-500 mb-3">지표 상세 정보</div> */}

      {/* 지표명 */}
      <div className="text-lg font-semibold text-blue-700 mb-4">
        {metricName}
        {metricUnit && metricUnit && (
          <span className="ml-1">({metricUnit})</span>
        )}
      </div>

      {/* [변경: 2026-01-28 10:00, 김병현 수정] 카드 레이아웃 변경 (4:4:2 비율) */}
      <div className="grid grid-cols-10 gap-4">
        {/* 첫 번째 카드 - 지표 설명 (4비율) */}
        <div className="col-span-4 border border-gray-300 rounded-lg p-4">
          <div className="text-sm font-bold text-gray-700 mb-2">지표 설명</div>
          <div className="text-sm text-gray-900 whitespace-pre-line">
            {metricDescription}
          </div>
        </div>

        {/* 두 번째 카드 - 유효집계 조건 + 계산식 (4비율) */}
        <div className="col-span-4 border border-gray-300 rounded-lg p-4 flex flex-col">
          <div>
            <div className="text-sm font-bold text-gray-700 mb-2">
              유효집계 조건
            </div>
            <div className="text-sm text-gray-900 whitespace-pre-line">
              {data?.aggregationCondition || "--"}
            </div>
          </div>
          {/* 계산식 - 유효집계 조건 아래 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm font-bold text-gray-700 mb-2">계산식</div>
            {metricFormula ? (
              <div className="text-sm text-gray-900 bg-white rounded px-3 py-2 border border-gray-200">
                {metricFormula}
              </div>
            ) : (
              <div className="text-sm text-gray-400 bg-white rounded px-3 py-2 border border-gray-200">
                --
              </div>
            )}
          </div>
        </div>

        {/* 세 번째 영역 - 위아래 나눔 (2비율) */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* 위: 설정된 목표값 */}
          <div className="flex-1 border border-gray-300 rounded-lg p-4">
            <div className="text-sm font-bold text-gray-700 mb-2">
              설정된 목표값
            </div>
            {/* [변경: 2026-01-29 17:45, 김병현 수정] 목표값도 계산식처럼 하얀 배경으로 표시 */}
            <div className="text-sm text-gray-900 bg-white rounded px-3 py-2 border border-gray-200 w-fit">
              {metricTarget}
              {metricTarget !== "--" && metricUnit !== "--" && (
                <span className="ml-1">{metricUnit}</span>
              )}
            </div>
          </div>
          {/* 아래: 전월대비 지표 추세 */}
          <div className="flex-1 border border-gray-300 rounded-lg p-4">
            <div className="text-sm font-bold text-gray-700 mb-2">
              전월 대비 지표 추세
            </div>
            {/* [변경: 2026-01-29 17:50, 김병현 수정] 지표 추세도 하얀 배경으로 표시 */}
            <div className="bg-white rounded px-3 py-2 border border-gray-200 w-fit">
              <TrendDisplay trend={trend} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
