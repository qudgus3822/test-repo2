import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type TooltipDirection = "right" | "bottom";

interface TooltipProps {
  children: ReactNode;
  content: string;
  color?: string;
  maxWidth?: number; // 툴팁 최대 너비 (기본값: 175px)
  direction?: TooltipDirection; // 툴팁 방향 (기본값: "right")
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
 * <Tooltip content="아래 방향 툴팁" direction="bottom">
 *   <Info className="w-4 h-4" />
 * </Tooltip>
 */
export const Tooltip = ({
  children,
  content,
  color = "#374151",
  maxWidth,
  direction = "right",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowTop, setArrowTop] = useState<number | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (direction === "bottom") {
        setPosition({
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
        });
        setArrowTop(null);
      } else {
        // 트리거 요소의 세로 중앙 위치
        const triggerCenterY = rect.top + rect.height / 2;
        setPosition({
          top: rect.top,
          left: rect.right + 8,
        });
        // 툴팁 렌더링 후 화살표 위치 계산
        requestAnimationFrame(() => {
          if (tooltipRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            // 트리거 중앙에서 툴팁 상단까지의 거리 계산
            const arrowOffset = triggerCenterY - tooltipRect.top;
            setArrowTop(arrowOffset);
          }
        });
      }
    }
  }, [isVisible, direction]);

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
            ref={tooltipRef}
            className="fixed z-[9999] px-3 py-2 text-sm text-white rounded-lg shadow-lg pointer-events-none whitespace-pre-line break-words"
            style={{
              backgroundColor: color,
              ...(direction === "bottom"
                ? {
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    transform: "translateX(-50%)",
                  }
                : {
                    top: `${position.top - 8}px`,
                    left: `${position.left}px`,
                  }),
              ...(maxWidth !== undefined && { maxWidth: `${maxWidth}px` }),
            }}
          >
            {content}
            {/* 화살표 */}
            {direction === "bottom" ? (
              <div
                className="absolute w-2 h-2 transform rotate-45 left-1/2 -top-1 -translate-x-1/2"
                style={{ backgroundColor: color }}
              />
            ) : (
              <div
                className="absolute w-2 h-2 transform rotate-45 -left-1 -translate-y-1/2"
                style={{
                  backgroundColor: color,
                  top: arrowTop !== null ? `${arrowTop}px` : "50%",
                }}
              />
            )}
          </div>,
          document.body,
        )}
    </>
  );
};
