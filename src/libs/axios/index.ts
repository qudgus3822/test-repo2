import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { handleApiError, showErrorNotification } from "@/utils/errorHandler";
import { env } from "@/env";

// 토큰 갱신 상태 관리 (중복 갱신 요청 방지)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// 대기 중인 요청들 처리
const processQueue = (error: Error | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// 재시도 플래그를 위한 타입 확장
interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  withCredentials: true, // Cookie 전송을 위해 필수
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - 요청 전 처리
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 요청 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log("📤 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

// Response Interceptor - 응답 후 처리
apiClient.interceptors.response.use(
  (response) => {
    // 응답 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log("📥 API Response:", {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry;

    // 401 에러 처리 (인증 실패) - 토큰 갱신 및 재시도
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // refresh-token 엔드포인트 자체가 401을 반환한 경우 로그인 페이지로 이동
      if (originalRequest.url?.includes("/auth/refresh-token")) {
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // 이미 토큰 갱신 중인 경우, 갱신 완료까지 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 API 호출 (Cookie 기반)
        await axios.post(
          `${env.apiBaseUrl}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        // 대기 중인 요청들 처리
        processQueue(null);

        // 원래 요청 재시도
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        console.error("Token refresh failed:", refreshError);
        processQueue(refreshError as Error);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 일반 에러 처리 (400, 403, 404, 500 등)
    const apiError = handleApiError(error);
    showErrorNotification(apiError);
    return Promise.reject(apiError);
  },
);

export default apiClient;
