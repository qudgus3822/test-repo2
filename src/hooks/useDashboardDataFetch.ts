import { useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  fetchCompanyQuality,
  fetchServiceStability,
  fetchDeveloperProductivity,
  fetchGoalAchievement,
  fetchMetricRankings,
} from "@/api/dashboard";

/**
 * 대시보드 데이터를 병렬로 fetch하여 store에 저장하는 custom hook
 * Promise.allSettled를 사용하여 일부 API 실패 시에도 성공한 데이터는 표시됩니다.
 * @param formattedMonth - YYYY-MM 형식의 월
 */
export const useDashboardDataFetch = (formattedMonth: string) => {
  const {
    setCompanyQualityData,
    setServiceStabilityData,
    setDeveloperProductivityData,
    setGoalAchievementData,
    setMetricRankingsData,
    setIsLoading,
    setError,
    clearErrors,
  } = useDashboardStore();

  useEffect(() => {
    if (!formattedMonth) return;

    const fetchAllData = async () => {
      // 로딩 시작
      setIsLoading(true);
      clearErrors();

      // 모든 API를 병렬로 호출 (Promise.allSettled 사용)
      const results = await Promise.allSettled([
        fetchCompanyQuality(formattedMonth),
        fetchServiceStability(formattedMonth),
        fetchDeveloperProductivity(formattedMonth),
        fetchGoalAchievement(formattedMonth),
        fetchMetricRankings(formattedMonth, "all"),
      ]);

      // 전사 BDPI 데이터 처리
      if (results[0].status === "fulfilled" && results[0].value) {
        setCompanyQualityData(results[0].value);
        setError("companyQuality", null);
      } else if (results[0].status === "rejected") {
        const errorMessage =
          results[0].reason?.message || "전사 BDPI 데이터를 불러오는데 실패했습니다.";
        console.error("전사 BDPI 데이터 조회 실패:", results[0].reason);
        setError("companyQuality", errorMessage);
      }

      // 서비스 안정성 데이터 처리
      if (results[1].status === "fulfilled" && results[1].value) {
        setServiceStabilityData(results[1].value);
        setError("serviceStability", null);
      } else if (results[1].status === "rejected") {
        const errorMessage =
          results[1].reason?.message ||
          "서비스 안정성 데이터를 불러오는데 실패했습니다.";
        console.error("서비스 안정성 데이터 조회 실패:", results[1].reason);
        setServiceStabilityData(null);
        setError("serviceStability", errorMessage);
      }

      // 개발 생산성 트렌드 데이터 처리
      if (results[2].status === "fulfilled" && results[2].value) {
        setDeveloperProductivityData(results[2].value);
        setError("developerProductivity", null);
      } else if (results[2].status === "rejected") {
        const errorMessage =
          results[2].reason?.message ||
          "개발 생산성 트렌드 데이터를 불러오는데 실패했습니다.";
        console.error("개발 생산성 트렌드 데이터 조회 실패:", results[2].reason);
        setDeveloperProductivityData(null);
        setError("developerProductivity", errorMessage);
      }

      // 목표 달성률 데이터 처리
      if (results[3].status === "fulfilled" && results[3].value) {
        setGoalAchievementData(results[3].value);
        setError("goalAchievement", null);
      } else if (results[3].status === "rejected") {
        const errorMessage =
          results[3].reason?.message ||
          "목표 달성률 데이터를 불러오는데 실패했습니다.";
        console.error("목표 달성률 데이터 조회 실패:", results[3].reason);
        setGoalAchievementData(null);
        setError("goalAchievement", errorMessage);
      }

      // 지표 순위 데이터 처리
      if (results[4].status === "fulfilled" && results[4].value) {
        setMetricRankingsData(results[4].value);
        setError("metricRankings", null);
      } else if (results[4].status === "rejected") {
        const errorMessage =
          results[4].reason?.message ||
          "지표 순위 데이터를 불러오는데 실패했습니다.";
        console.error("지표 순위 데이터 조회 실패:", results[4].reason);
        setMetricRankingsData(null);
        setError("metricRankings", errorMessage);
      }

      // 로딩 종료
      setIsLoading(false);
    };

    fetchAllData();
  }, [
    formattedMonth,
    setCompanyQualityData,
    setServiceStabilityData,
    setDeveloperProductivityData,
    setGoalAchievementData,
    setMetricRankingsData,
    setIsLoading,
    setError,
    clearErrors,
  ]);
};
