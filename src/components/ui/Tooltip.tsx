import { useState } from "react";
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

  if (!content) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className="absolute z-50 px-3 py-2 text-sm text-white rounded-lg shadow-lg whitespace-nowrap -top-2 left-full ml-2"
          style={{ backgroundColor: color }}
        >
          {content}
          {/* 화살표 */}
          <div
            className="absolute w-2 h-2 transform rotate-45 -left-1 top-1/2 -translate-y-1/2"
            style={{ backgroundColor: color }}
          />
        </div>
      )}
    </div>
  );
};
