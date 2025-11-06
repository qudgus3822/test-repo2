import {
  Home,
  FolderKanban,
  Users,
  BarChart3,
  Settings,
  TriangleAlert,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  activeMenu?: string;
}

const menuItems = [
  { id: "home", label: "홈", icon: Home, path: "/dashboard" },
  {
    id: "projects",
    label: "프로젝트/운영",
    icon: FolderKanban,
    path: "/projects",
  },
  {
    id: "organization",
    label: "조직 비교",
    icon: Users,
    path: "/organization",
  },
  {
    id: "incidents",
    label: "장애 관리",
    icon: TriangleAlert,
    path: "/incidents",
  },
  { id: "metrics", label: "지표 관리", icon: BarChart3, path: "/metrics" },
  { id: "settings", label: "설정", icon: Settings, path: "/settings" },
];

export default function Sidebar({ activeMenu }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 lg:w-[200px] xl:w-[260px] bg-white border-r border-[#E2E8F0] transition-all duration-300">
      <nav className="mt-20 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // 현재 경로와 메뉴 path를 비교하여 활성 상태 결정
          const isActive = activeMenu
            ? activeMenu === item.id
            : location.pathname === item.path ||
              (location.pathname === "/" && item.path === "/dashboard");

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors cursor-pointer
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
