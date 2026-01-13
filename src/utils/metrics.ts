import {
  MetricCategory,
  MetricStatus,
  type MetricsListData,
  type TargetValueMetric,
} from "@/types/metrics.types";
import type { ThresholdType } from "@/types/serviceStability.types";
import { CheckCircle2, AlertCircle, CircleX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { STATUS_COLORS, TEXT_COLORS, PALETTE_COLORS } from "@/styles/colors";

// ================================
// 지표 코드 → 지표명 매핑
// ================================

/**
 * 지표 코드를 `화면 노출 지표명`으로 매핑하는 객체
 *
 * @example
 * ```typescript
 * import { METRIC_CODE_NAMES } from "@/utils/metrics";
 *
 * const name = METRIC_CODE_NAMES["TECH_DEBT"];
 * // Returns: "기술부채"
 * ```
 */
export const METRIC_CODE_NAMES: Record<string, string> = {
  // 코드품질 (9개)
  TECH_DEBT: "기술부채",
  CODE_COMPLEXITY: "코드복잡도",
  CODE_DUPLICATION: "코드중복률",
  CODE_SMELL: "코드스멜",
  SECURITY_VULNERABILITIES: "보안취약점수",
  BUG_COUNT: "버그발생수",
  INCIDENT_COUNT: "장애발생수",
  TEST_COVERAGE: "테스트커버리지",
  CODE_DEFECT_DENSITY: "코드결함밀도",
  // 리뷰품질 (12개)
  REVIEW_SPEED: "리뷰속도",
  REVIEW_RESPONSE_RATE: "리뷰요청응답률",
  REVIEW_PARTICIPATION_RATE: "리뷰참여율",
  REVIEW_ACCEPTANCE_RATE: "리뷰제안수용률",
  REVIEW_FEEDBACK_CONCRETENESS: "피드백구체성",
  REVIEW_REQUEST_COUNT: "리뷰요청수",
  REVIEW_PARTICIPATION_COUNT: "리뷰참여수",
  REVIEW_PASS_RATE: "초회통과율",
  REVIEW_PARTICIPATION_NUMBER: "코드리뷰참여수치",
  REVIEW_FEEDBACK_TIME: "피드백반영시간",
  REVIEW_COMPLETION_TIME: "리뷰완료시간",
  REVIEW_REVIEWER_DIVERSE: "리뷰어다양성",
  // 개발효율 (9개)
  PR_SIZE: "MR크기",
  COMMIT_FREQUENCY: "커밋빈도",
  LOC_PER_COMMIT: "커밋당라인수",
  LEAD_TIME: "장애해결시간",
  FAILURE_DETECTION_TIME: "장애탐지시간",
  FAILURE_DIAGNOSIS_TIME: "장애진단시간",
  FAILURE_RECOVERY_TIME: "장애복구시간",
  DEPLOYMENT_FREQUENCY: "배포빈도",
  DEPLOYMENT_SUCCESS_RATE: "배포성공률",
};

/**
 * 지표 코드를 `테이블 헤더용 2줄 표시명`으로 매핑하는 객체
 * 80px 컬럼 너비에 맞게 줄바꿈 위치를 지정합니다.
 * 줄바꿈이 필요 없는 짧은 이름은 포함하지 않습니다.
 *
 * @example
 * ```typescript
 * import { METRIC_CODE_DISPLAY_NAMES } from "@/utils/metrics";
 *
 * const displayName = METRIC_CODE_DISPLAY_NAMES["LOC_PER_COMMIT"];
 * // Returns: ["커밋당", "라인수"]
 * ```
 */
export const METRIC_CODE_DISPLAY_NAMES: Record<string, [string, string]> = {
  // 코드품질
  CODE_COMPLEXITY: ["코드", "복잡도"],
  CODE_DUPLICATION: ["코드", "중복률"],
  SECURITY_VULNERABILITIES: ["보안", "취약점수"],
  BUG_COUNT: ["버그", "발생수"],
  INCIDENT_COUNT: ["장애", "발생수"],
  TEST_COVERAGE: ["테스트", "커버리지"],
  CODE_DEFECT_DENSITY: ["코드", "결함밀도"],
  // 리뷰품질
  REVIEW_RESPONSE_RATE: ["리뷰요청", "응답률"],
  REVIEW_PARTICIPATION_RATE: ["리뷰", "참여율"],
  REVIEW_ACCEPTANCE_RATE: ["리뷰제안", "수용률"],
  REVIEW_FEEDBACK_CONCRETENESS: ["피드백", "구체성"],
  REVIEW_REQUEST_COUNT: ["리뷰", "요청수"],
  REVIEW_PARTICIPATION_COUNT: ["리뷰", "참여수"],
  REVIEW_PASS_RATE: ["초회", "통과율"],
  REVIEW_PARTICIPATION_NUMBER: ["코드리뷰", "참여수치"],
  REVIEW_FEEDBACK_TIME: ["피드백", "반영시간"],
  REVIEW_COMPLETION_TIME: ["리뷰", "완료시간"],
  REVIEW_REVIEWER_DIVERSE: ["리뷰어", "다양성"],
  // 개발효율
  LOC_PER_COMMIT: ["커밋당", "라인수"],
  LEAD_TIME: ["평균장애", "해결시간"],
  FAILURE_DETECTION_TIME: ["장애", "탐지시간"],
  FAILURE_DIAGNOSIS_TIME: ["장애", "진단시간"],
  FAILURE_RECOVERY_TIME: ["장애", "복구시간"],
  DEPLOYMENT_SUCCESS_RATE: ["배포", "성공률"],
};

/**
 * 지표 코드를 `툴팁 설명`으로 매핑하는 객체 (짧은 설명)
 */
export const METRIC_CODE_TOOLTIP_DESCRIPTIONS: Record<string, string> = {
  // 코드품질 (9개)
  TECH_DEBT:
    "코드 품질 문제를 해결하는데 필요한 예상시간을 나타내는 지표입니다. 수치가 낮을수록 우수하며, 규모 대비 일정 비율 이하로 목표하는 것을 권장합니다.",
  CODE_COMPLEXITY:
    "코드의 복잡성을 나타내는 지표입니다. 수치가 낮을수록 이해하기 쉽고 유지보수가 용이합니다.",
  CODE_DUPLICATION:
    "전체 코드 중 중복된 코드의 비율입니다. 수치가 낮을수록 코드 재사용성과 유지보수성이 좋습니다. 일반적으로 5% 이하를 목표로 설정합니다.",
  CODE_SMELL:
    "잠재적 문제를 야기할 수 있는 코드 패턴의 수입니다. 수치가 낮을수록 좋으며, 주기적인 리팩토링을 통해 감소시키는 것을 권장합니다.",
  SECURITY_VULNERABILITIES:
    "코드 내 보안 취약점의 수입니다. 수치가 낮을수록 보안 수준이 높으며, Critical/High 등급은 즉시 해결을 권장합니다.",
  BUG_COUNT:
    "측정 기간 내 발생한 총 버그 수입니다. 수치가 낮을수록 코드 안정성이 높습니다. 이전 기간 대비 감소를 목표로 설정합니다.",
  INCIDENT_COUNT:
    "측정 기간 내 발생한 총 장애 수(P1~P3)입니다. 수치가 낮을수록 서비스 안정성이 높습니다. Zero-Incident를 목표로 설정하는 것을 권장합니다.",
  TEST_COVERAGE:
    "테스트 코드가 검증하는 소스코드의 비율입니다. 수치가 높을수록 코드 안정성이 높습니다. 일반적으로 80% 이상을 목표로 설정합니다.",
  CODE_DEFECT_DENSITY:
    "코드결함밀도(Defect Density)는 코드 1,000라인(KLOC)당 발견된 결함의 수입니다. 코드 규모에 상관없이 품질을 비교할 수 있는 표준화된 지표로, 프로젝트/모듈 간 품질 수준을 객관적으로 비교할 수 있습니다.",
  // 리뷰품질 (12개)
  REVIEW_SPEED:
    "리뷰어가 지정된 후 첫 번째 응답까지 걸린 시간입니다. 수치가 낮을수록 신속한 리뷰가 이루어지고 있습니다. 4시간 이내 70%, 24시간 이내 90% 응답을 목표로 권장합니다.",
  REVIEW_RESPONSE_RATE:
    "요청된 리뷰 중 제시간 내 응답한 비율입니다. 수치가 높을수록 리뷰 프로세스가 원활합니다. 80% 이상을 목표로 설정합니다.",
  REVIEW_PARTICIPATION_RATE:
    "팀원 중 코드 리뷰에 참여한 인원의 비율입니다. 수치가 높을수록 팀 전체가 코드 품질에 기여합니다. 70% 이상을 목표로 권장합니다.",
  REVIEW_ACCEPTANCE_RATE:
    "리뷰어의 제안 중 수용된 비율입니다. 적정 수준의 수용률은 건설적인 리뷰 문화를 반영합니다. 60~80%를 목표로 권장합니다.",
  REVIEW_FEEDBACK_CONCRETENESS:
    "전체 리뷰 코멘트 중 구체적 피드백의 비율입니다. 수치가 높을수록 실질적인 코드 개선에 기여합니다.",
  REVIEW_REQUEST_COUNT:
    "리뷰어가 1명 이상 할당된 MR 생성 수입니다. 팀의 코드 리뷰 문화 정착 정도를 파악할 수 있습니다.",
  REVIEW_PARTICIPATION_COUNT:
    "리뷰어로 지정받은 MR 중 다른 동료의 코드 리뷰에 참여하고 머지 완료된 건수입니다. 수치가 높을수록 팀 협업에 적극적으로 기여하고 있습니다.",
  REVIEW_PASS_RATE:
    "수정 요청 없이 첫 번째 제출로 승인된 MR 비율입니다. 수치가 높을수록 코드 작성 품질이 높습니다. ",
  REVIEW_PARTICIPATION_NUMBER:
    "리뷰어로 지정받은 MR 중 다른 동료의 코드 리뷰에 참여하고 머지 완료된 건수입니다. 수치가 높을수록 팀 협업에 적극적으로 기여하고 있습니다.",
  REVIEW_FEEDBACK_TIME:
    "리뷰어가 피드백 제시한 시점부터 해결 완료까지 걸린 시간입니다. 수치가 낮을수록 피드백 반영이 신속히 이루어지고 있습니다.",
  REVIEW_COMPLETION_TIME:
    "리뷰어가 첫 코멘트를 작성한 시점부터 승인까지 걸린 평균 시간(분)입니다. 수치가 낮을수록 리뷰 과정이 효율적으로 진행되고 있음을 의미합니다.",
  REVIEW_REVIEWER_DIVERSE:
    "리뷰어 분산 정도를 지니계수로 측정한 지표입니다. 수치가 낮을수록 리뷰가 특정 인원에게 집중되지 않고 고르게 분산됨을 의미합니다.",
  // 개발효율 (9개)
  PR_SIZE:
    "Merge Request당 변경된 코드 라인 수입니다. 적정 크기(100~300 라인)를 유지할수록 리뷰 품질이 향상됩니다.",
  COMMIT_FREQUENCY:
    "측정 기간 내 커밋 총 횟수입니다. 적정 수준의 커밋 빈도는 작은 단위의 작업 습관을 반영합니다.",
  LOC_PER_COMMIT:
    "커밋당 평균 변경 라인 수입니다. 수치가 작을수록 추적이 쉬우며 관리에 용이합니다.",
  LEAD_TIME:
    "장애 발생부터 서비스 복구까지 평균 소요 시간입니다. 수치가 낮을수록 장애 대응 역량이 높습니다. Elite 수준은 1시간 미만입니다.",
  FAILURE_DETECTION_TIME:
    "장애 발생부터 탐지까지 평균 소요 시간입니다. 수치가 낮을수록 모니터링 체계가 우수합니다.",
  FAILURE_DIAGNOSIS_TIME:
    "장애 탐지부터 원인 파악까지 소요 시간입니다. 수치가 낮을수록 장애 분석 역량이 높습니다.",
  FAILURE_RECOVERY_TIME:
    "장애 원인 파악 후 서비스 복구까지 소요 시간입니다. 수치가 낮을수록 복구 프로세스가 효율적입니다.",
  DEPLOYMENT_FREQUENCY:
    "측정 기간 내 배포 총 횟수입니다. 적정 수준의 배포 빈도는 지속적 배포 문화를 반영합니다. 팀 규모와 프로젝트 성격에 맞게 설정합니다.",
  DEPLOYMENT_SUCCESS_RATE:
    "롤백 또는 핫픽스 없이 성공한 배포의 비율입니다. 수치가 높을수록 배포 품질이 높습니다. 95% 이상을 목표로 권장합니다.",
};

/**
 * 지표 코드를 `상세 설명`으로 매핑하는 객체 (긴 설명)
 */
export const METRIC_CODE_DETAIL_DESCRIPTIONS: Record<string, string> = {
  // 코드품질 (9개)
  TECH_DEBT:
    "기술부채(Technical Debt)는 현재 코드베이스에서 이상적인 코드 품질 상태에 도달하기 위해 필요한 추가 작업을 시간으로 환산한 지표입니다. SonarQube의 정적 분석을 통해 코드 품질 문제를 식별하고, 각 문제를 해결하는 데 필요한 예상 시간을 합산하여 산출합니다.",
  CODE_COMPLEXITY:
    "코드복잡도(Cyclomatic Complexity)는 프로그램의 제어 흐름 복잡성을 수치화한 지표입니다. 분기문(if, switch, loop 등)의 수에 기반하여 계산되며, 복잡도가 높을수록 테스트와 유지보수가 어려워집니다.",
  CODE_DUPLICATION:
    "코드중복률(Code Duplication Rate)은 전체 코드 중 중복된 코드 블록이 차지하는 비율입니다. 중복 코드는 유지보수 비용을 증가시키고 버그 전파 위험을 높이므로, 공통 모듈화를 통해 지속적으로 개선해야 합니다.",
  CODE_SMELL:
    "코드스멜(Code Smell)은 버그는 아니지만 코드의 가독성, 유지보수성, 확장성을 저해하는 코드 패턴의 수입니다. 긴 메서드, 중복 코드, 복잡한 조건문, 매직 넘버 등이 대표적인 코드스멜 유형입니다.",
  SECURITY_VULNERABILITIES:
    "보안취약점수(Security Vulnerabilities)는 코드 내에서 발견된 보안 취약점의 총 개수입니다. SQL Injection, XSS, 하드코딩된 자격증명 등 보안 위협이 될 수 있는 코드 패턴을 탐지합니다.",
  BUG_COUNT:
    "버그 발생 건수(Bug Count)는 측정 기간 내 Jira에 등록된 Bug 타입 이슈의 총 개수입니다. 버그 발생 추이를 통해 릴리즈 품질과 테스트 충분성을 평가할 수 있습니다.",
  INCIDENT_COUNT:
    "장애 발생 건수(Incident Count)는 측정 기간 내 발생한 P1~P3 등급 장애의 총 개수입니다. 서비스 안정성의 핵심 지표로, 장애 발생 패턴 분석을 통해 예방 활동에 활용합니다.",
  TEST_COVERAGE:
    "테스트커버리지(Test Coverage)는 전체 소스코드 중 테스트 코드에 의해 실행되는 코드의 비율입니다. 커버리지가 높을수록 코드 변경 시 발생할 수 있는 버그를 사전에 발견할 가능성이 높아집니다.",
  CODE_DEFECT_DENSITY:
    "코드결함밀도(Defect Density)는 코드 1,000라인(KLOC)당 발견된 결함의 수입니다. 코드 규모에 상관없이 품질을 비교할 수 있는 표준화된 지표로, 프로젝트/모듈 간 품질 수준을 객관적으로 비교할 수 있습니다.",
  // 리뷰품질 (12개)
  REVIEW_SPEED:
    "리뷰속도(Review Response Time)는 MR에 리뷰어가 지정된 시점부터 첫 번째 리뷰 응답(코멘트 또는 승인)까지 걸린 시간입니다. 빠른 리뷰 응답은 개발 사이클 단축과 팀 협업 효율 향상에 기여합니다.",
  REVIEW_RESPONSE_RATE:
    "리뷰요청응답률(Review Request Response Rate)은 리뷰어로 지정된 요청 중 실제로 응답한 비율입니다. 리뷰 프로세스의 효율성과 리뷰어의 책임감을 측정하는 지표입니다.",
  REVIEW_PARTICIPATION_RATE:
    "리뷰참여율(Review Participation Rate)은 팀원 중 코드 리뷰에 참여한 인원의 비율입니다. 높은 참여율은 팀 전체가 코드 품질에 관심을 갖고 지식을 공유하고 있음을 의미합니다.",
  REVIEW_ACCEPTANCE_RATE:
    "리뷰제안수용률(Review Suggestion Acceptance Rate)은 리뷰어의 제안 중 코드에 반영된 비율입니다. 너무 높거나 낮지 않은 적정 수준이 건강한 리뷰 문화를 반영합니다.",
  REVIEW_FEEDBACK_CONCRETENESS:
    "리뷰피드백구체성(Review Feedback Specificity)은 전체 리뷰 코멘트 중 구체적이고 실질적인 피드백의 비율입니다. 단순 승인보다 개선 제안이나 중요 이슈 지적이 포함된 리뷰가 코드 품질 향상에 기여합니다.",
  REVIEW_REQUEST_COUNT:
    "리뷰요청건수(MR with Reviewer Count)는 리뷰어가 1명 이상 할당된 MR의 생성 수입니다. 코드 리뷰 문화가 얼마나 정착되었는지를 보여주는 지표입니다.",
  REVIEW_PARTICIPATION_COUNT: `리뷰 참여 건수는 개발자의 리뷰어 책임 이행률을 측정하는 지표입니다. 리뷰어로 공식 지정된 MR에 대해 실제로 댓글을 작성하여 리뷰를 수행하고, 해당 MR이 머지 완료된 경우만 유효한 참여로 인정합니다. 이를 통해 팀 내 코드 리뷰 문화의 활성화 정도와 개인별 리뷰 책임 이행도를 파악할 수 있습니다.

측정 지표 구성
value: 리뷰어로 지정되고 + 댓글 작성하고 + 머지된 MR 수
totalCount: 리뷰어로 지정된 전체 MR 수
validityRate: (value / totalCount) × 100`,
  REVIEW_PASS_RATE: `초회 통과율은 개발자가 작성한 코드의 초기 완성도를 측정하는 지표입니다. 리뷰 과정에서 추가 수정 없이 최초 제출 상태 그대로 승인된 MR만을 초회 통과로 인정하여, 코드의 품질 수준과 개발자의 사전 검토 역량을 평가합니다. 높은 초회 통과율은 코드 작성 단계에서 충분한 검토가 이루어졌음을 의미하며, 리뷰 사이클 단축과 개발 효율성 향상에 기여합니다.

측정 지표 구성
value: 초회 통과한 MR 수 (건수)
totalCount: 전체 MR 건수
validityRate: (초회 통과 MR 수 / totalCount) × 100`,
  REVIEW_PARTICIPATION_NUMBER:
    "코드리뷰참여수치(Review Participation Score)는 리뷰 참여 건수와 피드백 구체성을 종합한 복합 점수입니다. 단순히 많이 참여하는 것보다 질 높은 리뷰를 제공하는 것이 더 높은 점수를 받습니다.",
  REVIEW_FEEDBACK_TIME: `리뷰 피드백 반영 시간은 개발팀의 실질적인 피드백 처리 능력을 평가하는 지표입니다. 리뷰어가 Discussion을 통해 피드백을 제기한 시점부터 해당 피드백이 해결(resolved)되기까지의 시간을 추적하여, 개발자의 피드백 대응력과 팀의 협업 효율성을 측정합니다. 이를 통해 코드 리뷰 과정의 병목 구간을 파악하고 개발 프로세스 개선을 위한 데이터 기반 의사결정을 지원합니다.

  측정 지표 구성 value: 유효한 피드백의 평균 반영 시간 (분)
  totalCount: 전체 MR 건수
  validityRate: (유효 건수 / totalCount) × 100
  feedbackCount: 유효한 피드백 건수`,
  REVIEW_COMPLETION_TIME: `리뷰 완료 시간은 개발팀의 실질적인 리뷰 처리 능력을 평가하는 지표입니다. 리뷰어가 코드 검토를 시작한 시점(첫 코멘트)부터 최종 승인까지의 시간을 추적하여, 리뷰 과정에서 발생하는 지연이나 반복 수정 요청으로 인한 병목을 파악할 수 있습니다.
측정 지표 구성

value: 유효한 리뷰의 평균 완료 시간 (분)
totalCount: 리뷰어로 지정된 전체 MR 건수
validityRate: (유효 건수 / totalCount) × 100
reviewCount: 유효한 리뷰 건수`,
  REVIEW_REVIEWER_DIVERSE:
    "리뷰어다양성(Reviewer Diversity)은 리뷰어 할당이 특정 인원에게 집중되지 않고 고르게 분산되는 정도를 지니계수로 측정한 지표입니다. 낮을수록 리뷰 부담이 균등하게 분산됨을 의미합니다.",
  // 개발효율 (9개)
  PR_SIZE:
    "MR크기(MR Size)는 Merge Request당 변경된 코드 라인 수입니다. 적정 크기의 MR은 리뷰 품질을 높이고 버그 발생 가능성을 줄입니다. 너무 큰 MR은 리뷰가 어렵고, 너무 작으면 컨텍스트 파악이 어렵습니다.",
  COMMIT_FREQUENCY:
    "커밋빈도(Commit Frequency)는 측정 기간 내 코드 저장소에 커밋한 총 횟수입니다. 작고 잦은 커밋은 코드 변경 추적을 용이하게 하고 문제 발생 시 원인 파악을 쉽게 합니다.",
  LOC_PER_COMMIT:
    "커밋당 코드라인수(Lines of Code per Commit)는 커밋당 평균 변경된 코드 라인 수입니다. 작은 단위의 커밋은 코드 변경 히스토리를 명확하게 하고, 문제 발생 시 롤백 범위를 최소화합니다.",
  LEAD_TIME:
    "평균장애해결시간(Mean Time To Recovery)은 장애 발생부터 서비스가 정상 복구될 때까지의 평균 소요 시간입니다. DORA 메트릭의 핵심 지표로, 장애 대응 역량을 측정합니다.",
  FAILURE_DETECTION_TIME:
    "장애탐지시간(Mean Time To Detection)은 장애가 실제로 발생한 시점부터 장애를 인지하는 데까지 걸린 평균 시간입니다. 모니터링 체계의 효과성을 측정하는 지표입니다.",
  FAILURE_DIAGNOSIS_TIME:
    "장애진단시간(Time To Cause Identification)은 장애를 탐지한 시점부터 장애 원인을 파악하는 데까지 걸린 시간입니다. 로깅과 모니터링 수준, 시스템 이해도를 반영합니다.",
  FAILURE_RECOVERY_TIME:
    "장애복구시간(Time To Repair)은 장애 원인을 파악한 후 실제로 서비스가 복구되기까지 걸린 시간입니다. 롤백/핫픽스 역량과 복구 프로세스 효율성을 반영합니다.",
  DEPLOYMENT_FREQUENCY:
    "배포빈도(Deployment Frequency)는 측정 기간 내 프로덕션 환경에 배포한 총 횟수입니다. 잦은 소규모 배포는 변경 위험을 분산시키고 빠른 피드백을 가능하게 합니다. DORA 메트릭의 핵심 지표 중 하나입니다.",
  DEPLOYMENT_SUCCESS_RATE:
    "배포성공률(Deployment Success Rate)은 전체 배포 중 롤백이나 핫픽스 없이 성공적으로 완료된 배포의 비율입니다. ",
};

/**
 * 지표 코드를 `목표값 표시 문자열`로 매핑하는 객체
 */
export const METRIC_CODE_TARGETS: Record<string, string> = {
  // 코드품질 (9개)
  TECH_DEBT: "60분 이하",
  CODE_COMPLEXITY: "15 이하",
  CODE_DUPLICATION: "5% 이하",
  CODE_SMELL: "10개 이하",
  SECURITY_VULNERABILITIES: "0개",
  BUG_COUNT: "5개 이하",
  INCIDENT_COUNT: "0개",
  TEST_COVERAGE: "80% 이상",
  CODE_DEFECT_DENSITY: "1.0 이하",
  // 리뷰품질 (12개)
  REVIEW_SPEED: "3600초 이하",
  REVIEW_RESPONSE_RATE: "90% 이상",
  REVIEW_PARTICIPATION_RATE: "80% 이상",
  REVIEW_ACCEPTANCE_RATE: "70% 이상",
  REVIEW_FEEDBACK_CONCRETENESS: "80% 이상",
  REVIEW_REQUEST_COUNT: "10개 이상",
  REVIEW_PARTICIPATION_COUNT: "5개 이상",
  REVIEW_PASS_RATE: "70% 이상",
  REVIEW_PARTICIPATION_NUMBER: "80점 이상",
  REVIEW_FEEDBACK_TIME: "60분 이하",
  REVIEW_COMPLETION_TIME: "120분 이하",
  REVIEW_REVIEWER_DIVERSE: "80점 이상",
  // 개발효율 (9개)
  PR_SIZE: "400 LOC 이하",
  COMMIT_FREQUENCY: "5회 이상",
  LOC_PER_COMMIT: "200 LOC 이하",
  LEAD_TIME: "3600초 이하",
  FAILURE_DETECTION_TIME: "600초 이하",
  FAILURE_DIAGNOSIS_TIME: "1200초 이하",
  FAILURE_RECOVERY_TIME: "1800초 이하",
  DEPLOYMENT_FREQUENCY: "10개 이상",
  DEPLOYMENT_SUCCESS_RATE: "95% 이상",
};

/**
 * 지표 코드를 `계산식`으로 매핑하는 객체
 */
export const METRIC_CODE_FORMULAS: Record<string, string> = {
  // 코드품질 (9개)
  TECH_DEBT: "기술부채 = SonarQube에서 측정한 기술부채 시간",
  CODE_COMPLEXITY: "코드복잡도 = 순환복잡도(Cyclomatic Complexity) 평균값",
  CODE_DUPLICATION: "코드중복률 = (중복 코드 라인 수 ÷ 전체 코드 라인 수) × 100",
  CODE_SMELL: "코드스멜 = SonarQube에서 탐지한 코드스멜 수",
  SECURITY_VULNERABILITIES: "보안취약점수 = SonarQube에서 탐지한 보안취약점 수",
  BUG_COUNT: "버그발생수 = Jira Bug 타입 이슈 수",
  INCIDENT_COUNT: "장애발생수 = P1~P3 등급 장애 수",
  TEST_COVERAGE: "테스트커버리지 = (테스트된 코드 라인 수 ÷ 전체 코드 라인 수) × 100",
  CODE_DEFECT_DENSITY: "코드결함밀도 = (결함 수 ÷ 총 코드 라인 수) × 1000",
  // 리뷰품질 (12개)
  REVIEW_SPEED: "리뷰속도 = 리뷰어 지정 후 첫 응답까지 걸린 평균 시간",
  REVIEW_RESPONSE_RATE: "리뷰요청응답률 = (응답한 리뷰 수 ÷ 요청받은 리뷰 수) × 100",
  REVIEW_PARTICIPATION_RATE: "리뷰참여율 = (리뷰 참여 인원 ÷ 전체 팀원 수) × 100",
  REVIEW_ACCEPTANCE_RATE: "리뷰제안수용률 = (수용된 제안 수 ÷ 전체 제안 수) × 100",
  REVIEW_FEEDBACK_CONCRETENESS: "피드백구체성 = (구체적 피드백 수 ÷ 전체 피드백 수) × 100",
  REVIEW_REQUEST_COUNT: "리뷰요청수 = 리뷰어가 1명 이상 할당된 MR 수",
  REVIEW_PARTICIPATION_COUNT: "리뷰참여수 = 리뷰어로 참여하고 머지된 MR 수",
  REVIEW_PASS_RATE: "초회통과율 = (수정 없이 승인된 MR 수 ÷ 전체 MR 수) × 100",
  REVIEW_PARTICIPATION_NUMBER: "코드리뷰참여수치 = 리뷰 참여 건수 × 피드백 구체성 점수",
  REVIEW_FEEDBACK_TIME: "피드백반영시간 = Discussion 생성부터 해결까지 평균 시간",
  REVIEW_COMPLETION_TIME: "리뷰완료시간 = 첫 코멘트부터 승인까지 평균 시간",
  REVIEW_REVIEWER_DIVERSE: "리뷰어다양성 = 1 - 지니계수(리뷰어 분포)",
  // 개발효율 (9개)
  PR_SIZE: "MR크기 = MR당 변경된 코드 라인 수",
  COMMIT_FREQUENCY: "커밋빈도 = 측정 기간 내 커밋 총 횟수",
  LOC_PER_COMMIT: "커밋당라인수 = 전체 변경 라인 수 ÷ 커밋 횟수",
  LEAD_TIME: "평균장애해결시간 = 장애 발생부터 복구까지 평균 소요 시간",
  FAILURE_DETECTION_TIME: "장애탐지시간 = 장애 발생부터 탐지까지 평균 소요 시간",
  FAILURE_DIAGNOSIS_TIME: "장애진단시간 = 장애 탐지부터 원인 파악까지 평균 소요 시간",
  FAILURE_RECOVERY_TIME: "장애복구시간 = 원인 파악부터 복구까지 평균 소요 시간",
  DEPLOYMENT_FREQUENCY: "배포빈도 = 측정 기간 내 배포 총 횟수",
  DEPLOYMENT_SUCCESS_RATE: "배포성공률 = (성공한 배포 수 ÷ 전체 배포 수) × 100",
};

/**
 * 지표 코드에 해당하는 계산식을 반환합니다.
 */
export const getMetricFormula = (metricCode: string): string => {
  return METRIC_CODE_FORMULAS[metricCode] ?? "";
};

/**
 * 지표 코드를 `단위(unit)`로 매핑하는 객체
 *
 * @example
 * ```typescript
 * import { METRIC_CODE_UNITS } from "@/utils/metrics";
 *
 * const unit = METRIC_CODE_UNITS["TECH_DEBT"];
 * // Returns: "일"
 * ```
 */
export const METRIC_CODE_UNITS: Record<string, string> = {
  // 코드품질 (9개)
  TECH_DEBT: "분", // 기술부채
  CODE_COMPLEXITY: "점", // 코드복잡도
  CODE_DUPLICATION: "%", // 코드중복률
  CODE_SMELL: "개", // 코드스멜
  SECURITY_VULNERABILITIES: "개", // 보안취약점수
  BUG_COUNT: "개", // 버그발생수
  INCIDENT_COUNT: "개", // 장애발생수
  TEST_COVERAGE: "%", // 테스트커버리지
  CODE_DEFECT_DENSITY: "/KLOC", // 코드결함밀도
  // 리뷰품질 (12개)
  REVIEW_SPEED: "초", // 리뷰속도
  REVIEW_RESPONSE_RATE: "%", // 리뷰요청응답률
  REVIEW_PARTICIPATION_RATE: "%", // 리뷰참여율
  REVIEW_ACCEPTANCE_RATE: "%", // 리뷰제안수용률
  REVIEW_FEEDBACK_CONCRETENESS: "%", // 피드백구체성
  REVIEW_REQUEST_COUNT: "개", // 리뷰요청수
  REVIEW_PARTICIPATION_COUNT: "개", // 리뷰참여수
  REVIEW_PASS_RATE: "%", // 초회통과율
  REVIEW_PARTICIPATION_NUMBER: "점", // 리뷰참여수치
  REVIEW_FEEDBACK_TIME: "분", // 피드백반영시간
  REVIEW_COMPLETION_TIME: "분", // 리뷰완료시간
  REVIEW_REVIEWER_DIVERSE: "점", // 리뷰어다양성
  // 개발효율 (9개)
  PR_SIZE: "LOC", // MR크기
  COMMIT_FREQUENCY: "회", // 커밋빈도
  LOC_PER_COMMIT: "LOC", // 커밋당라인수
  LEAD_TIME: "초", // 평균장애해결시간
  FAILURE_DETECTION_TIME: "초", // 장애탐지시간
  FAILURE_DIAGNOSIS_TIME: "초", // 장애진단시간
  FAILURE_RECOVERY_TIME: "초", // 장애복구시간
  DEPLOYMENT_FREQUENCY: "개", // 배포빈도
  DEPLOYMENT_SUCCESS_RATE: "%", // 배포성공률
};

/**
 * 지표 코드별 정렬 순서를 정의하는 객체
 * 숫자가 작을수록 먼저 표시됩니다.
 *
 * @example
 * ```typescript
 * import { METRIC_CODE_ORDER } from "@/utils/metrics";
 *
 * const order = METRIC_CODE_ORDER["TECH_DEBT"];
 * // Returns: 1
 * ```
 */
export const METRIC_CODE_ORDER: Record<string, number> = {
  // 코드품질 (1-9) - METRIC_CODE_NAMES 순서와 동일
  TECH_DEBT: 1,
  CODE_COMPLEXITY: 2,
  CODE_DUPLICATION: 3,
  CODE_SMELL: 4,
  SECURITY_VULNERABILITIES: 5,
  BUG_COUNT: 6,
  INCIDENT_COUNT: 7,
  TEST_COVERAGE: 8,
  CODE_DEFECT_DENSITY: 9,
  // 리뷰품질 (10-21) - METRIC_CODE_NAMES 순서와 동일
  REVIEW_SPEED: 10,
  REVIEW_RESPONSE_RATE: 11,
  REVIEW_PARTICIPATION_RATE: 12,
  REVIEW_ACCEPTANCE_RATE: 13,
  REVIEW_FEEDBACK_CONCRETENESS: 14,
  REVIEW_REQUEST_COUNT: 15,
  REVIEW_PARTICIPATION_COUNT: 16,
  REVIEW_PASS_RATE: 17,
  REVIEW_PARTICIPATION_NUMBER: 18,
  REVIEW_FEEDBACK_TIME: 19,
  REVIEW_COMPLETION_TIME: 20,
  REVIEW_REVIEWER_DIVERSE: 21,
  // 개발효율 (22-30) - METRIC_CODE_NAMES 순서와 동일
  PR_SIZE: 22,
  COMMIT_FREQUENCY: 23,
  LOC_PER_COMMIT: 24,
  LEAD_TIME: 25,
  FAILURE_DETECTION_TIME: 26,
  FAILURE_DIAGNOSIS_TIME: 27,
  FAILURE_RECOVERY_TIME: 28,
  DEPLOYMENT_FREQUENCY: 29,
  DEPLOYMENT_SUCCESS_RATE: 30,
};

/**
 * 지표 코드의 정렬 순서를 반환합니다.
 *
 * @param metricCode - 지표 코드 (예: "TECH_DEBT")
 * @returns 정렬 순서 (매핑이 없는 경우 999 반환)
 *
 * @example
 * ```typescript
 * import { getMetricOrder } from "@/utils/metrics";
 *
 * const order = getMetricOrder("TECH_DEBT");
 * // Returns: 1
 * ```
 */
export const getMetricOrder = (metricCode: string): number => {
  return METRIC_CODE_ORDER[metricCode] ?? 999;
};

/**
 * 지표 배열을 정의된 순서대로 정렬합니다.
 *
 * @param metrics - 정렬할 지표 배열
 * @param getCode - 지표 객체에서 코드를 추출하는 함수 (기본값: item.metricCode)
 * @returns 정렬된 지표 배열
 *
 * @example
 * ```typescript
 * import { sortMetricsByOrder } from "@/utils/metrics";
 *
 * const sorted = sortMetricsByOrder(metrics);
 * // 또는 커스텀 키 사용
 * const sorted = sortMetricsByOrder(metrics, (item) => item.code);
 * ```
 */
export const sortMetricsByOrder = <T extends { metricCode?: string }>(
  metrics: T[],
  getCode?: (item: T) => string,
): T[] => {
  return [...metrics].sort((a, b) => {
    const codeA = getCode ? getCode(a) : a.metricCode ?? "";
    const codeB = getCode ? getCode(b) : b.metricCode ?? "";
    return getMetricOrder(codeA) - getMetricOrder(codeB);
  });
};

/**
 * 지표 코드를 한글 지표명으로 변환합니다.
 *
 * @param metricCode - 지표 코드 (예: "TECH_DEBT")
 * @returns 한글 지표명 또는 원본 코드 (매핑이 없는 경우)
 *
 * @example
 * ```typescript
 * import { getMetricName } from "@/utils/metrics";
 *
 * const name = getMetricName("TECH_DEBT");
 * // Returns: "기술부채"
 * ```
 */
export const getMetricName = (metricCode: string): string => {
  return METRIC_CODE_NAMES[metricCode] || metricCode;
};

/**
 * 지표 코드를 단위(unit)로 변환합니다.
 *
 * @param metricCode - 지표 코드 (예: "TECH_DEBT")
 * @returns 단위 문자열 또는 빈 문자열 (매핑이 없는 경우)
 *
 * @example
 * ```typescript
 * import { getMetricUnit } from "@/utils/metrics";
 *
 * const unit = getMetricUnit("TECH_DEBT");
 * // Returns: "일"
 *
 * const unit2 = getMetricUnit("TEST_COVERAGE");
 * // Returns: "%"
 * ```
 */
export const getMetricUnit = (metricCode: string): string => {
  return METRIC_CODE_UNITS[metricCode] ?? "";
};

/**
 * 지표 코드에 해당하는 툴팁 설명을 반환합니다. (짧은 설명)
 */
export const getMetricTooltipDescription = (metricCode: string): string => {
  return METRIC_CODE_TOOLTIP_DESCRIPTIONS[metricCode] ?? "";
};

/**
 * 지표 코드에 해당하는 상세 설명을 반환합니다. (긴 설명)
 */
export const getMetricDetailDescription = (metricCode: string): string => {
  return METRIC_CODE_DETAIL_DESCRIPTIONS[metricCode] ?? "";
};

/**
 * 지표 코드에 해당하는 목표값 문자열을 반환합니다.
 */
export const getMetricTarget = (metricCode: string): string => {
  return METRIC_CODE_TARGETS[metricCode] ?? "";
};

/**
 * MetricCategory enum을 한글 라벨로 변환합니다.
 *
 * @param category - MetricCategory enum 값 또는 문자열
 * @returns 한글 라벨 문자열
 *
 * @example
 * ```typescript
 * import { getCategoryLabel } from "@/utils/metrics";
 * import { MetricCategory } from "@/types/metrics.types";
 *
 * const label1 = getCategoryLabel(MetricCategory.CODE_QUALITY);
 * // Returns: "코드품질"
 *
 * const label2 = getCategoryLabel("review_quality");
 * // Returns: "리뷰품질"
 * ```
 */
export const getCategoryLabel = (category: MetricCategory | string): string => {
  const labels: Record<string, string> = {
    quality: "코드품질",
    review: "리뷰품질",
    efficiency: "개발효율",
  };
  return labels[category] || category;
};

/**
 * MetricCategory에 따른 스타일(색상, 테두리, 배경색)을 반환합니다.
 *
 * @param category - MetricCategory enum 값
 * @returns 스타일 객체 (color, borderColor, bgColor)
 *
 * @example
 * ```typescript
 * import { getCategoryStyle } from "@/utils/metrics";
 * import { MetricCategory } from "@/types/metrics.types";
 *
 * const style = getCategoryStyle(MetricCategory.CODE_QUALITY);
 * // Returns: { color: "#3B82F6", borderColor: "#3B82F6", bgColor: "#EFF6FF" }
 * ```
 */
export const getCategoryStyle = (category: MetricCategory) => {
  switch (category) {
    case MetricCategory.CODE_QUALITY:
      return {
        color: PALETTE_COLORS.blue,
        borderColor: PALETTE_COLORS.blue,
        //bgColor: "#EFF6FF",
      };
    case MetricCategory.REVIEW_QUALITY:
      return {
        color: PALETTE_COLORS.orange,
        borderColor: PALETTE_COLORS.orange,
        //bgColor: "#FFF7ED",
      };
    case MetricCategory.DEVELOPMENT_EFFICIENCY:
      return {
        color: PALETTE_COLORS.purple,
        borderColor: PALETTE_COLORS.purple,
        //bgColor: "#FAF5FF",
      };
    default:
      return {
        color: "#6B7280",
        borderColor: "#D1D5DB",
        //bgColor: "#F9FAFB",
      };
  }
};

/**
 * 상태 타입 정의 (MetricStatus와 ThresholdType 통합)
 */
export type StatusType = MetricStatus | ThresholdType;

/**
 * 상태 아이콘 설정 인터페이스
 */
export interface StatusIconConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
}

