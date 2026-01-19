import type { User } from "@/types/auth";
import { apiFetch } from "@/libs/fetch";

export interface LoginRequest {
  email: string;
  password: string;
  rememberEmail?: boolean;
}

export interface LoginResponse {
  user: User;
  message?: string;
}

/**
 * 백엔드 서버 상태 확인
 * @returns {Promise<boolean>} 서버가 정상이면 true, 아니면 false
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await apiFetch("/health", {
      method: "GET",
      skipAuthRedirect: true, // 헬스체크는 인증 불필요
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * 인증 상태 확인 (쿠키 기반)
 * @returns {Promise<User | null>} 인증된 경우 사용자 정보 반환, 아니면 null
 */
export const checkAuthStatus = async (): Promise<User | null> => {
  try {
    const response = await apiFetch("/users/me", {
      method: "GET",
      skipAuthRedirect: true, // 인증 상태 확인은 401 시 리다이렉트하지 않음
      // 브라우저 캐시 사용하지 않도록 설정 (304 응답 방지)
      cache: "no-store",
    });

    if (response.status === 401) return null; // 인증되지 않음
    if (!response.ok) return null;

    const data = await response.json();

    // Date 필드 변환
    return {
      ...data,
      lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : undefined,
      createdAt: new Date(data.createdAt),
    };
  } catch (error) {
    console.error("인증 상태 확인 실패:", error);
    return null;
  }
};

/**
 * 로그인 (이메일/비밀번호 기반)
 * @param {LoginRequest} credentials - 로그인 정보
 * @returns {Promise<LoginResponse>} 로그인 응답
 * @throws {Error} 로그인 실패 시 에러
 */
export const loginToServer = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  try {
    const response = await apiFetch("/auth/signin", {
      method: "POST",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
      skipAuthRedirect: true, // 로그인은 401 시 리다이렉트하지 않음
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 영문 에러 메시지를 한글로 변환
      const errorMessage =
        errorData.message === "Invalid email or password"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : errorData.message || "로그인에 실패했습니다.";
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // rememberEmail 처리 (로컬 스토리지에 저장)
    if (credentials.rememberEmail) {
      localStorage.setItem("rememberedEmail", credentials.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    // 로그인 후 사용자 정보 가져오기
    const user = await checkAuthStatus();
    if (!user) {
      throw new Error("사용자 정보를 가져올 수 없습니다");
    }

    return {
      user,
      message: data.message,
    };
  } catch (error) {
    console.error("로그인 실패:", error);
    throw error;
  }
};

/**
 * 클라이언트 쿠키 삭제 (모든 도메인)
 * 서버 로그아웃과 별개로 클라이언트에서 쿠키를 명시적으로 삭제합니다.
 * 도메인이 다른 쿠키가 남아있는 경우를 대비한 방어적 처리입니다.
 */
export const clearAuthCookies = (): void => {
  const cookieNames = ["accessToken", "idToken", "refreshToken"];
  const domains = [
    "dev-devmetrics.aws-bithumb.com", // 관리자 로그인 도메인
    ".aws-bithumb.com", // Okta 로그인 도메인
  ];

  cookieNames.forEach((name) => {
    // 각 도메인별로 쿠키 삭제
    domains.forEach((domain) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    });
    // 도메인 없이도 삭제 시도 (현재 도메인 기준)
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
};

/**
 * 로그아웃 (서버 쿠키 삭제 + 클라이언트 쿠키 삭제)
 * @returns {Promise<boolean>} 성공하면 true
 * @throws {Error} 로그아웃 실패 시 에러
 */
export const logoutFromServer = async (): Promise<boolean> => {
  try {
    const response = await apiFetch("/auth/logout", {
      method: "POST",
      skipAuthRedirect: true, // 로그아웃은 401 시 리다이렉트하지 않음
    });

    // 서버 응답과 관계없이 클라이언트 쿠키 삭제 (방어적 처리)
    clearAuthCookies();

    if (!response.ok) {
      throw new Error("로그아웃 실패");
    }
    return true;
  } catch (error) {
    // 서버 로그아웃 실패해도 클라이언트 쿠키는 삭제
    clearAuthCookies();
    console.error("로그아웃 실패:", error);
    throw error;
  }
};

/**
 * 저장된 이메일 가져오기
 * @returns {string | null} 저장된 이메일
 */
export const getRememberedEmail = (): string | null => {
  return localStorage.getItem("rememberedEmail");
};
