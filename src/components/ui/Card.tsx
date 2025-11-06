import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

/**
 * Card 컴포넌트 - 대시보드 영역 컨테이너
 *
 * 일관된 스타일을 가진 카드 컴포넌트로, 대시보드의 각 섹션을 감쌉니다.
 *
 * @example
 * // 기본 사용
 * <Card>내용</Card>
 *
 * // padding 변경
 * <Card padding="lg">내용</Card>
 *
 * // padding 없이
 * <Card padding="none">내용</Card>
 *
 * // 추가 className
 * <Card className="shadow-md">내용</Card>
 */

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: keyof typeof PADDING;
}

export const Card = ({
  className,
  padding = "md",
  children,
  ...props
}: CardProps) => {
  return (
    <div
      className={clsx(
        "bg-[#FFFFFF] rounded-lg border border-[#E2E8F0]",
        PADDING[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
