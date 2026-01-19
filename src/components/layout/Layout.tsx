import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  const location = useLocation();
  // [변경: 2026-01-19 00:00, 김병현 수정] Dashboard 페이지는 기존 스크롤 레이아웃 유지
  const isDashboard =
    location.pathname === "/" || location.pathname === "/dashboard";

  return (
    // [변경: 2026-01-19 00:00, 김병현 수정] 100vh 고정 높이로 변경하여 화면 전체 스크롤 방지 (Dashboard 제외)
    <div
      className={
        isDashboard ? "min-h-screen bg-gray-50" : "h-screen overflow-hidden bg-gray-50"
      }
    >
      {/* Header */}
      <Header />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`ml-16 lg:ml-[200px] xl:ml-[260px] pt-20 transition-all duration-300 ${
          isDashboard ? "min-h-screen" : "h-screen overflow-hidden"
        }`}
      >
        <div
          className={`p-8 ${
            isDashboard
              ? "min-h-[calc(100vh-5rem)]"
              : "h-[calc(100vh-5rem)] overflow-hidden flex flex-col"
          }`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