/**
 * MetricStatus 또는 ThresholdType에 따른 아이콘을 반환합니다.
 *
 * @param status - MetricStatus 또는 ThresholdType
 * @returns Lucide 아이콘 컴포넌트
 *
 * @example
 * ```typescript
 * import { getStatusIcon } from "@/utils/metrics";
 * import { MetricStatus } from "@/types/metrics.types";
 *
 * const Icon = getStatusIcon(MetricStatus.ACHIEVED);
 * // Returns: CheckCircle2
 * ```
 */
export const getStatusIcon = (status: StatusType): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    // MetricStatus (enum 값)
    excellent: CheckCircle2, // EXCELLENT (우수)
    warning: AlertCircle, // WARNING (경고)
    danger: CircleX, // DANGER (위험 - 빨간색 X)
    // 기존 호환성을 위한 매핑
    achieved: CheckCircle2,
    not_achieved: CircleX,
    // ThresholdType
    good: CheckCircle2,
  };
  return iconMap[status] || AlertCircle;
};

/**
 * MetricStatus 또는 ThresholdType에 따른 색상을 반환합니다.
 *
 * @param status - MetricStatus 또는 ThresholdType
 * @returns 색상 hex 코드
 *
 * @example
 * ```typescript
 * import { getStatusColor } from "@/utils/metrics";
 * import { MetricStatus } from "@/types/metrics.types";
 *
 * const color = getStatusColor(MetricStatus.ACHIEVED);
 * // Returns: "#10b981"
 * ```
 */
