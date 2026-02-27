import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/libs/react-query";
import GlobalErrorBoundary from "@/components/error/GlobalErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/pages/login/LoginPage";
import LogoutPage from "@/pages/login/LogoutPage";
import DashboardPage from "@/pages/dashboard/Dashboard";
import MetricsPage from "@/pages/metrics/Metrics";
import ProjectsPage from "@/pages/projects/Projects";
import OrganizationPage from "@/pages/organization/Organization";
import SettingsPage from "@/pages/settings/Settings";
import RawDataViewer from "@/pages/raw-data/RawDataViewer";

function App() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading</p>
          </div>
        </div>
      }
    >
      <GlobalErrorBoundary>
        <QueryProvider>
          <Toaster />
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/raw-data/:mrId" element={<RawDataViewer />} />

            {/* 보호된 라우트 - 로그인 필요 */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                {/* 대시보드 홈 */}
                <Route path="/dashboard" element={<DashboardPage />} />
                {/* M2 이후 작업할 페이지 */}
                {/* 프로젝트/운영 */}
                <Route path="/projects" element={<ProjectsPage />} />
                {/* 조직 비교 */}
                <Route path="/organization" element={<OrganizationPage />} />
                {/* 지표 관리 */}
                <Route path="/metrics" element={<MetricsPage />} />
                {/* 설정 */}
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </QueryProvider>
      </GlobalErrorBoundary>
    </Suspense>
  );
}

export default App;
