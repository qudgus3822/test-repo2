import { useState, useEffect, useLayoutEffect, useCallback } from "react";

interface UseModalAnimationOptions {
  /** 애니메이션 지속 시간 (ms) */
  duration?: number;
}

interface UseModalAnimationReturn {
  /** 모달을 DOM에 렌더링할지 여부 */
  shouldRender: boolean;
  /** 애니메이션 활성화 여부 (CSS 트랜지션 트리거) */
  isAnimating: boolean;
}

/**
 * 모달 애니메이션을 위한 커스텀 훅
 *
 * 모달의 열림/닫힘 애니메이션을 안전하게 처리합니다.
 * - useLayoutEffect로 DOM 렌더링 후 즉시 애니메이션 상태 설정
 * - requestAnimationFrame으로 브라우저 페인트 타이밍에 맞춰 애니메이션 시작
 * - 닫힘 시 애니메이션 완료 후 DOM에서 제거
 *
 * @param isOpen - 모달 열림 상태
 * @param options - 애니메이션 옵션
 * @returns shouldRender, isAnimating 상태
 *
 * @example
 * const { shouldRender, isAnimating } = useModalAnimation(isOpen);
 *
 * if (!shouldRender) return null;
 *
 * return (
 *   <div className={isAnimating ? "opacity-100" : "opacity-0"}>
 *     모달 내용
 *   </div>
 * );
 */
export const useModalAnimation = (
  isOpen: boolean,
  options: UseModalAnimationOptions = {}
): UseModalAnimationReturn => {
  const { duration = 300 } = options;

  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 모달이 열릴 때: DOM 렌더링 준비
  useLayoutEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  // 애니메이션 시작/종료 처리
  useEffect(() => {
    if (isOpen && shouldRender) {
      // 다음 프레임에서 애니메이션 시작 (CSS 트랜지션 트리거)
      const frameId = requestAnimationFrame(() => {
        setIsAnimating(true);
      });
      return () => cancelAnimationFrame(frameId);
    } else if (!isOpen && shouldRender) {
      // 닫힘: 애니메이션 종료 후 DOM에서 제거
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender, duration]);

  return { shouldRender, isAnimating };
};

/**
 * 모달 닫힘 시 상태 초기화를 위한 콜백 생성 헬퍼
 * 모달이 닫힐 때 특정 상태를 초기화해야 하는 경우 사용
 */
export const useModalResetOnClose = (
  isOpen: boolean,
  resetFn: () => void
): void => {
  const resetCallback = useCallback(resetFn, [resetFn]);

  useEffect(() => {
    if (!isOpen) {
      resetCallback();
    }
  }, [isOpen, resetCallback]);
};