export const getStatusColor = (status: StatusType): string => {
  const colorMap: Record<string, string> = {
    // MetricStatus (enum 값)
    excellent: STATUS_COLORS.excellent, // EXCELLENT (우수 - 초록색)
    warning: STATUS_COLORS.warning, // WARNING (경고 - 주황색)
    danger: STATUS_COLORS.danger, // DANGER (위험 - 빨간색)
    // 기존 호환성을 위한 매핑
    achieved: STATUS_COLORS.excellent, // 초록색
    not_achieved: STATUS_COLORS.danger, // 빨간색
    // ThresholdType
    good: STATUS_COLORS.excellent, // 초록색
  };
  return colorMap[status] || TEXT_COLORS.secondary; // 기본값: 회색
};

/**
 * MetricStatus 또는 ThresholdType에 따른 아이콘, 색상, 배경색을 반환합니다.
 *
 * @param status - MetricStatus 또는 ThresholdType
 * @returns 아이콘 설정 객체 (아이콘, 색상, 배경색, 라벨)
 *
 * @example
 * ```typescript
 * import { getStatusIconConfig } from "@/utils/metrics";
 * import { MetricStatus } from "@/types/metrics.types";
 *
 * const config = getStatusIconConfig(MetricStatus.ACHIEVED);
 * const Icon = config.icon;
 * // Returns: { icon: CheckCircle2, color: "#10b981", bgColor: "#10b98120", label: "달성" }
 * ```
 */
