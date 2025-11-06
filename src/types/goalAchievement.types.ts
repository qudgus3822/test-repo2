/**
 * 목표 달성률 데이터 타입
 */
export interface GoalAchievementRate {
  month: string; // 'YYYY-MM' 형식
  achievementRate: number; // 달성률 (%)
  achievedMetrics: number; // 달성한 지표 수
  totalMetrics: number; // 전체 지표 수
}
