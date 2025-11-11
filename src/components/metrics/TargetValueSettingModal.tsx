import { useState, useEffect } from "react";
import type { MetricItem } from "@/types/metrics.types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getCategoryLabel } from "@/utils/metrics";

interface TargetValueSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: MetricItem[];
  onSave: (updatedMetrics: MetricItem[]) => void;
}

export const TargetValueSettingModal = ({
  isOpen,
  onClose,
  metrics,
  onSave,
}: TargetValueSettingModalProps) => {
  const [editedMetrics, setEditedMetrics] = useState<MetricItem[]>(metrics);
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

  if (!shouldRender) return null;

  const handleTargetValueChange = (index: number, value: string) => {
    const updated = [...editedMetrics];
    updated[index] = { ...updated[index], targetValue: value };
    setEditedMetrics(updated);
  };

  const handleSave = () => {
    onSave(editedMetrics);
    onClose();
  };

  const handleCancel = () => {
    setEditedMetrics(metrics); // 원래 값으로 복원
    onClose();
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleCancel}
      />

      {/* 슬라이드 패널 */}
      <div
        className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                목표값 일괄 설정
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                전체 메트릭의 목표값을 일괄적으로 수정할 수 있습니다.
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 테이블 */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-700">
                  <th className="px-4 py-3 w-[30%]">지표명</th>
                  <th className="px-4 py-3 w-[20%]">범주</th>
                  <th className="px-4 py-3 w-[20%]">현재값</th>
                  <th className="px-4 py-3 w-[30%]">목표값</th>
                </tr>
              </thead>
              <tbody>
                {editedMetrics.map((metric, index) => (
                  <tr
                    key={metric.metricCode || index}
                    className="border-b border-gray-100"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {metric.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getCategoryLabel(metric.category)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {metric.currentValue}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={metric.targetValue}
                        onChange={(e) =>
                          handleTargetValueChange(index, e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <Button
              variant="cancel"
              size="sm"
              onClick={handleCancel}
              className="!bg-white !text-gray-700 border border-gray-300 hover:!bg-gray-50"
            >
              취소
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="!bg-blue-600 hover:!bg-blue-700 focus:!ring-blue-500"
            >
              저장
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
