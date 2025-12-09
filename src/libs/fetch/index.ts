import { env } from "@/env";
import { useAuthStore } from "@/store/useAuthStore";
import { QueryClient } from "@tanstack/react-query";

// QueryClient 인스턴스를 외부에서 주입받기 위한 변수
let queryClientInstance: QueryClient | null = null;

/**
 * QueryClient 인스턴스 설정
 * 앱 초기화 시 호출하여 QueryClient 인스턴스를 설정합니다.
 */
export const setQueryClient = (client: QueryClient) => {
  queryClientInstance = client;
};

/**
 * 401 에러 발생 시 로그아웃 처리
 * - Zustand 상태 초기화
 * - React Query 캐시 초기화
 * - 로그인 페이지로 리다이렉트
 */
const handleUnauthorized = () => {
  // Zustand 스토어 초기화
  useAuthStore.getState().setLoggedOut();

  // React Query 캐시 초기화
  if (queryClientInstance) {
    queryClientInstance.clear();
  }

  // 이미 로그인 페이지에 있으면 리다이렉트하지 않음
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

interface ApiFetchOptions extends RequestInit {
  /**
   * 401 에러 시 자동 로그아웃 처리를 건너뛸지 여부
   * 인증 관련 API (로그인, 인증 상태 확인 등)에서 사용
   */
  skipAuthRedirect?: boolean;
}

/**
 * API 요청을 위한 공통 fetch wrapper
 * 401 에러 발생 시 자동으로 로그아웃 처리 및 로그인 페이지로 리다이렉트
 *
 * @param input - fetch의 첫 번째 인자 (URL 또는 Request 객체)
 * @param init - fetch의 두 번째 인자 (RequestInit 옵션 + skipAuthRedirect)
 * @returns fetch Response
 * @throws Error - 401 외의 에러 또는 네트워크 에러
 */
export const apiFetch = async (
  input: RequestInfo | URL,
  init?: ApiFetchOptions
): Promise<Response> => {
  // 기본 옵션 설정
  const defaultOptions: RequestInit = {
    credentials: "include", // 쿠키 포함
    headers: {
      "Content-Type": "application/json",
    },
  };

  // 사용자 옵션과 병합
  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...init,
    headers: {
      ...defaultOptions.headers,
      ...init?.headers,
    },
  };

  // URL 처리: 상대 경로인 경우 baseUrl 추가
  let url: RequestInfo | URL = input;
  if (typeof input === "string" && !input.startsWith("http")) {
    url = `${env.apiBaseUrl}${input.startsWith("/") ? input : `/${input}`}`;
  }

  const response = await fetch(url, mergedOptions);

  // 401 에러 처리 (skipAuthRedirect 옵션이 없을 때만)
  if (response.status === 401 && !init?.skipAuthRedirect) {
    handleUnauthorized();
    throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
  }

  return response;
};

/**
 * JSON 응답을 반환하는 GET 요청
 */
export const apiGet = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const response = await apiFetch(endpoint, {
    ...options,
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `요청 실패 (${response.status})`);
  }

  return response.json();
};

/**
 * JSON 응답을 반환하는 POST 요청
 */
export const apiPost = async <T>(
  endpoint: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> => {
  const response = await apiFetch(endpoint, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `요청 실패 (${response.status})`);
  }

  return response.json();
};

/**
 * JSON 응답을 반환하는 PUT 요청
 */
export const apiPut = async <T>(
  endpoint: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> => {
  const response = await apiFetch(endpoint, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `요청 실패 (${response.status})`);
  }

  return response.json();
};

/**
 * JSON 응답을 반환하는 DELETE 요청
 */
export const apiDelete = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const response = await apiFetch(endpoint, {
    ...options,
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `요청 실패 (${response.status})`);
  }

  return response.json();
};
