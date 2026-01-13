import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logoWhite from "@/assets/images/bithumb_logo_white_vertical.png";
import { Button } from "@/components/ui/Button";
import { useLogin, useLogout } from "@/api/hooks/useAuth";
import { getRememberedEmail } from "@/api/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { env } from "@/env";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  // useAuth() 대신 개별 훅 사용 (useCurrentUser API 호출 방지)
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const user = useAuthStore((state) => state.user);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const hasLoggedOut = useRef(false);

  // [변경: 2026-01-12 15:40, 김병현 수정] 컴포넌트 마운트 시 저장된 이메일 불러오기 및 강제 로그아웃
  useEffect(() => {
    // 최초 마운트 시에만 로그아웃 실행 (Zustand 스토어에 유저 정보가 있는 경우에만)
    if (!hasLoggedOut.current) {
      hasLoggedOut.current = true;
      if (user) {
        logoutMutation.mutate();
      }
      const rememberedEmail = getRememberedEmail();
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberEmail(true);
      }
    }
  }, [user, logoutMutation]);

  const handleOktaLogin = () => {
    // Okta 로그인 페이지로 리다이렉트
    window.location.href = `${env.apiBaseUrl}/auth/okta`;
  };

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await loginMutation.mutateAsync({ email, password, rememberEmail });
      navigate("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "로그인에 실패했습니다.";
      setErrorMessage(convertErrorMessage(message));
    }
  };

  const convertErrorMessage = (message: string) => {
    switch (message) {
      case "Member not found in LDAP directory":
        return "접근 권한이 없습니다.";
      case "User account is inactive":
        return "사용자 계정이 비활성화되었습니다. 관리자에게 문의하세요.";
      default:
        return message;
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-lg bg-white p-8 shadow-md justify-between">
        {/* 로고 */}
        <div className="flex justify-center">
          <img src={logoWhite} alt="logo" className="w-18 h-18" />
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 py-3">
            Barcode <span className="text-[#FF6C00]">plus</span>
          </h1>
        </div>

        {!isAdminLogin ? (
          // Okta 로그인 화면
          <>
            <div className="flex flex-col gap-4 py-4">
              <p className="text-center text-md text-gray-600">
                Okta 계정으로 로그인하세요
              </p>

              <Button type="button" fullWidth onClick={handleOktaLogin}>
                Okta 로그인
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsAdminLogin(true)}
                className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
              >
                관리자 로그인
              </button>
            </div>
          </>
        ) : (
          // 관리자 로그인 화면 (이메일/비밀번호)
          <form onSubmit={handleAdminLogin} className="flex flex-col gap-6">
            <p className="text-center text-md text-gray-600">
              관리자 계정으로 로그인하세요
            </p>

            {/* 이메일 입력 */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-md font-medium text-gray-700"
              >
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="example@bithumbcorp.com"
                className="rounded-md border border-gray-300 px-4 py-2 text-md transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-md font-medium text-gray-700"
              >
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="비밀번호를 입력하세요"
                className="rounded-md border border-gray-300 px-4 py-2 text-md transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* 이메일 저장 체크박스 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberEmail"
                name="rememberEmail"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              />
              <label htmlFor="rememberEmail" className="text-md text-gray-700">
                이메일 저장
              </label>
            </div>

            {/* 에러 메시지 */}
            {(errorMessage || loginMutation.error) && (
              <div className="rounded-md p-3 text-center text-md text-red-600">
                {errorMessage || loginMutation.error?.message}
              </div>
            )}

            {/* 로그인 버튼 */}
            <Button type="submit" fullWidth disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "로그인 중..." : "로그인"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsAdminLogin(false)}
                className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
              >
                Okta 로그인으로 돌아가기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
