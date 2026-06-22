import api from './api';

export interface PlatformUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const getUsers = async (role?: string) => {
  const params = role ? { role } : {};
  const response = await api.get<PlatformUser[]>('/users/', { params });
  return response.data;
};
