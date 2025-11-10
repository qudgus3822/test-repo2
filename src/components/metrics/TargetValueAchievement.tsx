interface TargetValueAchievementProps {
  achieved: number;
  total: number;
}

export const TargetValueAchievement = ({
  achieved,
  total,
}: TargetValueAchievementProps) => {
  const percentage = ((achieved / total) * 100).toFixed(1);
  const strokeDasharray = 2 * Math.PI * 80; // 원의 둘레 (반지름 80)
  const strokeDashoffset =
    strokeDasharray - (strokeDasharray * achieved) / total;

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">목표 달성률</h3>
      <div className="flex flex-col items-center">
        <div className="relative lg:w-48 lg:h-48 md:w-40 md:h-40 w-32 h-32">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 200 200"
          >
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="16"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="16"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                {percentage}%
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            {achieved}/{total} 지표 달성
          </div>
        </div>
      </div>
    </>
  );
};
