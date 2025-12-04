interface LoadingSpinnerProps {
  /** 스피너 크기 */
  size?: "sm" | "md" | "lg";
  /** 메시지 표시 여부 (기본값: true, false면 스피너만 표시) */
  showMessage?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

/**
 * 로딩 스피너 컴포넌트
 *
 * @example
 * ```tsx
 * <LoadingSpinner />  // 기본: 스피너 + 메시지
 * <LoadingSpinner showMessage={false} />  // 스피너만
 * <LoadingSpinner size="sm" />  // 작은 크기
 * ```
 */
export const LoadingSpinner = ({
  size = "md",
  showMessage = true,
  className = "",
}: LoadingSpinnerProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 text-gray-500 ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-b-2 border-gray-900 ${sizeClasses[size]}`}
      />
      {showMessage && <p>데이터를 불러오는 중입니다.</p>}
    </div>
  );
};
