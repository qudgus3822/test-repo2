import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-16 lg:ml-[200px] xl:ml-[260px] pt-20 transition-all duration-300 min-h-screen">
        <div className="p-8 min-h-[calc(100vh-5rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
