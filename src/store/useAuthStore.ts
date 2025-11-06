import { create } from "zustand";
// import { persist } from "zustand/middleware";
import type { User } from "@/types/auth";

interface AuthStore {
  user: User | null;
}

interface AuthAction {
  setLoggedIn: (user: User) => void;
  setLoggedOut: () => void;
  updateUser: (user: Partial<User>) => void;
}

/**
 * 인증 상태 관리 스토어 (Zustand - 메모리 전용)
 *
 * 보안상의 이유로 localStorage persist를 비활성화했습니다.
 * 사용자 정보는 메모리에만 저장되며, 새로고침 시 초기화됩니다.
 *
 * 사용법:
 * ```tsx
 * const user = useAuthStore((state) => state.user);
 * const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
 * const setLoggedOut = useAuthStore((state) => state.setLoggedOut);
 * ```
 */
// 보안상의 이유로 localStorage 저장 기능을 주석처리했습니다.
// 필요시 아래 코드의 주석을 해제하고 export const useAuthStore를 persist로 감싸세요.
/*
// Date를 포함한 상태를 직렬화/역직렬화하는 커스텀 storage
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    const { state } = JSON.parse(str);
    if (state.user) {
      // Date 문자열을 Date 객체로 변환
      state.user.createdAt = new Date(state.user.createdAt);
      if (state.user.lastLoginAt) {
        state.user.lastLoginAt = new Date(state.user.lastLoginAt);
      }
    }
    return { state };
  },
  setItem: (name: string, value: { state: AuthStore & AuthAction }) => {
    const state = { ...value.state };
    if (state.user) {
      // Date 객체를 문자열로 변환
      state.user = {
        ...state.user,
        createdAt: state.user.createdAt.toISOString() as unknown as Date,
        lastLoginAt: state.user.lastLoginAt?.toISOString() as unknown as Date,
      };
    }
    localStorage.setItem(name, JSON.stringify({ state }));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};
*/

export const useAuthStore = create<AuthStore & AuthAction>((set) => ({
  user: null,

  /**
   * 로그인 상태 설정
   * @param user - 로그인한 사용자 정보
   */
  setLoggedIn: (user: User) => set({ user }),

  /**
   * 로그아웃 상태 설정
   */
  setLoggedOut: () => set({ user: null }),

  /**
   * 사용자 정보 업데이트
   * @param updatedUser - 업데이트할 사용자 정보 (부분 업데이트 가능)
   */
  updateUser: (updatedUser: Partial<User>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedUser } : null,
    })),
}));

// persist 버전 (보안상의 이유로 주석처리됨)
/*
export const useAuthStore = create(
  persist<AuthStore & AuthAction>(
    (set) => ({
      user: null,
      setLoggedIn: (user: User) => set({ user }),
      setLoggedOut: () => set({ user: null }),
      updateUser: (updatedUser: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: "barcode-plus-auth-storage",
      storage: customStorage,
    },
  ),
);
*/
