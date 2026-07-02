import api from './api';

export interface PlatformUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export type AccentName = 'cyan' | 'magenta' | 'lime' | 'violet';
export type LanguageCode = 'pt-BR' | 'en';

export interface UserPreferences {
  accent: AccentName;
  reduce_motion: boolean;
  notifications: boolean;
  plain_text: boolean;
  language: LanguageCode;
}

export const changePassword = async (old_password: string, new_password: string) => {
  const response = await api.post('/users/password/change/', { old_password, new_password });
  return response.data;
};

export const resendVerification = async () => {
  const response = await api.post('/users/verify-email/resend/');
  return response.data;
};

export const logoutAll = async () => {
  const response = await api.post('/users/logout-all/');
  return response.data;
};

export const updatePreferences = async (preferences: Partial<UserPreferences>) => {
  const response = await api.patch('/users/me/', { preferences });
  return response.data;
};

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
