import { useState, useEffect } from "react";
import {
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target,
  Activity,
  TrendingUp,
  Award,
  Users,
  GitPullRequest,
  PieChart,
} from "lucide-react";

const IMAGES = {
  dashboard: "/help/home-dashboard.png",
  codeReview: "/help/codereview.png",
  orgChart: "/help/orgchart.png",
};

interface Highlight {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TutorialStep {
  step: number;
  title: string;
  icon: React.ElementType;
  iconBg: string;
  description: string;
  image: keyof typeof IMAGES;
  highlight: Highlight | null;
}

const tutorialSteps: TutorialStep[] = [
  {
    step: 1,
    title: "Barcode Plus에 오신 것을 환영합니다!",
    icon: HelpCircle,
    iconBg: "bg-orange-500",
    description:
      "홈(대시보드)에서 전사 BDPI와 주요 지표를 한 화면에서 확인할 수 있습니다.",
    image: "dashboard",
    highlight: null,
  },
  {
    step: 2,
    title: "BDPI 점수",
    icon: BarChart3,
    iconBg: "bg-blue-600",
    description:
      "BDPI(Bithumb Development Productivity Index)란, 코드품질/리뷰품질/개발효율을 종합 측정하는 빗썸 개발생산성 지수입니다. 전사 BDPI 점수는 조회 월 기준으로 코드품질/리뷰품질/개발효율 3개 범주의 전사 점수를 동일 가중치로 평균한 종합 지수(%)입니다. 해당 영역에서는 전사 종합 점수와 전월 대비 증감(이번 달 점수 − 전월 점수)을 함께 확인할 수 있습니다.",
    image: "dashboard",
    highlight: { x: 2, y: 10, width: 18, height: 27 },
  },
  {
    step: 3,
    title: "BDPI 구성 요소 (3가지 영역)",
    icon: PieChart,
    iconBg: "bg-indigo-500",
    description:
      "BDPI는 코드품질/리뷰품질/개발효율 3개 범주 점수로 구성됩니다. 각 도넛 차트는 해당 범주의 가중 평균 점수를 보여주며, 하단의 'X/Y개 달성'은 '해당 영역 내 지표 중 목표값의 100% 이상을 달성한 지표 수/전체 지표 수'입니다. 리뷰품질의 '상세보기' 버튼을 클릭하면 '코드 리뷰 진행 현황' 모달창에서 리뷰품질 근거 데이터를 확인할 수 있습니다.",
    image: "dashboard",
    highlight: { x: 20, y: 10, width: 54.5, height: 27 },
  },
  {
    step: 4,
    title: "서비스 안정성",
    icon: Activity,
    iconBg: "bg-green-500",
    description:
      "서비스 운영 관련 핵심 지표(배포 빈도, 배포 성공률, 장애 해결 시간, 장애 탐지 시간, 장애 해결 수)를 조회 월 기준으로 집계해 표시합니다. 아이콘(✓/!/×)은 목표 달성 여부를 의미하며, 하단에는 전월 대비 증감(이번 달 점수 − 전월 점수)이 함께 표시됩니다.",
    image: "dashboard",
    highlight: { x: 2, y: 40, width: 72.5, height: 22 },
  },
  {
    step: 5,
    title: "개발생산성 트렌드",
    icon: TrendingUp,
    iconBg: "bg-purple-500",
    description:
      "최근 6개월 BDPI 평균 및 범주별 점수 추이를 확인할 수 있습니다. 그래프에 마우스를 올리면 월별 BDPI 평균과 코드품질/리뷰품질/개발효율 점수, 목표치 정보를 함께 확인할 수 있습니다.",
    image: "dashboard",
    highlight: { x: 2, y: 65, width: 72.5, height: 34 },
  },
  {
    step: 6,
    title: "목표 달성률",
    icon: Target,
    iconBg: "bg-cyan-500",
    description:
      "조회 월 기준, 전체 지표 중 목표값의 100% 이상을 달성한 지표의 비율을 도넛 차트로 표시합니다. 차트 하단의 'X/Y개 달성'은 '전체 지표 중 목표값의 100% 이상을 달성한 지표 수/전체 지표 수'입니다.",
    image: "dashboard",
    highlight: { x: 77, y: 10, width: 22, height: 28 },
  },
  {
    step: 7,
    title: "우수/위험 지표 TOP 5",
    icon: Award,
    iconBg: "bg-amber-500",
    description:
      "조회 월 기준 각 지표의 목표 대비 달성률을 기준으로 우수/위험 지표를 각각 상위 5개씩 보여줍니다. 지표명 우측의 수치(%)는 달성률 값이며, 우수 지표는 달성률이 높은 순, 위험 지표는 달성률이 낮은 순으로 정렬됩니다.",
    image: "dashboard",
    highlight: { x: 77, y: 42, width: 22, height: 42 },
  },
  {
    step: 8,
    title: "조직도",
    icon: Users,
    iconBg: "bg-teal-500",
    description:
      "홈(대시보드) 상단의 '조직도' 아이콘을 클릭하면, '조직도' 모달창에서 선택한 월 기준으로 실/팀 조직 구성과 변경 이력을 확인할 수 있습니다. LDAP 동기화 업데이트 시간도 확인 가능하며, 필요 시 [설정 > 조직도 관리]에서 수동 변경할 수 있습니다.",
    image: "orgChart",
    highlight: null,
  },
  {
    step: 9,
    title: "코드 리뷰 진행 현황",
    icon: GitPullRequest,
    iconBg: "bg-pink-500",
    description:
      "리뷰품질의 '상세보기' 버튼을 클릭하면, '코드 리뷰 진행 현황' 모달창에서 전체 MR 기준 리뷰 완료/미완료 현황과 진행률을 확인할 수 있습니다. 하단 목록에서 수집일자, MR ID, 작성자, 등록 리뷰어/실제 참여자 수, 상태를 확인할 수 있으며, MR ID 클릭 시 GitLab 링크로 이동합니다. 'Raw Data'에서 원천 데이터를 확인할 수 있습니다.",
    image: "codeReview",
    highlight: null,
  },
  {
    step: 10,
    title: "튜토리얼 완료!",
    icon: HelpCircle,
    iconBg: "bg-orange-500",
    description:
      "튜토리얼이 완료되었습니다. 우측 상단의 [?] 버튼을 클릭하면 단계별 튜토리얼을 언제든 다시 볼 수 있습니다.",
    image: "dashboard",
    highlight: null,
  },
];

const HighlightOverlay = ({ highlight }: { highlight: Highlight | null }) => {
  if (!highlight) return null;
  const { x, y, width, height } = highlight;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute bg-black/60"
        style={{ left: 0, top: 0, right: 0, height: `${y}%` }}
      />
      <div
        className="absolute bg-black/60"
        style={{
          left: 0,
          top: `${y}%`,
          width: `${x}%`,
          height: `${height}%`,
        }}
      />
      <div
        className="absolute bg-black/60"
        style={{
          left: `${x + width}%`,
          top: `${y}%`,
          right: 0,
          height: `${height}%`,
        }}
      />
      <div
        className="absolute bg-black/60"
        style={{ left: 0, top: `${y + height}%`, right: 0, bottom: 0 }}
      />
      <div
        className="absolute rounded-lg"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: `${width}%`,
          height: `${height}%`,
          border: "3px solid #f97316",
          boxShadow:
            "0 0 0 4px rgba(249, 115, 22, 0.3), 0 0 30px rgba(249, 115, 22, 0.5)",
          animation: "dashboardTutorialPulse 2s infinite",
        }}
      />
      <style>{`
        @keyframes dashboardTutorialPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

interface DashboardTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardTutorialModal = ({
  isOpen,
  onClose,
}: DashboardTutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = tutorialSteps.length;
  const current = tutorialSteps[currentStep];
  const IconComponent = current.icon;

  const handleNext = () =>
    currentStep < totalSteps - 1
      ? setCurrentStep(currentStep + 1)
      : handleClose();
  const handlePrev = () =>
    currentStep > 0 && setCurrentStep(currentStep - 1);
  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight")
        setCurrentStep((s) => (s < totalSteps - 1 ? s + 1 : (onClose(), 0)));
      if (e.key === "ArrowLeft")
        setCurrentStep((s) => (s > 0 ? s - 1 : s));
      if (e.key === "Escape") { setCurrentStep(0); onClose(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, totalSteps, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-7xl w-full overflow-hidden">
        {/* 상단 컬러 바 */}
        <div className={`h-2 ${current.iconBg}`} />

        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 ${current.iconBg} rounded-xl flex items-center justify-center`}
            >
              <IconComponent size={20} className="text-white" />
            </div>
            <div>
              <div className="text-orange-500 font-bold text-xs">
                STEP {current.step}/{totalSteps}
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {current.title}
              </h2>
            </div>
          </div>

          {/* 이미지 영역 */}
          <div className="relative bg-white rounded-xl overflow-hidden mb-4 flex items-center justify-center">
            <div className="relative inline-block">
              <img
                src={IMAGES[current.image]}
                alt="Tutorial"
                className="block w-auto h-auto max-h-[65vh] max-w-full"
              />
              <HighlightOverlay highlight={current.highlight} />
            </div>
          </div>

          {/* 설명 */}
          <p className="text-gray-600 text-sm leading-relaxed mb-5 bg-gray-50 p-4 rounded-lg border-l-4 border-orange-400">
            {current.description}
          </p>

          {/* 하단 네비게이션 */}
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-4">
              {/* 도트 인디케이터 */}
              <div className="flex gap-1">
                {tutorialSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentStep
                        ? "bg-orange-500 w-4"
                        : "bg-gray-300 hover:bg-gray-400 w-2"
                    }`}
                  />
                ))}
              </div>

              {/* 이전/다음 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} /> 이전
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-5 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {currentStep === totalSteps - 1 ? "완료" : "다음"}
                  {currentStep < totalSteps - 1 && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
