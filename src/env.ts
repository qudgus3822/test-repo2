/**
 * 환경 변수 모듈
 * Vite 환경 변수에 타입 안전하게 접근하기 위한 헬퍼
 */

/**
 * 환경 변수가 정의되어 있는지 확인하고 값을 반환
 * 정의되지 않았거나 빈 문자열이면 에러 발생
 */
function getEnv(key: keyof ImportMetaEnv, fallback?: string): string {
  const value = import.meta.env[key];

  if (!value && !fallback) {
    throw new Error(
      `Environment variable ${key} is not defined. Please check your .env file.`
    );
  }

  return value || fallback || "";
}

/**
 * 환경 변수 객체
 * 앱 전체에서 import하여 사용
 */
export const env = {
  /** API Base URL */
  apiBaseUrl: getEnv("VITE_API_BASE_URL"),

  /** 환경 (development, production, etc.) */
  env: getEnv("VITE_ENV"),

  /** 애플리케이션 이름 */
  appName: getEnv("VITE_APP_NAME"),

  /** 개발 모드 여부 */
  isDev: import.meta.env.DEV,

  /** 프로덕션 모드 여부 */
  isProd: import.meta.env.PROD,

  /** 인증 스킵 여부 (true: 로그인 없이 접근 가능) */
  skipAuth: getEnv("VITE_SKIP_AUTH", "false") === "true",
} as const;
