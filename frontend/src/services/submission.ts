import api from './api';

export interface Submission {
  id?: number;
  team: number;
  description: string;
  repository_url: string;
  presentation_url?: string;
  submitted_at?: string;
}

export const createOrUpdateSubmission = async (data: Submission) => {
  const response = await api.post<Submission>('/submissions/', data);
  return response.data;
};

export const getMySubmissions = async () => {
  const response = await api.get<Submission[]>('/submissions/');
  return response.data;
};
