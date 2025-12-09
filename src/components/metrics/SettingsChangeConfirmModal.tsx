import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { usePendingSummary } from "@/api/hooks/usePendingSummary";
import { applySettingsChanges, cancelPendingChanges } from "@/api/metrics";

interface SettingsChangeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SettingsChangeConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
}: SettingsChangeConfirmModalProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // 변경내역 조회 API - 모달이 열릴 때만 호출
  const { data: pendingSummary, isLoading } = usePendingSummary(isOpen);

  // 애니메이션을 위한 지연된 unmount
  useEffect(() => {
    if (isOpen) {
      flushSync(() => setShouldRender(true));
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleConfirm = async () => {
    setIsApplying(true);
    try {
      await applySettingsChanges();
      onConfirm();
      onClose();
    } catch {
      // API가 없거나 에러 발생 시 confirm 메시지 표시
      window.confirm("현재 서버에 해당 API가 없습니다.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelPendingChanges();
      onClose();
    } catch {
      // API가 없거나 에러 발생 시 confirm 메시지 표시
      window.confirm("현재 서버에 해당 API가 없습니다.");
    } finally {
      setIsCancelling(false);
    }
  };

  // API 응답값에서 표시할 데이터 추출
  const targetValueCount = pendingSummary?.targetValue.total ?? 0;
  const achievementRateCount = pendingSummary?.achievementCriteria ?? 0;
  const ratioCount = {
    codeQuality: pendingSummary?.weight.quality ?? 0,
    reviewQuality: pendingSummary?.weight.review ?? 0,
    developmentEfficiency: pendingSummary?.weight.efficiency ?? 0,
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 모달 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-white rounded-lg shadow-xl w-[530px]">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              변경사항 반영
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 본문 */}
          <div className="px-6 py-5">
            <p className="text-sm text-gray-600 mb-5">
              변경 확정된 설정값은 홈/조직비교 화면에 다음날 수집된 데이터에
              맞춰 반영됩니다.
            </p>

            {/* 변경 현황 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <h3 className="text-sm font-medium text-gray-700 px-4 py-3 border-b border-gray-200">
                변경 현황
              </h3>

              {isLoading ? (
                <div className="p-4 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-2 text-sm p-4">
                  {/* 목표값 */}
                  <div className="flex items-center">
                    <span className="text-gray-600 w-20">목표값</span>
                    <span className="text-blue-600 font-medium">
                      {targetValueCount}개
                    </span>
                  </div>

                  {/* 달성률 */}
                  <div className="flex items-center">
                    <span className="text-gray-600 w-20">달성률</span>
                    <span className="text-blue-600 font-medium">
                      {achievementRateCount}개
                    </span>
                  </div>

                  {/* 비율설정 */}
                  <div className="flex items-center">
                    <span className="text-gray-600 w-20">비율설정</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">코드품질</span>
                        <span className="text-blue-600 font-medium">
                          {ratioCount.codeQuality}개
                        </span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">리뷰품질</span>
                        <span className="text-blue-600 font-medium">
                          {ratioCount.reviewQuality}개
                        </span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">개발효율</span>
                        <span className="text-blue-600 font-medium">
                          {ratioCount.developmentEfficiency}개
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <Button
              variant="cancel"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading || isCancelling}
            >
              {isCancelling ? "취소 중..." : "변경취소"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              disabled={isLoading || isApplying}
            >
              {isApplying ? "적용 중..." : "변경확정"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
