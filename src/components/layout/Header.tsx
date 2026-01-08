import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoBlack from "@/assets/images/bithumb_logo_black_vertical.png";
import { useLastAggregatedAt } from "@/api/hooks/useLastAggregatedAt";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuth } from "@/api/hooks/useAuth";

export default function Header() {
  const { formattedDate: lastUpdatedAt } = useLastAggregatedAt();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuth();

  const handleProfileClick = () => {
    if (user) {
      // 로그인 상태: 로그아웃 확인
      if (window.confirm("로그아웃 하시겠습니까?")) {
        logout();
      }
    } else {
      // 비로그인 상태: 로그인 페이지 이동 확인
      if (window.confirm("로그인 페이지로 이동하시겠습니까?")) {
        navigate("/login");
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-[#E2E8F0] z-10">
      <div className="h-full flex items-center justify-between px-6">
        {/* 로고 */}
        <div className="flex items-center gap-3 w-16 lg:w-[200px] xl:w-[260px] transition-all duration-300">
          <img src={logoBlack} alt="logo" className="w-12 h-12 flex-shrink-0" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 py-2 hidden lg:block">
            Barcode <span className="text-[#FF6C00]">plus</span>
          </h1>
        </div>

        {/* 검색바 */}
        {/* <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="프로젝트, 팀, 개인 검색..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div> */}

        {/* 우측 메뉴 */}
        <div className="flex items-center gap-6">
          {/* 최근 업데이트 */}
          <div className="text-right text-sm">
            <p className="text-gray-500">최근 업데이트</p>
            <p className="text-gray-900">{lastUpdatedAt}</p>
          </div>

          {/* 알림 아이콘 */}
          {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-700" />
          </button> */}

          {/* 사용자 프로필 */}
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-[#E2E8F0] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            {user && (
              <span className="text-sm font-medium text-gray-900">
                {user.name}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
