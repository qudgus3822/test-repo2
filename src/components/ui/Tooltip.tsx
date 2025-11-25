import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
  color?: string;
  maxWidth?: number; // 툴팁 최대 너비 (기본값: 175px)
  arrowPosition?: string; // 화살표 위치 클래스 (기본값: "top-1/2")
}

/**
 * Tooltip 컴포넌트 - 마우스 오버 시 설명을 표시
 *
 * @example
 * <Tooltip content="설명 텍스트">
 *   <Info className="w-4 h-4" />
 * </Tooltip>
 *
 * @example
 * <Tooltip content="설명 텍스트" color="#3B82F6">
 *   <Info className="w-4 h-4" />
 * </Tooltip>
 *
 * @example
 * <Tooltip content="설명 텍스트" maxWidth={250}>
 *   <Info className="w-4 h-4" />
 * </Tooltip>
 *
 * @example
 * <Tooltip content="설명 텍스트" arrowPosition="top-[10px]">
 *   <Info className="w-4 h-4" />
 * </Tooltip>
 */
export const Tooltip = ({
  children,
  content,
  color = "#374151",
  maxWidth = 175,
  arrowPosition = "top-1/2",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  }, [isVisible]);

  if (!content) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            className="fixed z-[9999] px-3 py-2 text-sm text-white rounded-lg shadow-lg break-words pointer-events-none"
            style={{
              backgroundColor: color,
              top: `${position.top - 8}px`,
              left: `${position.left}px`,
              maxWidth: `${maxWidth}px`,
            }}
          >
            {content}
            {/* 화살표 */}
            <div
              className={`absolute w-2 h-2 transform rotate-45 -left-1 -translate-y-1/2 ${arrowPosition}`}
              style={{ backgroundColor: color }}
            />
          </div>,
          document.body,
        )}
    </>
  );
};
