import api from './api';

export interface Hackathon {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  status: string;
}

export const getHackathons = async () => {
  const response = await api.get<Hackathon[]>('/hackathons/');
  return response.data;
};

export const getHackathon = async (id: number) => {
  const response = await api.get<Hackathon>(`/hackathons/${id}/`);
  return response.data;
};
