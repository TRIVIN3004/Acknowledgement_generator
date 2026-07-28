export type UserRole = 'admin' | 'member';

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'active';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  college?: string;
  phone?: string;
  skills?: string[];
  status: UserStatus;
  memberId?: string;
  avatarUrl?: string;
  defaultSignature?: string;
  createdAt: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'archived';

export interface ProjectTimeline {
  assignedAt?: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
  technologyStack: string[];
  leadId?: string;
  leadName?: string;
  deadline: string;
  status: ProjectStatus;
  timeline: ProjectTimeline;
  createdAt: string;
}

export interface RoleItem {
  id: string;
  _id?: string;
  title: string;
  category: string;
  department: string;
  responsibilities: string[];
  requiredSkills: string[];
  description: string;
}

export type AssignmentStatus = 'pending' | 'accepted' | 'rejected' | 'change_requested';

export interface Assignment {
  id: string;
  _id?: string;
  projectId: string;
  projectTitle?: string;
  roleId: string;
  roleTitle?: string;
  memberId: string;
  memberName?: string;
  memberEmail?: string;
  assignedBy: string;
  assignedByName?: string;
  status: AssignmentStatus;
  changeNote?: string;
  assignedAt: string;
  respondedAt?: string;
  project?: Project;
  role?: RoleItem;
  member?: User;
  acknowledgement?: any;
}

export type SignatureType = 'draw' | 'upload' | 'type';

export interface Acknowledgement {
  id: string;
  _id?: string;
  assignmentId: string;
  projectId: string;
  roleId: string;
  memberId: string;
  signatureType: SignatureType;
  signatureData: string; // Base64 data URL
  typedName?: string;
  ipAddress: string;
  userAgent: string;
  consentAccepted: boolean;
  timestamp: string;
  qrCodeHash: string;
  pdfUrl?: string;
  assignment?: Assignment;
  project?: Project;
  role?: RoleItem;
  member?: User;
}

export interface SystemNotification {
  id: string;
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'acceptance' | 'reminder' | 'deadline' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  _id?: string;
  action: string;
  performedBy: string;
  performedByName: string;
  performedByRole: UserRole;
  targetType: string;
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface AdminDashboardStats {
  totalProjects: number;
  totalMembers: number;
  totalRoles: number;
  pendingAcknowledgements: number;
  completedAcknowledgements: number;
  membersPerProject: { name: string; value: number }[];
  roleDistribution: { name: string; value: number }[];
  projectCompletion: { name: string; completed: number; total: number }[];
  acceptanceRate: number;
  recentActivities: AuditLog[];
}

export interface MemberDashboardStats {
  myProjectsCount: number;
  assignedRolesCount: number;
  pendingAcceptanceCount: number;
  completedProjectsCount: number;
  downloadedLettersCount: number;
  pendingAssignments: Assignment[];
  activeProjects: Project[];
}
