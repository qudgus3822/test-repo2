import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import GlobalErrorBoundary from "@/components/error/GlobalErrorBoundary";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/pages/login/LoginPage";
import LogoutPage from "@/pages/login/LogoutPage";
import DashboardPage from "@/pages/dashboard/Dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
    mutations: {
      retry: 0,
    },
  },
});

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
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Routes>
            {/* TODO:로그인 페이지 => user 권한에 따라 ProtectedRoute 처리 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
          </Routes>
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </GlobalErrorBoundary>
    </Suspense>
  );
}

export default App;
