import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import {
  useMetricOrder,
  organizationTreeKeys,
} from "@/api/hooks/useOrganizationTree";

/**
 * 조직 페이지 진입 시 초기화 로직 훅
 * - 당월, 전체 탭으로 설정
 * - 드래그 플래그 초기화
 * - 실제값 모드로 설정
 * - 조직 관련 쿼리 캐시 무효화
 * - 서버에서 저장된 지표 순서 동기화
 */
export const usePageInitialization = () => {
  // [변경: 2026-01-25 15:30, 김병현 수정] useShallow를 사용하여 store 상태 한번에 선언
  const {
    setPeriod,
    setCurrentDate,
    setActiveTab,
    setIsMetricColumnDragged,
    setDisplayMode,
    setMetricOrder,
  } = useOrganizationStore(
    useShallow((state) => ({
      setPeriod: state.setPeriod,
      setCurrentDate: state.setCurrentDate,
      setActiveTab: state.setActiveTab,
      setIsMetricColumnDragged: state.setIsMetricColumnDragged,
      setDisplayMode: state.setDisplayMode,
      setMetricOrder: state.setMetricOrder,
    })),
  );

  const queryClient = useQueryClient();

  // [변경: 2026-01-22, 김병현 수정] 서버에서 저장된 지표 순서 조회
  const { data: metricOrderData } = useMetricOrder();

  // 페이지 진입 시 초기화: 당월, 전체 탭으로 설정
  useEffect(() => {
    setPeriod("monthly");
    setCurrentDate(new Date());
    setActiveTab("all");
    // 드래그 플래그 초기화
    setIsMetricColumnDragged(false);
    // [변경: 2026-01-22 16:00, 김병현 수정] 페이지 진입 시 실제값 모드로 설정
    setDisplayMode("value");
    // 조직 관련 쿼리 캐시 무효화하여 최신 데이터 조회
    queryClient.invalidateQueries({ queryKey: organizationTreeKeys.all });
  }, [
    setPeriod,
    setCurrentDate,
    setActiveTab,
    setIsMetricColumnDragged,
    setDisplayMode,
    queryClient,
  ]);

  // [변경: 2026-01-22, 김병현 수정] 서버에서 저장된 지표 순서를 스토어에 동기화
  useEffect(() => {
    if (metricOrderData?.order && metricOrderData.order.length > 0) {
      setMetricOrder(metricOrderData.order);
    }
  }, [metricOrderData, setMetricOrder]);
};
