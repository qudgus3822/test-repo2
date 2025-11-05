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
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
