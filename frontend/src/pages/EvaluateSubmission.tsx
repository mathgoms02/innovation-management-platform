import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { evaluationService } from '../services/evaluation';
import type { Criterion, EvaluationInput } from '../services/evaluation';
import { getSubmissionById } from '../services/submission';
import type { Submission } from '../services/submission';
import { Star, Save, AlertCircle } from 'lucide-react';

const EvaluateSubmission: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scores, setScores] = useState<{ [key: number]: number }>({});
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!submissionId) return;
      try {
        const subData = await getSubmissionById(Number(submissionId));
        setSubmission(subData);
        
        if (subData.hackathon_id) {
          const critData = await evaluationService.getCriteria(subData.hackathon_id);
          setCriteria(critData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Falha ao carregar submissão.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [submissionId]);

  // I need to update the backend to include hackathon_id in SubmissionSerializer.
  // I'll do that in the next step.
  // For now, let's continue with the UI logic.

  const handleScoreChange = (criterionId: number, value: number) => {
    setScores(prev => ({ ...prev, [criterionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId) return;

    setSaving(true);
    setError(null);

    try {
      const evaluationData: EvaluationInput = {
        submission_id: Number(submissionId),
        scores: Object.entries(scores).map(([id, val]) => ({
          criterion_id: Number(id),
          value: val
        })),
        comments
      };

      await evaluationService.createEvaluation(evaluationData);
      // Success! Navigate back to judge dashboard.
      // But we need hackathonId to navigate back.
      navigate(-1);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao salvar avaliação.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-white uppercase tracking-widest">Iniciando Protocolo de Avaliação...</div>;
  if (!submission) return <div className="p-8 text-center text-red-500">Submissão não encontrada.</div>;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div className="flex-1">
            <p className="text-[var(--color-primary)] font-black text-[10px] uppercase tracking-[0.4em] mb-2">Evaluation_In_Progress</p>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase truncate">
              {submission.team_name}
            </h1>
          </div>
          <button onClick={() => navigate(-1)} className="text-[10px] font-bold text-[var(--text-light)] hover:text-white uppercase tracking-widest">
            CANCEL_X
          </button>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          <section className="space-y-8">
            {criteria.length > 0 ? criteria.map((criterion) => (
              <div key={criterion.id} className="card p-8 border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-white italic tracking-widest uppercase">
                    {criterion.name}
                  </h3>
                  <span className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest border border-[var(--color-primary)]/30 px-2 py-1 rounded">
                    Peso: {criterion.weight}
                  </span>
                </div>
                
                <div className="flex gap-2 justify-between">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleScoreChange(criterion.id, num)}
                      className={`w-10 h-10 rounded-lg font-black text-xs transition-all ${
                        scores[criterion.id] === num
                          ? 'bg-[var(--color-primary)] text-black scale-110 shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                          : 'bg-white/5 text-[var(--text-light)] hover:bg-white/10'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )) : (
              <div className="card p-8 border-dashed border-white/10 text-center">
                <p className="text-[var(--text-light)] uppercase tracking-widest text-xs">Nenhum critério definido para este hackathon.</p>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic ml-2">Observations</h3>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Adicione comentários técnicos ou feedbacks para a equipe..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors min-h-[150px] uppercase tracking-wider placeholder:text-white/20"
            />
          </section>

          <button
            type="submit"
            disabled={saving || criteria.length === 0}
            className="w-full py-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-black)] rounded-2xl font-black uppercase tracking-[0.4em] text-sm flex items-center justify-center gap-4 hover:opacity-90 disabled:opacity-50 transition-all shadow-xl"
          >
            <Save size={20} />
            {saving ? 'SAVING_DATA...' : 'FINALIZE_EVALUATION'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EvaluateSubmission;
