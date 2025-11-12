import { useState, useEffect } from "react";
import type { MetricItem } from "@/types/metrics.types";
import { X } from "lucide-react";
import { LineChart } from "@/libs/chart";
import { getCategoryLabel, getStatusIconConfig } from "@/utils/metrics";

interface MetricsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: MetricItem | null;
}

export const MetricsDetailModal = ({
  isOpen,
  onClose,
  metric,
}: MetricsDetailModalProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 애니메이션을 위한 지연된 unmount
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // DOM에 렌더링된 후 다음 프레임에서 애니메이션 시작
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // 닫히는 애니메이션 후 unmount (300ms)
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender || !metric) return null;

  const statusConfig = getStatusIconConfig(metric.status);

  // 6개월 추이 목업 데이터 (실제로는 API에서 받아와야 함)
  const trendData = [
    { month: "2024.06", 목표값: metric.targetValue, 달성값: 75, 기준값: 80 },
    { month: "2024.07", 목표값: metric.targetValue, 달성값: 77, 기준값: 80 },
    { month: "2024.08", 목표값: metric.targetValue, 달성값: 79, 기준값: 80 },
    { month: "2024.09", 목표값: metric.targetValue, 달성값: 80, 기준값: 80 },
    { month: "2024.10", 목표값: metric.targetValue, 달성값: 82, 기준값: 80 },
    { month: "2024.11", 목표값: metric.targetValue, 달성값: 85, 기준값: 80 },
  ];

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 슬라이드 패널 */}
      <div
        className={`fixed top-0 right-0 h-full w-[800px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 ">
            <h2 className="text-lg font-semibold text-gray-900">
              {metric.name} 상세 정보
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* 기본 정보 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                기본 정보
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 mb-1">카테고리</div>
                  <div className="text-sm font-medium text-gray-900">
                    {getCategoryLabel(metric.category)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 mb-1">데이터 소스</div>
                  <div className="text-sm font-medium text-gray-900">
                    {"현재 데이터 없음"}
                  </div>
                </div>
              </div>
            </div>
            {/* 현재 성과 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                현재 성과
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 mb-1">현재값</div>
                  <div className="text-sm font-semibold text-blue-600">
                    {metric.currentValue}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 mb-1">목표값</div>
                  <div className="text-sm font-medium text-gray-900">
                    {metric.targetValue}
                  </div>
                </div>
                <div
                  className="rounded-lg px-4 py-3"
                  style={{
                    backgroundColor: statusConfig.bgColor,
                  }}
                >
                  <div className="text-xs text-gray-500 mb-1">달성률</div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: statusConfig.color }}
                  >
                    {metric.achievementRate}%
                  </div>
                </div>
              </div>
            </div>

            {/* 지표 설명 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                지표 설명
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-4 py-3">
                {metric.description ||
                  "코드의 기술부표 수준 측정합니다. 낮을수록 좋고 지표입니다. 기술부표가 높으면 유지보수 비용이 증가하고 버그 발생률이 높아집니다."}
              </p>
            </div>

            {/* 6개월 추세 및 이동 평균 차트 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                6개월 추세 및 이동 평균
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <LineChart
                  data={trendData}
                  xKey="month"
                  yKeys={["목표값", "달성값", "기준값"]}
                  height={300}
                  showGrid={true}
                  showDots={true}
                  showLegend={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
