import api from './api';

export interface Hackathon {
  id: number;
  title: string;
  description: string;
  rules?: string | null;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  status: string;
  organizer?: number | null;
  judges?: number[];
}

export type HackathonInput = Omit<Hackathon, 'id' | 'organizer'>;

export const getHackathons = async () => {
  const response = await api.get<Hackathon[]>('/hackathons/');
  return response.data;
};

export const getHackathon = async (id: number) => {
  const response = await api.get<Hackathon>(`/hackathons/${id}/`);
  return response.data;
};

export const createHackathon = async (data: Partial<HackathonInput>) => {
  const response = await api.post<Hackathon>('/hackathons/', data);
  return response.data;
};

export const updateHackathon = async (id: number, data: Partial<HackathonInput>) => {
  const response = await api.patch<Hackathon>(`/hackathons/${id}/`, data);
  return response.data;
};

export const setHackathonJudges = async (id: number, judges: number[]) => {
  const response = await api.patch<Hackathon>(`/hackathons/${id}/`, { judges });
  return response.data;
};
