import { Home, FolderKanban, Users, BarChart3, Settings } from "lucide-react";

interface SidebarProps {
  activeMenu?: string;
}

const menuItems = [
  { id: "home", label: "홈", icon: Home },
  { id: "projects", label: "프로젝트", icon: FolderKanban },
  { id: "organization", label: "조직", icon: Users },
  { id: "metrics", label: "지표 관리", icon: BarChart3 },
  { id: "settings", label: "설정", icon: Settings },
];

export default function Sidebar({ activeMenu = "home" }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-200">
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
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
