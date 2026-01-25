import { useState, useCallback } from "react";
import type { OrganizationDetailItem } from "@/components/organization";

/**
 * 조직/멤버 상세 모달 상태 관리 훅
 */
export const useDetailModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<OrganizationDetailItem | null>(null);

  // 상세 버튼 클릭 핸들러
  const openModal = useCallback((item: OrganizationDetailItem) => {
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  // 모달 닫기 핸들러
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedItem(null);
  }, []);

  return {
    isOpen,
    selectedItem,
    openModal,
    closeModal,
  };
};
