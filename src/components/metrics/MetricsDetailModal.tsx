import type { MetricItem } from "@/types/metrics.types";
import { X } from "lucide-react";
import {
  getCategoryLabel,
  getCategoryStyle,
  getMetricName,
} from "@/utils/metrics";
import { useModalAnimation } from "@/hooks";

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
  // 모달 애니메이션
  const { shouldRender, isAnimating } = useModalAnimation(isOpen);

  if (!shouldRender || !metric) return null;

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
        className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 ">
            <h2 className="text-lg font-semibold text-gray-900">
              {getMetricName(metric.metricCode)} 상세 정보
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
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
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 mb-1">범주</div>
                  <div className="text-sm font-medium text-gray-900">
                    {(() => {
                      const style = getCategoryStyle(metric.category);
                      return (
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                          style={{
                            color: style.color,
                            borderColor: style.borderColor,
                          }}
                        >
                          {getCategoryLabel(metric.category)}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 mb-1">데이터 소스</div>
                  <div className="text-sm font-medium text-gray-900">
                    {metric.sources?.join(", ") || metric.dataSource || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* [Phase 2] 현재 성과 - 추후 개발 예정 */}
            {/* <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                현재 성과
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 mb-1">현재값</div>
                  <div className="text-sm font-semibold text-blue-600">
                    {metric.currentValue}
                    {getMetricUnit(metric.metricCode)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 mb-1">목표값</div>
                  <div className="text-sm font-medium text-gray-900">
                    {metric.targetValue}
                    {getMetricUnit(metric.metricCode)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 mb-1">달성률</div>
                  <div
                    className="text-sm font-semibold flex items-center gap-1"
                    style={{ color: statusColor }}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {Math.round(metric.achievementRate)}%
                  </div>
                </div>
              </div>
            </div> */}

            {/* [Phase 2] BDPI 반영 비율 - 추후 개발 예정 */}
            {/* <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                BDPI 반영 비율
              </h3>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-sm font-medium text-gray-900">
                  {metric.weightRatio.toFixed(1)}%
                </div>
              </div>
            </div> */}

            {/* 지표 설명 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                지표 설명
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-4 py-3">
                {metric.tooltipDescription || metric.description || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
