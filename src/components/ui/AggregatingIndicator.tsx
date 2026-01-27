import { useSyncStatus } from "@/api/hooks/useSyncStatus";

interface AggregatingIndicatorProps {
  /** 표시할 텍스트 (기본값: "집계 진행중") */
  text?: string;
  /** 스피너 크기 (기본값: "sm") */
  size?: "xs" | "sm" | "md";
  /** 추가 클래스명 */
  className?: string;
  /** isProcessing이 false일 때도 강제로 표시할지 여부 */
  forceShow?: boolean;
}

const sizeClasses = {
  xs: "w-2.5 h-2.5 border-[1.5px]",
  sm: "w-3 h-3 border-2",
  md: "w-4 h-4 border-2",
};

const textSizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
};

/**
 * 집계 진행중 인디케이터 컴포넌트
 * useSyncStatus 훅을 내부에서 호출하여 집계 상태를 자동으로 감지
 *
 * @example
 * ```tsx
 * // 기본 사용 (집계 중일 때만 표시)
 * <AggregatingIndicator />
 *
 * // 커스텀 텍스트
 * <AggregatingIndicator text="데이터 처리중" />
 *
 * // 크기 조절
 * <AggregatingIndicator size="md" />
 *
 * // 강제 표시
 * <AggregatingIndicator forceShow />
 * ```
 */
export const AggregatingIndicator = ({
  text = "집계 진행중",
  size = "sm",
  className = "",
  forceShow = false,
}: AggregatingIndicatorProps) => {
  const { isProcessing } = useSyncStatus();

  if (!isProcessing && !forceShow) {
    return null;
  }

  return (
    <span
      className={`${textSizeClasses[size]} text-gray-500 flex items-center gap-1.5 ${className}`}
    >
      <span
        className={`${sizeClasses[size]} border-gray-300 border-t-gray-500 rounded-full animate-spin`}
      />
      {text}
    </span>
  );
};
