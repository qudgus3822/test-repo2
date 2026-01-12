import { useEffect } from "react";
import { createPortal } from "react-dom";

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  variant?: "error" | "success" | "info";
}

const variantStyles = {
  error: "bg-gray-800 text-white",
  success: "bg-green-600 text-white",
  info: "bg-blue-600 text-white",
};

export const Toast = ({
  message,
  isVisible,
  onClose,
  duration = 3000,
  variant = "error",
}: ToastProps) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return createPortal(
    <>
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 z-[80] bg-black/20" />
      {/* 토스트 메시지 */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[81] px-8 py-4 rounded-lg text-sm text-center whitespace-pre-line shadow-lg ${variantStyles[variant]}`}
      >
        {message}
      </div>
    </>,
    document.body,
  );
};

export default Toast;
