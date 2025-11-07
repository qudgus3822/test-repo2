import { useState } from "react";
import type { MetricItem } from "@/types/metrics.types";
import { X } from "lucide-react";

interface AchievementRateSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: MetricItem[];
  onSave: (updatedMetrics: MetricItem[]) => void;
}

// MetricCategory enum을 한글 라벨로 변환
const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    code_quality: "코드분류",
    review_quality: "지표분류",
    development_efficiency: "개발정보",
  };
  return labels[category] || category;
};

export const AchievementRateSettingModal = ({
  isOpen,
  onClose,
  metrics,
  onSave,
}: AchievementRateSettingModalProps) => {
  const [editedMetrics, setEditedMetrics] = useState<MetricItem[]>(metrics);

  if (!isOpen) return null;

  const handleAchievementRateChange = (index: number, value: string) => {
    const updated = [...editedMetrics];
    updated[index] = { ...updated[index], achievementRate: parseFloat(value) };
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
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCancel} />

      {/* 슬라이드 패널 */}
      <div
        className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                달성률 설정
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                각 메트릭의 달성률 기준값을 일괄적으로 수정합니다.
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
                  <th className="px-4 py-3 w-[20%]">현재 달성률</th>
                  <th className="px-4 py-3 w-[30%]">달성률 기준(%)</th>
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
                      {metric.achievementRate}%
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={metric.achievementRate}
                        onChange={(e) =>
                          handleAchievementRateChange(index, e.target.value)
                        }
                        min="0"
                        max="100"
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
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
