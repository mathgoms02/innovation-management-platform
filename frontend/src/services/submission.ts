import api from './api';

export interface Submission {
  id?: number;
  team: number;
  team_name?: string;
  hackathon_id?: number;
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

export const getSubmissionsByHackathon = async (hackathonId: number) => {
  const response = await api.get<Submission[]>(`/submissions/?hackathon_id=${hackathonId}`);
  return response.data;
};

export const getSubmissionById = async (id: number) => {
  const response = await api.get<Submission>(`/submissions/${id}/`);
  return response.data;
};
