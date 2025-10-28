import { useState, useEffect } from "react";
import logoWhite from "@/assets/images/bithumb_logo_white_vertical.png";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/api/hooks/useAuth";
import { getRememberedEmail } from "@/api/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const LoginPage = () => {
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 컴포넌트 마운트 시 저장된 이메일 불러오기
  useEffect(() => {
    const rememberedEmail = getRememberedEmail();
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberEmail(true);
    }
  }, []);

  const handleOktaLogin = () => {
    // Okta 로그인 페이지로 리다이렉트
    window.location.href = `${API_BASE_URL}/auth/okta`;
  };

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await login({ email, password, rememberEmail });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "로그인에 실패했습니다.";
      setErrorMessage(message);
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
            {(errorMessage || loginError) && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {errorMessage || loginError?.message}
              </div>
            )}

            {/* 로그인 버튼 */}
            <Button type="submit" fullWidth disabled={isLoggingIn}>
              {isLoggingIn ? "로그인 중..." : "로그인"}
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
