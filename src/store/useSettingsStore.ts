import { create } from "zustand";

interface SettingsStore {
  /**
   * 조직도 변경 히스토리 모달 열림 여부
   */
  isOrgHistoryModalOpen: boolean;
}

interface SettingsAction {
  /**
   * 조직도 변경 히스토리 모달 열기
   */
  openOrgHistoryModal: () => void;
  /**
   * 조직도 변경 히스토리 모달 닫기
   */
  closeOrgHistoryModal: () => void;
}

const initState: SettingsStore = {
  isOrgHistoryModalOpen: false,
};

export const useSettingsStore = create<SettingsStore & SettingsAction>(
  (set) => ({
    ...initState,
    openOrgHistoryModal: () => set({ isOrgHistoryModalOpen: true }),
    closeOrgHistoryModal: () => set({ isOrgHistoryModalOpen: false }),
  }),
);
