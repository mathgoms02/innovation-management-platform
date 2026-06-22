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

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post('/users/me/avatar/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteAvatar = async () => {
  const response = await api.delete('/users/me/avatar/');
  return response.data;
};
