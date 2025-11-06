import {
  Home,
  FolderKanban,
  Users,
  BarChart3,
  Settings,
  TriangleAlert,
} from "lucide-react";

interface SidebarProps {
  activeMenu?: string;
}

const menuItems = [
  { id: "home", label: "홈", icon: Home },
  { id: "projects", label: "프로젝트/운영", icon: FolderKanban },
  { id: "organization", label: "조직 비교", icon: Users },
  { id: "projects", label: "장애 관리", icon: TriangleAlert },
  { id: "metrics", label: "지표 관리", icon: BarChart3 },
  { id: "settings", label: "설정", icon: Settings },
];

export default function Sidebar({ activeMenu = "home" }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 lg:w-[200px] xl:w-[260px] bg-white border-r border-[#E2E8F0] transition-all duration-300">
      <nav className="mt-20 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`
                flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium hidden lg:block">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
