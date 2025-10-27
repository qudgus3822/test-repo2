// QualityMetric 관련 타입 정의

export const MesurementScopeType = {
  PROJECT: "PROJECT",
  REPOSITORY: "REPOSITORY",
  DEVELOPER: "DEVELOPER",
} as const;

export const CodeQuality = {
  TECHNICAL_DEBT: "technical_debt", // 기술 부채
  CODE_COMPLEXITY: "code_complexity", // 코드 복잡도
  CODE_DUPLICATION: "code_duplication", // 코드 중복
  CODE_SMELLS: "code_smells", // 코드 스멜
  TEST_COVERAGE: "test_coverage", // 테스트 커버리지
  SECURITY_VULNERABILITIES: "security_vulnerabilities", // 보안 취약점
  DEFECT_DENSITY: "defect_density", // 결함 밀도
  BUG_COUNT: "bug_count", // 버그 수
  INCIDENT_FREQUENCY: "incident_frequency", // 사고 빈도
} as const;

export const OriginSource = {
  GITLAB: "GITLAB",
  GITHUB: "GITHUB",
  SONARQUBE: "SONARQUBE",
  SONARCLOUD: "SONARCLOUD",
} as const;

export const MetricUnitType = {
  PERCENT: "PERCENT",
  COUNT: "COUNT",
  RATIO: "RATIO",
  HOURS: "HOURS",
  SCORE: "SCORE",
} as const;

export type MesurementScopeType =
  (typeof MesurementScopeType)[keyof typeof MesurementScopeType];
export type CodeQualityType = (typeof CodeQuality)[keyof typeof CodeQuality];
export type OriginSourceType = (typeof OriginSource)[keyof typeof OriginSource];
export type MetricUnitTypeType =
  (typeof MetricUnitType)[keyof typeof MetricUnitType];

export interface QualityMetric {
  _id?: string;
  measurementScope: MesurementScopeType;
  projectId: string;
  repositoryId: string;
  developerId?: string;
  metricType: CodeQualityType;
  value: number;
  branch: string;
  source: OriginSourceType;
  measurementDate: Date;
  collectedAt: Date;
  unit?: MetricUnitTypeType;
  createdAt?: Date;
  updatedAt?: Date;
}

// 구성원별 지표를 위한 새로운 인터페이스들
export interface DeveloperMetric {
  _id?: string;
  developerId: string;
  developerName: string;
  projectId: string;
  metricType: CodeQualityType;
  value: number;
  measurementDate: Date;
  collectedAt: Date;
  unit?: MetricUnitTypeType;
}

export interface DeveloperMetricsRequest {
  projectId: string;
  developerId?: string;
  metricType?: CodeQualityType;
  startDate?: Date;
  endDate?: Date;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
}

export interface Repository {
  _id: string;
  name: string;
  projectId: string;
  url?: string;
}

export interface Developer {
  _id: string;
  name: string;
  email: string;
}

export interface QualityMetricChartData {
  date: string;
  value: number;
  measurementDate: Date;
}

export interface ProjectMetricsRequest {
  projectId: string;
  metricType: CodeQualityType;
  startDate?: Date;
  endDate?: Date;
  branch?: string;
}

// 팀별 지표를 위한 새로운 타입들
export const MetricCategory = {
  REVIEW: "review", // 리뷰품질
  EFFICIENCY: "efficiency", // 개발효율성
  QUALITY: "quality", // 코드품질
} as const;

export const CodeReview = {
  REVIEW_SPEED: "review_speed", // 리뷰 속도
  REVIEW_RESPONSE_RATE: "review_response_rate", // 리뷰 요청 응답률
  REVIEW_PARTICIPATION_RATE: "review_participation_rate", // 리뷰 참여율
  REVIEW_ACCEPTANCE_RATE: "review_acceptance_rate", // 리뷰 제안 수용률
  REVIEW_FEEDBACK_CONCRETENESS: "review_feedback_concreteness", // 리뷰 피드백 구체성
  REVIEW_REVIEWER_DIVERSE: "review_reviewer_diverse", // 리뷰어 다양성
  REVIEW_REQUEST_COUNT: "review_request_count", // 리뷰 요청 건수
  REVIEW_PARTICIPATION_COUNT: "review_participation_count", // 리뷰 참여 건수
  REVIEW_PASS_RATE: "review_pass_rate", // 초회 통과율
  REVIEW_PARTICIPATION_NUMBER: "review_participation_number", // 코드리뷰 참여수치
  REVIEW_FEEDBACK_TIME: "review_feedback_time", // 리뷰 피드백 반영 시간
  REVIEW_COMPLETION_TIME: "review_completion_time", // 리뷰 완료 시간
  REVIEW_RESPONSE_TIME: "review_response_time", // 리뷰 응답 시간
} as const;

