import api from './api';

export interface Team {
  id: number;
  name: string;
  hackathon: number;
  leader: number;
  leader_username: string;
  members_count: number;
  created_at: string;
}

export const getMyTeams = async () => {
  const response = await api.get<Team[]>('/teams/?mine=true');
  return response.data;
};
