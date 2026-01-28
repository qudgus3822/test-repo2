{/* [변경: 2026-01-28 14:05, 임도휘 수정] 반응형 말줄임 + 툴팁 컴포넌트 신규 생성 */}
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface TruncateWithTooltipProps {
  text: string;
  className?: string;
  tooltipDirection?: "right" | "bottom" | "top";
}

/**
 * CSS 기반 말줄임 + 오버플로우 감지 툴팁 컴포넌트
 *
 * - 화면 너비에 따라 자연스럽게 텍스트가 채워짐
 * - 실제로 텍스트가 넘칠 때만 말줄임 적용
 * - 말줄임이 발생한 경우에만 툴팁 표시
 */
export const TruncateWithTooltip = ({
  text,
  className = "",
  tooltipDirection = "bottom",
}: TruncateWithTooltipProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const checkTruncation = useCallback(() => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth } = containerRef.current;
      setIsTruncated(scrollWidth > clientWidth);
    }
  }, []);

  useEffect(() => {
    const rafId = requestAnimationFrame(checkTruncation);

    const resizeObserver = new ResizeObserver(checkTruncation);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", checkTruncation);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkTruncation);
    };
  }, [text, checkTruncation]);

  const handleMouseEnter = () => {
    if (isTruncated && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      if (tooltipDirection === "bottom") {
        setTooltipPosition({
          top: rect.bottom + 6,
          left: rect.left + rect.width / 2,
        });
      } else if (tooltipDirection === "top") {
        setTooltipPosition({
          top: rect.top - 6,
          left: rect.left + rect.width / 2,
        });
      } else {
        setTooltipPosition({
          top: rect.top + rect.height / 2,
          left: rect.right + 6,
        });
      }
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (!text) {
    return <span className={className}>-</span>;
  }

  const showTooltip = isTruncated && isHovered;

  return (
    <>
      <div
        ref={containerRef}
        className={`truncate ${className}`}
        style={{ cursor: isTruncated ? "default" : undefined }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </div>
      {showTooltip &&
        createPortal(
          <div
            className="fixed z-[9999] px-2 py-1 text-xs text-white bg-gray-700 rounded shadow-lg pointer-events-none whitespace-nowrap"
            style={{
              top: tooltipDirection === "top"
                ? `${tooltipPosition.top}px`
                : `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform:
                tooltipDirection === "bottom"
                  ? "translateX(-50%)"
                  : tooltipDirection === "top"
                    ? "translate(-50%, -100%)"
                    : "translateY(-50%)",
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
};

export default TruncateWithTooltip;
