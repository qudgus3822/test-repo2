import { useState, useEffect } from "react";
import type { MetricItem } from "@/types/metrics.types";
import { MetricStatus } from "@/types/metrics.types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getStatusIconConfig } from "@/utils/metrics";

interface AchievementRateSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: MetricItem[];
  onSave: (updatedMetrics: MetricItem[]) => void;
}

export const AchievementRateSettingModal = ({
  isOpen,
  onClose,
  metrics,
  onSave,
}: AchievementRateSettingModalProps) => {
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

  // const handleAchievementRateChange = (index: number, value: string) => {
  //   const updated = [...editedMetrics];
  //   updated[index] = { ...updated[index], achievementRate: parseFloat(value) };
  //   setEditedMetrics(updated);
  // };

  const handleSave = () => {
    onSave(editedMetrics);
    onClose();
  };

  const handleCancel = () => {
    setEditedMetrics(metrics); // 원래 값으로 복원
    onClose();
  };

  const handleReset = () => {
    setEditedMetrics(metrics); // 원래 값으로 복원
  };

  // 상태별 아이콘 설정
  const excellentConfig = getStatusIconConfig(MetricStatus.EXCELLENT);
  const warningConfig = getStatusIconConfig(MetricStatus.WARNING);
  const dangerConfig = getStatusIconConfig(MetricStatus.DANGER);

  const ExcellentIcon = excellentConfig.icon;
  const WarningIcon = warningConfig.icon;
  const DangerIcon = dangerConfig.icon;

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
                달성률 기준 설정
              </h2>
              {/* 설명 텍스트 */}
              <p className="text-sm text-gray-600 mt-1">
                지표의 달성률을 평가하는 기준값을 설정합니다. 설정한 기준에 따라
                지표의 상태 아이콘이 변경됩니다.
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto px-6 py-4 gap-6 flex flex-col">
            {/* 우수 기준 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ExcellentIcon
                  className="w-6 h-6"
                  style={{ color: excellentConfig.color }}
                />

                <span className="font-medium text-gray-900">우수 기준</span>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <input
                  type="number"
                  defaultValue="80"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="w-[45px] text-sm text-gray-600 whitespace-nowrap">
                  % 이상
                </span>
              </div>
              <p className="text-sm text-gray-500">
                달성률이 이 값 이상이면 초록색 체크 아이콘이 표시됩니다.
              </p>
            </div>

            {/* 경고 기준 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <WarningIcon
                  className="w-6 h-6"
                  style={{ color: warningConfig.color }}
                />

                <span className="font-medium text-gray-900">경고 기준</span>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <input
                  type="number"
                  defaultValue="70"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="w-[45px] text-sm text-gray-600 whitespace-nowrap">
                  % 이상
                </span>
              </div>
              <p className="text-sm text-gray-500">
                달성률이 이 범위에 있으면 주황색 느낌표 아이콘이 표시됩니다.
              </p>
            </div>

            {/* 위험 기준 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DangerIcon
                  className="w-6 h-6"
                  style={{ color: dangerConfig.color }}
                />
                <span className="font-medium text-gray-900">위험 기준</span>
              </div>
              <div className="flex items-center gap-4 mb-2 w-full">
                <input
                  type="number"
                  defaultValue="70"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="w-[45px] text-sm text-gray-600 whitespace-nowrap">
                  % 미만
                </span>
              </div>
              <p className="text-sm text-gray-500">
                달성률이 경고 기준 미만이면 빨간색 경고 아이콘이 표시됩니다.
              </p>
            </div>

            {/* 미리보기 */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                미리보기
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ExcellentIcon
                    className="w-6 h-6"
                    style={{ color: excellentConfig.color }}
                  />
                  <span className="text-sm text-gray-700">80% 이상</span>
                </div>
                <div className="flex items-center gap-2">
                  <WarningIcon
                    className="w-6 h-6"
                    style={{ color: warningConfig.color }}
                  />
                  <span className="text-sm text-gray-700">70% ~ 80% 미만</span>
                </div>
                <div className="flex items-center gap-2">
                  <DangerIcon
                    className="w-6 h-6"
                    style={{ color: dangerConfig.color }}
                  />
                  <span className="text-sm text-gray-700">70% 미만</span>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 푸터 - 버튼 */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200">
            {/* 기본값으로 재설정 버튼 */}
            <div className="flex items-center justify-start gap-3">
              <Button variant="normal" size="sm" onClick={handleReset}>
                기본값으로 재설정
              </Button>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="cancel" size="sm" onClick={handleCancel}>
                취소
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                저장
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