export const Efficiency = {
  PRODUCTION_DEPLOYMENT_FREQUENCY: "production_deployment_frequency", // 프로덕션 배포 빈도
  COMMIT_FREQUENCY: "commit_frequency", // 커밋 빈도
  CODE_CONTRIBUTION: "code_contribution", // 코드 기여도
  AVERAGE_FAILURE_RESOLUTION_TIME: "average_failure_resolution_time", // 평균 실패 해결 시간
  FAILURE_DETECTION_TIME: "failure_detection_time", // 실패 탐지 시간
  FAILURE_DIAGNOSIS_TIME: "failure_diagnosis_time", // 실패 진단 시간
  FAILURE_RECOVERY_TIME: "failure_recovery_time", // 실패 복구 시간
  TEAM_PROJECT_DEPLOYMENT_FREQUENCY_COMPARISON:
    "team_project_deployment_frequency_comparison", // 팀 프로젝트 배포 빈도 비교
  DEPLOYMENT_SUCCESS_RATE: "deployment_success_rate", // 배포 성공률
} as const;

export type MetricCategoryType =
  (typeof MetricCategory)[keyof typeof MetricCategory];

export interface TeamMetricScore {
  _id?: string;
  organizationId: string;
  projectId: string;
  repositoryId: string;
  developerId: string;
  category: MetricCategoryType;
  collectedAt: Date;
  score: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  organizationId: string;
  memberIds: string[];
}

export interface TeamRadarData {
  teamId: string;
  teamName: string;
  review: number;
  efficiency: number;
  quality: number;
}

export interface TeamMetricsRequest {
  teamId: string;
  startDate?: Date;
  endDate?: Date;
}

// 새로운 API 응답 데이터 구조
export interface ReviewMetrics {
  _id: string;
  projectId: string;
  repositoryId: string;
  mergeRequestId: string;
  developerId: string;
  reviewType: string;
  title: string;
  branch: string;
  reviewTime: string;
  value: number;
  unit: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface EfficiencyMetrics {
  _id: string;
  organizationId: string;
  projectId: string;
  repositoryId: string;
  developerId: string;
  efficiencyType: string;
  collectedAt: string;
  value: number;
  score: number;
  unit: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface QualityMetrics {
  _id: string;
  measurementScope: string;
  projectId: string;
  repositoryId: string;
  developerId: string;
  metricType: string;
  value: number;
  branch: string;
  source: string;
  measurementDate: string;
  collectedAt: string;
  unit: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAnalyticsResponse {
  reviewMetrics: ReviewMetrics;
  efficiencyMetrics: EfficiencyMetrics;
  qualityMetrics: QualityMetrics;
}

// 프로젝트 지표용 Radar Chart 데이터
export interface ProjectRadarData {
  projectId: string;
  projectName: string;
  review: number;
  efficiency: number;
  quality: number;
}

// 트렌드 API 응답 타입
export interface TrendMetricData {
  _id: string;
  organizationId: string;
  projectId: string;
  repositoryId: string;
  developerId: string;
  efficiencyType?: string;
  reviewType?: string;
  metricType?: string;
  collectedAt: string;
  value: number;
  score: number;
  unit: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

// 프로젝트 지표 탭 타입
export type ProjectMetricTab = "review" | "efficiency" | "quality";

// 메트릭 타입 유니온 타입
export type MetricType =
  | keyof typeof CodeQuality
  | keyof typeof CodeReview
  | keyof typeof Efficiency;

// 개발자 트렌드 메트릭 데이터
export interface DeveloperTrendMetricData {
  _id: string;
  organizationId: string;
  projectId: string;
  repositoryId: string;
  developerId: string;
  category: "review" | "efficiency" | "quality";
  collectedAt: string;
  value: number;
  unit: string;
  score: number;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

// 개발자 지표 탭 타입
export type DeveloperMetricTab = "review" | "efficiency" | "quality";
