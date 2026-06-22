import api from './api';

export interface TeamMember {
  id: number;
  user: number;
  username: string;
  joined_at: string;
}

export interface Team {
  id: number;
  name: string;
  hackathon: number;
  leader: number;
  leader_username: string;
  members_count: number;
  members: TeamMember[];
  is_leader: boolean;
  created_at: string;
}

export interface JoinRequest {
  id: number;
  team: number;
  team_name: string;
  user: number;
  username: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface TeamFilters {
  hackathonId?: number;
  search?: string;
  mine?: boolean;
}

export const getTeams = async (filters: TeamFilters = {}) => {
  const params: Record<string, string> = {};
  if (filters.hackathonId) params.hackathon_id = String(filters.hackathonId);
  if (filters.search) params.search = filters.search;
  if (filters.mine) params.mine = 'true';

  const response = await api.get<Team[]>('/teams/', { params });
  return response.data;
};

export const getMyTeams = async () => getTeams({ mine: true });

export const getTeam = async (id: number) => {
  const response = await api.get<Team>(`/teams/${id}/`);
  return response.data;
};

export const createTeam = async (name: string, hackathon: number) => {
  const response = await api.post<Team>('/teams/', { name, hackathon });
  return response.data;
};

export const updateTeam = async (id: number, name: string) => {
  const response = await api.patch<Team>(`/teams/${id}/`, { name });
  return response.data;
};

export const requestToJoin = async (teamId: number) => {
  const response = await api.post<JoinRequest>(`/teams/${teamId}/request-join/`);
  return response.data;
};

export const getJoinRequests = async (teamId: number) => {
  const response = await api.get<JoinRequest[]>(`/teams/${teamId}/requests/`);
  return response.data;
};

export const respondToRequest = async (
  teamId: number,
  requestId: number,
  approve: boolean
) => {
  const response = await api.post<JoinRequest>(
    `/teams/${teamId}/requests/${requestId}/respond/`,
    { approve }
  );
  return response.data;
};