export const getStatusIconConfig = (status: StatusType): StatusIconConfig => {
  const configMap: Record<string, StatusIconConfig> = {
    // MetricStatus - 지표 상태 (달성률)
    achieved: {
      icon: CheckCircle2,
      color: STATUS_COLORS.excellent,
      bgColor: `${STATUS_COLORS.excellent}20`,
      label: "달성",
    },
    warning: {
      icon: AlertCircle,
      color: STATUS_COLORS.warning,
      bgColor: `${STATUS_COLORS.warning}20`,
      label: "주의",
    },
    not_achieved: {
      icon: CircleX,
      color: STATUS_COLORS.danger,
      bgColor: `${STATUS_COLORS.danger}20`,
      label: "미달성",
    },
    // ThresholdType - 목표 달성 상태
    excellent: {
      icon: CheckCircle2,
      color: STATUS_COLORS.excellent,
      bgColor: `${STATUS_COLORS.excellent}20`,
      label: "우수",
    },
    good: {
      icon: CheckCircle2,
      color: STATUS_COLORS.excellent,
      bgColor: `${STATUS_COLORS.excellent}20`,
      label: "양호",
    },
    danger: {
      icon: CircleX,
      color: STATUS_COLORS.danger,
      bgColor: `${STATUS_COLORS.danger}20`,
      label: "위험",
    },
  };
  return (
    configMap[status] || {
      icon: AlertCircle,
      color: TEXT_COLORS.secondary,
      bgColor: `${TEXT_COLORS.secondary}20`,
      label: "알 수 없음",
    }
  );
};

