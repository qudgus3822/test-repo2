import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { handleApiError, showErrorNotification } from "@/utils/errorHandler";

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - 요청 전 처리
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    // 토큰이 있으면 헤더에 추가
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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
    const originalRequest = error.config;

    // 401 에러 처리 (인증 실패) - 토큰 갱신 및 재시도
    if (error.response?.status === 401 && originalRequest) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // TODO: 실제 토큰 갱신 API 호출
          // const { data } = await axios.post('/auth/refresh', { refreshToken });
          // localStorage.setItem('accessToken', data.accessToken);

          // 새 토큰으로 헤더 업데이트
          // if (originalRequest.headers) {
          //   originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          // }

          // 원래 요청 재시도
          // return apiClient(originalRequest);

          console.log("토큰 갱신 로직 구현 필요");
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리
          console.error("Token refresh failed:", refreshError);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // Refresh Token이 없으면 로그인 페이지로 이동
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    // 일반 에러 처리 (400, 403, 404, 500 등)
    const apiError = handleApiError(error);
    showErrorNotification(apiError);
    return Promise.reject(apiError);
  },
);

export default apiClient;
