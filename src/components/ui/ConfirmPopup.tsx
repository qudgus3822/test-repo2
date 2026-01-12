import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Toast } from "@/components/ui/Toast";
import { useModalAnimation } from "@/hooks";

interface ConfirmPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  showError?: boolean;
  onErrorClose?: () => void;
  errorMessage?: string;
}

export const ConfirmPopup = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
  confirmText = "확인",
  cancelText = "취소",
  showError = false,
  onErrorClose,
  errorMessage = "다시 시도해주세요.",
}: ConfirmPopupProps) => {
  const { shouldRender, isAnimating } = useModalAnimation(isOpen, {
    duration: 200,
  });

  if (!shouldRender) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-200 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 팝업 */}
      <div
        className={`fixed inset-0 z-[70] flex items-center justify-center transition-all duration-200 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="relative bg-white rounded-lg grid grid-cols-1 gap-4 shadow-xl w-[400px] p-7">
          {/* 아이콘 */}
          <div className="flex justify-center py-1">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>

          {/* 제목 */}
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            {title}
          </h3>

          {/* 설명 */}
          <p className="text-sm text-gray-500 text-center whitespace-pre-line">
            {description}
          </p>

          {/* 버튼 */}
          <div className="flex gap-3 pt-3">
            <Button
              variant="cancel"
              size="sm"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onConfirm}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "처리 중..." : confirmText}
            </Button>
          </div>

          {/* 로딩 오버레이 */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <LoadingSpinner showMessage={false} />
            </div>
          )}
        </div>
      </div>

      {/* 에러 토스트 */}
      <Toast
        message={errorMessage}
        isVisible={showError}
        onClose={onErrorClose ?? (() => {})}
        duration={3000}
        variant="error"
      />
    </>
  );
};
