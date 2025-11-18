import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
  color?: string;
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
 */
export const Tooltip = ({
  children,
  content,
  color = "#374151",
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
            className="fixed z-[9999] px-3 py-2 text-sm text-white rounded-lg shadow-lg max-w-[175px] break-words pointer-events-none"
            style={{
              backgroundColor: color,
              top: `${position.top - 8}px`,
              left: `${position.left}px`,
            }}
          >
            {content}
            {/* 화살표 */}
            <div
              className="absolute w-2 h-2 transform rotate-45 -left-1 top-1/2 -translate-y-1/2"
              style={{ backgroundColor: color }}
            />
          </div>,
          document.body,
        )}
    </>
  );
};
