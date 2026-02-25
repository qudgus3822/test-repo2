// 인증 및 권한 관련 타입 정의

export type UserRole = "CTO" | "DIRECTOR" | "TEAM_LEAD" | "DEVELOPER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  departmentName?: string;
  teamId?: string;
  permissions: string[];
  accessibleProjects: string[];
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface Permission {
  resource: string;
  actions: string[];
}

// 역할별 권한 정의
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  CTO: [
    "view_all_projects",
    "view_org_metrics",
    "manage_users",
    "view_financial_data",
    "export_data",
    "manage_settings",
  ],
  DIRECTOR: [
    "view_department_projects",
    "view_team_metrics",
    "view_team_members",
    "export_team_data",
  ],
  TEAM_LEAD: [
    "view_team_projects",
    "view_team_members",
    "view_team_metrics",
    "manage_team_settings",
  ],
  DEVELOPER: ["view_assigned_projects", "view_personal_metrics"],
};

// 리소스별 액션 정의
export const RESOURCE_ACTIONS: Record<string, string[]> = {
  projects: ["view", "create", "update", "delete"],
  users: ["view", "create", "update", "delete"],
  metrics: ["view", "export"],
  settings: ["view", "update"],
};

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  canAccessProject: (projectId: string) => boolean;
  logout: () => Promise<void>;
}
