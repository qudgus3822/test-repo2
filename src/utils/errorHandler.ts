import { AxiosError } from "axios";
import toast from "react-hot-toast";
import type { ApiError } from "@/types/api";

/**errorHandler (API 에러 처리)
  - 역할: API 요청 중 발생하는 에러를 변환하고 처리
  - 대상: 비동기 에러, Axios 에러
  - 예시:
    - 401 인증 에러
    - 404 리소스 없음
    - 500 서버 에러
 */

/**
 * API 에러를 ApiError 타입으로 변환
 * 상태 코드별로 적절한 에러 메시지를 반환
 */
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const code = error.response?.data?.code;

    // 상태 코드별 에러 메시지 처리
    switch (status) {
      case 400:
        return {
          message: message || "잘못된 요청입니다.",
          status,
          code,
        };
      case 401:
        return {
          message: message || "인증이 필요합니다.",
          status,
          code,
        };
      case 403:
        return {
          message: message || "접근 권한이 없습니다.",
          status,
          code,
        };
      case 404:
        return {
          message: message || "요청한 리소스를 찾을 수 없습니다.",
          status,
          code,
        };
      case 500:
        return {
          message: message || "서버 오류가 발생했습니다.",
          status,
          code,
        };
      default:
        return {
          message: message || "알 수 없는 오류가 발생했습니다.",
          status,
          code,
        };
    }
  }

  // Axios 에러가 아닌 경우
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "알 수 없는 오류가 발생했습니다.",
  };
};

/**
 * 에러 알림 표시
 * react-hot-toast를 사용하여 사용자에게 에러 메시지를 표시
 */
export const showErrorNotification = (error: ApiError) => {
  console.error("API Error:", error);

  // 상태 코드에 따라 다른 스타일의 토스트 표시
  const message = error.message;

  if (error.status === 401 || error.status === 403) {
    // 인증/권한 에러는 경고 스타일
    toast.error(message, {
      duration: 4000,
      position: "top-right",
      icon: "🔒",
    });
  } else if (error.status && error.status >= 500) {
    // 서버 에러
    toast.error(message, {
      duration: 5000,
      position: "top-right",
      icon: "⚠️",
    });
  } else {
    // 일반 에러
    toast.error(message, {
      duration: 3000,
      position: "top-right",
    });
  }
};
