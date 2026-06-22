import api from './api';

export interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT';
  created_at: string;
}

export interface DashboardStats {
  active_hackathons: number;
  user_teams: number;
  xp_total: number;
  avg_score: number;
}

export interface ChartEntry {
  name: string;
  value: number;
  color: string;
}

export const monitoringService = {
  getLogs: async (): Promise<AuditLog[]> => {
    const response = await api.get('/monitoring/logs/');
    return response.data;
  },
  getHealth: async () => {
    const response = await api.get('/monitoring/health/');
    return response.data;
  },
  getStats: async (): Promise<{ stats: DashboardStats; chart_data: ChartEntry[] }> => {
    const response = await api.get('/monitoring/stats/');
    return response.data;
  },
  getAnnouncements: async (): Promise<Announcement[]> => {
    const response = await api.get('/monitoring/announcements/');
    return response.data;
  },
  createAnnouncement: async (data: {
    title: string;
    content: string;
    type: Announcement['type'];
  }): Promise<Announcement> => {
    const response = await api.post('/monitoring/announcements/', data);
    return response.data;
  },
};
