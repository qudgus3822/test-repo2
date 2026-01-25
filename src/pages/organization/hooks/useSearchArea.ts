import { useState, useEffect, useCallback } from "react";
import type { FlatViewFilterType } from "@/components/organization";

interface UseSearchAreaParams {
  viewType: "hierarchy" | "flat";
  flatViewFilter: FlatViewFilterType;
}

/**
 * 검색 영역 상태 관리 훅
 * - 검색 영역 표시/숨김
 * - 검색 입력값
 * - 활성 검색 키워드
 * - 검색 결과 개수
 * - 필터/뷰타입 변경 시 검색어 초기화
 */
export const useSearchArea = ({
  viewType,
  flatViewFilter,
}: UseSearchAreaParams) => {
  // 검색 영역 표시 상태
  const [isSearchAreaOpen, setIsSearchAreaOpen] = useState(false);

  // 검색 입력 상태 (검색 영역 내 input)
  const [searchInput, setSearchInput] = useState("");

  // 실제 검색에 사용되는 키워드 (검색 버튼 클릭 또는 엔터 시 업데이트)
  const [activeSearchKeyword, setActiveSearchKeyword] = useState("");

  // 검색 결과 개수
  const [searchResultCount, setSearchResultCount] = useState<number | null>(
    null,
  );

  // 검색어 초기화 함수
  const resetSearch = useCallback(() => {
    setSearchInput("");
    setActiveSearchKeyword("");
    setSearchResultCount(null);
  }, []);

  // 검색 실행 핸들러
  const handleSearch = useCallback(() => {
    setActiveSearchKeyword(searchInput.trim());
  }, [searchInput]);

  // 검색 입력 엔터 핸들러
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch],
  );

  // 플랫뷰 필터 변경 시 검색어 초기화
  useEffect(() => {
    resetSearch();
  }, [flatViewFilter, resetSearch]);

  // 검색 영역 닫힐 때 검색어 초기화
  useEffect(() => {
    if (!isSearchAreaOpen) {
      resetSearch();
    }
  }, [isSearchAreaOpen, resetSearch]);

  // 뷰타입 변경 시 검색어 초기화 및 검색 영역 숨김
  useEffect(() => {
    resetSearch();
    setIsSearchAreaOpen(false);
  }, [viewType, resetSearch]);

  return {
    isSearchAreaOpen,
    setIsSearchAreaOpen,
    searchInput,
    setSearchInput,
    activeSearchKeyword,
    searchResultCount,
    setSearchResultCount,
    handleSearch,
    handleSearchKeyDown,
  };
};
