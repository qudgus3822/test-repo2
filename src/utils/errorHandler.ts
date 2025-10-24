import { AxiosError } from "axios";
import type { ApiError } from "@/types/api";

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
 * TODO: 토스트나 알림 라이브러리와 연동
 */
export const showErrorNotification = (error: ApiError) => {
  console.error("API Error:", error);
};
