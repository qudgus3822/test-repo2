import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import eslint from "vite-plugin-eslint2";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    eslint({
      cache: false, // 캐시 비활성화로 항상 최신 검사 수행
      fix: false, // 자동 수정 비활성화 (필요시 true로 변경)
      lintOnStart: true, // 시작 시 전체 린트 실행
      emitError: true, // 에러를 콘솔에 출력
      emitWarning: true, // 경고를 콘솔에 출력
    }),
  ],
  server: {
    host: "0.0.0.0", // ngrok 사용을 위해 모든 네트워크 인터페이스에서 수신
    port: 5173,
    strictPort: true, // 포트가 이미 사용 중이면 실패
    allowedHosts: [".ngrok-free.dev", ".ngrok.io"], // ngrok 도메인 허용
    hmr: {
      // ngrok 사용 시에만 clientPort: 443 설정
      // 로컬 개발 시에는 기본값(5173) 사용
      // 환경 변수 VITE_USE_NGROK=true로 설정하면 ngrok 모드 활성화
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
