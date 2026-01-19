import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  const location = useLocation();
  // [변경: 2026-01-19 18:30, 김병현 수정] /organization 페이지만 고정 높이 적용
  const isFixHeight = location.pathname === "/organization";

  return (
    // [변경: 2026-01-19 00:00, 김병현 수정] 100vh 고정 높이로 변경하여 화면 전체 스크롤 방지 (Dashboard 제외)
    <div
      className={
        isFixHeight
          ? "min-h-screen bg-gray-50"
          : "h-screen overflow-hidden bg-gray-50"
      }
    >
      {/* Header */}
      <Header />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`ml-16 lg:ml-[200px] xl:ml-[260px] pt-20 transition-all duration-300 ${
          isFixHeight ? "h-screen overflow-hidden" : "min-h-screen"
        }`}
      >
        <div
          className={`p-8 ${
            isFixHeight
              ? "h-[calc(100vh-5rem)] overflow-hidden flex flex-col"
              : "min-h-[calc(100vh-5rem)]"
          }`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