/**
 * 달성률과 기준값을 기반으로 지표의 상태를 계산합니다.
 *
 * @param achievementRate - 지표의 달성률 (%)
 * @param excellentThreshold - 우수 기준값 (%)
 * @param dangerThreshold - 위험 기준값 (%)
 * @returns 계산된 MetricStatus (excellent/warning/danger)
 *
 * @example
 * ```typescript
 * import { calculateMetricStatus } from "@/utils/metrics";
 *
 * // 달성률 90%, 우수 기준 80%, 위험 기준 50%
 * const status = calculateMetricStatus(90, 80, 50);
 * // Returns: MetricStatus.EXCELLENT
 *
 * // 달성률 65%, 우수 기준 80%, 위험 기준 50%
 * const status2 = calculateMetricStatus(65, 80, 50);
 * // Returns: MetricStatus.WARNING
 *
 * // 달성률 30%, 우수 기준 80%, 위험 기준 50%
 * const status3 = calculateMetricStatus(30, 80, 50);
 * // Returns: MetricStatus.DANGER
 * ```
 */
export const calculateMetricStatus = (
  achievementRate: number,
  excellentThreshold: number,
  dangerThreshold: number,
): MetricStatus => {
  if (achievementRate >= excellentThreshold) {
    return MetricStatus.EXCELLENT;
  }
  if (achievementRate >= dangerThreshold) {
    return MetricStatus.WARNING;
  }
  return MetricStatus.DANGER;
};

