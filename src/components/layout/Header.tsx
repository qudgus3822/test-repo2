import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoBlack from "@/assets/images/bithumb_logo_black_vertical.png";
import { useLastAggregatedAt } from "@/api/hooks/useLastAggregatedAt";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuth } from "@/api/hooks/useAuth";
import { Tooltip } from "@/components/ui/Tooltip";
import { BRAND_COLORS, TEXT_COLORS, SURFACE_COLORS } from "@/styles/colors";

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
    <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-[#E2E8F0] z-20">
      <div className="h-full flex items-center justify-between pl-6 pr-8">
        {/* 로고 */}
        <div className="flex items-center gap-3 w-16 lg:w-[200px] xl:w-[260px] h-[48px] flex-shrink-0 transition-all duration-300">
          <img src={logoBlack} alt="logo" className="w-12 h-12 flex-shrink-0" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 py-2 hidden lg:block whitespace-nowrap">
            Barcode <span style={{ color: BRAND_COLORS.primary }}>plus</span>
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
        <div className="flex items-center gap-5 h-[48px]">
          {/* 최근 업데이트 */}
          <div className="flex font-medium items-center gap-2 text-sm" style={{ color: TEXT_COLORS.tertiary }}>
            <span>최근 업데이트 :</span>
            <span>{lastUpdatedAt}</span>
          </div>

          {/* 구분선 */}
          <div className="h-3.5 w-px bg-gray-300" />

          {/* 사용자 프로필 + 로그아웃 버튼 */}
          <div className="flex items-center gap-2.5">
            {/* 사용자 프로필 */}
            <Tooltip content={user?.email || ""} direction="bottom" hideArrow fontSize="text-xs">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-7 h-7 rounded-full flex items-center justify-center group-hover:ring-2 group-hover:ring-gray-300 transition-all" style={{ backgroundColor: SURFACE_COLORS.cardBorder }}>
                  <User className="w-5 h-5" style={{ color: TEXT_COLORS.tertiary }} />
                </div>
                {user && (
                  <span className="text-sm text-gray-900 flex items-center gap-0.5 group-hover:underline">
                    <span className="font-bold">{user.name}</span>
                    <span className="font-normal" style={{ color: TEXT_COLORS.tertiary }}>님</span>
                  </span>
                )}
              </div>
            </Tooltip>

            {/* 로그아웃 버튼 */}
            {user && (
              <Tooltip content="로그아웃" direction="bottom" hideArrow fontSize="text-xs" noWrap>
                <button
                  onClick={handleProfileClick}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5" style={{ color: TEXT_COLORS.tertiary }} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
