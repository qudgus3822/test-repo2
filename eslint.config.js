import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
  // ESLint 검사 제외 대상
  globalIgnores([
    "dist",             // 빌드 결과물
    "build",            // 빌드 디렉토리
    "node_modules",     // 의존성 패키지
    "coverage",         // 테스트 커버리지
    ".vscode",          // VS Code 설정
    ".github",          // GitHub 설정
    "*.config.js",      // 설정 파일들 (vite.config.ts는 체크)
    "*.config.ts",      // TypeScript 설정 파일
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
]);
