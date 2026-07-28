const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const getAuthToken = () => localStorage.getItem('prdams_token');

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    let data: any = {};
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || `HTTP ${response.status} ${response.statusText}` };
      }
    }

    if (!response.ok) {
      throw new Error(data.message || `API Request Failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => apiRequest('/auth/profile'),
  updateProfile: (data: any) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getMembers: () => apiRequest('/auth/members'),
  updateMemberStatus: (id: string, status: string) => apiRequest(`/auth/members/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteMember: (id: string) => apiRequest(`/auth/members/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: (params?: string) => apiRequest(`/projects${params ? `?${params}` : ''}`),
  getProjectById: (id: string) => apiRequest(`/projects/${id}`),
  createProject: (data: any) => apiRequest('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) => apiRequest(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  archiveProject: (id: string) => apiRequest(`/projects/${id}/archive`, { method: 'PUT' }),
  deleteProject: (id: string) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),

  // Roles
  getRoles: () => apiRequest('/roles'),
  createRole: (data: any) => apiRequest('/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, data: any) => apiRequest(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRole: (id: string) => apiRequest(`/roles/${id}`, { method: 'DELETE' }),

  // Assignments
  getAssignments: (params?: string) => apiRequest(`/assignments${params ? `?${params}` : ''}`),
  createAssignment: (data: any) => apiRequest('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  updateAssignment: (id: string, data: any) => apiRequest(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAssignment: (id: string) => apiRequest(`/assignments/${id}`, { method: 'DELETE' }),
  respondAssignment: (id: string, data: any) => apiRequest(`/assignments/${id}/respond`, { method: 'PUT', body: JSON.stringify(data) }),

  // Acknowledgements
  getAcknowledgements: (params?: string) => apiRequest(`/acknowledgements${params ? `?${params}` : ''}`),
  createAcknowledgement: (data: any) => apiRequest('/acknowledgements', { method: 'POST', body: JSON.stringify(data) }),
  verifyQRCode: (hash: string) => apiRequest(`/acknowledgements/verify/${hash}`),

  // Dashboards & Audit
  getAdminStats: () => apiRequest('/dashboard/admin'),
  getMemberStats: () => apiRequest('/dashboard/member'),
  getNotifications: () => apiRequest('/dashboard/notifications'),
  markNotificationRead: (id: string) => apiRequest(`/dashboard/notifications/${id}/read`, { method: 'PUT' }),
  getAuditLogs: () => apiRequest('/dashboard/audit-logs'),

  // Export
  exportExcel: () => apiRequest('/export/excel'),
  exportZip: () => apiRequest('/export/zip'),
  getReports: () => apiRequest('/export/reports'),
};
