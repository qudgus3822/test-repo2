import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/libs/react-query";
import GlobalErrorBoundary from "@/components/error/GlobalErrorBoundary";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/pages/login/LoginPage";
import LogoutPage from "@/pages/login/LogoutPage";
import DashboardPage from "@/pages/dashboard/Dashboard";
import MetricsPage from "@/pages/metrics/Metrics";
import ProjectsPage from "@/pages/projects/Projects";
import OrganizationPage from "@/pages/organization/Organization";
import IncidentsPage from "@/pages/incidents/Incidents";
import SettingsPage from "@/pages/settings/Settings";

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
            {/* TODO:로그인 페이지 => user 권한에 따라 ProtectedRoute 처리 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              {/* 대시보드 홈 */}
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* 지표 관리 */}
              <Route path="/metrics" element={<MetricsPage />} />

              {/* M2 이후 작업할 페이지 */}
              {/* 프로젝트/운영 */}
              <Route path="/projects" element={<ProjectsPage />} />
              {/* 조직 비교 */}
              <Route path="/organization" element={<OrganizationPage />} />
              {/* 장애 관리 */}
              <Route path="/incidents" element={<IncidentsPage />} />
              {/* 설정 */}
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </QueryProvider>
      </GlobalErrorBoundary>
    </Suspense>
  );
}

export default App;
