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

// [변경: 2026-01-28 00:00, 김병현 수정] 토큰 갱신 관련 변수 및 함수 추가
// 토큰 갱신 중복 요청 방지를 위한 변수
let isRefreshing = false;
let refreshSubscribers: ((success: boolean) => void)[] = [];

/**
 * 토큰 갱신 완료 후 대기 중인 요청들에게 알림
 */
const onRefreshComplete = (success: boolean) => {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
};

/**
 * 토큰 갱신 완료를 기다리는 Promise 반환
 */
const waitForRefresh = (): Promise<boolean> => {
  return new Promise((resolve) => {
    refreshSubscribers.push(resolve);
  });
};

/**
 * 토큰 갱신 시도
 * @returns 갱신 성공 여부
 */
const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${env.apiBaseUrl}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch {
    return false;
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

  // URL 처리: 상대 경로만 허용하고 baseUrl 추가 (SSRF 방지)
  let url: string;
  if (typeof input === "string") {
    // 외부 URL 차단 - 상대 경로만 허용
    if (input.startsWith("http://") || input.startsWith("https://")) {
      throw new Error("외부 URL은 허용되지 않습니다. 상대 경로를 사용해주세요.");
    }
    url = `${env.apiBaseUrl}${input.startsWith("/") ? input : `/${input}`}`;
  } else {
    // Request 객체나 URL 객체의 경우 baseUrl 검증
    const inputUrl = input instanceof Request ? input.url : input.toString();
    if (!inputUrl.startsWith(env.apiBaseUrl)) {
      throw new Error("허용되지 않은 URL입니다.");
    }
    url = inputUrl;
  }

  let response = await fetch(url, mergedOptions);

  // [변경: 2026-01-28 00:00, 김병현 수정] 401 에러 시 토큰 갱신 후 재시도 로직 추가
  // 401 에러 처리 (skipAuthRedirect 옵션이 없을 때만)
  if (response.status === 401 && !init?.skipAuthRedirect) {
    // 이미 토큰 갱신 중이면 완료될 때까지 대기
    if (isRefreshing) {
      const success = await waitForRefresh();
      if (success) {
        // 토큰 갱신 성공 시 원래 요청 재시도
        response = await fetch(url, mergedOptions);
        return response;
      } else {
        handleUnauthorized();
        throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
      }
    }

    // 토큰 갱신 시도
    isRefreshing = true;
    const refreshSuccess = await refreshToken();
    isRefreshing = false;
    onRefreshComplete(refreshSuccess);

    if (refreshSuccess) {
      // 토큰 갱신 성공 시 원래 요청 재시도
      response = await fetch(url, mergedOptions);
      return response;
    } else {
      // 토큰 갱신 실패 시 로그아웃 처리
      handleUnauthorized();
      throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
    }
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

/**
 * JSON 응답을 반환하는 PATCH 요청
 */
export const apiPatch = async <T>(
  endpoint: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> => {
  const response = await apiFetch(endpoint, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `요청 실패 (${response.status})`);
  }

  return response.json();
};
