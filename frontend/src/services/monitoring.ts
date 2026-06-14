import api from './api';

export interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
}

export const monitoringService = {
  getLogs: async (): Promise<AuditLog[]> => {
    const response = await api.get('/monitoring/logs/');
    return response.data;
  },
  getHealth: async () => {
    const response = await api.get('/monitoring/health/');
    return response.data;
  }
};