/**
 * MetricsListData를 TargetValueMetric[] 배열로 변환하는 함수
 * [변경: 2026-01-08 13:23, 김병현 수정] MetricsListData -> TargetValueMetric[] 변환 함수로 수정
 * @param metricsListData - 변환할 MetricsListData
 * @param targetCategory - 필터링할 범주 (선택사항)
 * @returns TargetValueMetric[] 배열
 */
export function convertToMetricsListData(
  metricsListData: MetricsListData,
  targetCategory?: MetricCategory,
): TargetValueMetric[] {
  // [변경: 2026-01-08 13:23, 김병현 수정] MetricCategory enum을 string으로 변환하는 헬퍼 함수
  const categoryToString = (category: MetricCategory): string => {
    switch (category) {
      case MetricCategory.CODE_QUALITY:
        return "quality";
      case MetricCategory.REVIEW_QUALITY:
        return "review";
      case MetricCategory.DEVELOPMENT_EFFICIENCY:
        return "efficiency";
      default:
        return "quality";
    }
  };

  // MetricItem을 TargetValueMetric으로 변환
  let metrics = metricsListData.metrics.map((metricItem) => ({
    metricName: metricItem.name,
    category: categoryToString(metricItem.category),
    targetValue: metricItem.targetValue,
    unit: metricItem.unit,
    metricCode: metricItem.metricCode,
  }));

  // targetCategory가 지정된 경우 해당 범주만 필터링
  if (targetCategory) {
    const targetCategoryString = categoryToString(targetCategory);
    metrics = metrics.filter((m) => m.category === targetCategoryString);
  }

  return metrics;
}
