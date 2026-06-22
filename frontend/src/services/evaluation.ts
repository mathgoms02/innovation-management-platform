import api from './api';

export interface Criterion {
  id: number;
  name: string;
  weight: number;
}

export interface Score {
  criterion: number;
  criterion_name: string;
  value: number;
}

export interface Evaluation {
  id: number;
  submission: number;
  team_name: string;
  judge: number;
  judge_name: string;
  scores: Score[];
  comments: string;
  created_at: string;
}

export interface EvaluationInput {
  submission_id: number;
  scores: {
    criterion_id: number;
    value: number;
  }[];
  comments?: string;
}

export interface RankingEntry {
  team_id: number;
  team_name: string;
  final_score: number;
  evaluations_count: number;
}

export const evaluationService = {
  getCriteria: async (hackathonId: number) => {
    const response = await api.get<Criterion[]>(`/evaluations/criteria/?hackathon_id=${hackathonId}`);
    return response.data;
  },

  createCriterion: async (hackathonId: number, name: string, weight: number) => {
    const response = await api.post<Criterion>('/evaluations/criteria/', {
      hackathon: hackathonId,
      name,
      weight,
    });
    return response.data;
  },

  deleteCriterion: async (id: number) => {
    await api.delete(`/evaluations/criteria/${id}/`);
  },

  createEvaluation: async (data: EvaluationInput) => {
    const response = await api.post<Evaluation>('/evaluations/evaluations/', data);
    return response.data;
  },

  getEvaluations: async () => {
    const response = await api.get<Evaluation[]>('/evaluations/evaluations/');
    return response.data;
  },

  getRanking: async (hackathonId: number) => {
    const response = await api.get<RankingEntry[]>(`/evaluations/ranking/${hackathonId}/`);
    return response.data;
  },
};
