import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionsByHackathon } from '../services/submission';
import type { Submission } from '../services/submission';
import { ClipboardCheck, ExternalLink, Play } from 'lucide-react';

const JudgeDashboard: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!hackathonId) return;
      try {
        const data = await getSubmissionsByHackathon(Number(hackathonId));
        setSubmissions(data);
      } catch (error) {
        console.error('Erro ao carregar submissões:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [hackathonId]);

  if (loading) return <div className="p-8 text-center text-white">Carregando submissões...</div>;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <p className="text-[var(--color-primary)] font-black text-xs uppercase tracking-[0.3em] mb-2">Evaluation_Center</p>
            <h1 className="text-5xl font-black italic tracking-tighter text-white">
              JUDGE_<span className="text-[var(--color-primary)]">PANEL</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <Link to={`/ranking/${hackathonId}`} className="btn-primary px-6 py-2 flex items-center gap-2">
              VIEW_RANKING
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {submissions.map((submission) => (
            <div key={submission.id} className="card p-8 border-white/5 hover:border-[var(--color-primary)]/30 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1">
                    {submission.team_name}
                  </h3>
                  <p className="text-[8px] font-black text-[var(--color-primary)] uppercase tracking-[0.2em]">Team_ID: #{submission.team}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-light)] group-hover:text-[var(--color-primary)] transition-colors">
                  <ClipboardCheck size={24} />
                </div>
              </div>

              <p className="text-xs text-[var(--text-light)] uppercase tracking-widest leading-relaxed mb-8 line-clamp-3">
                {submission.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <a 
                  href={submission.repository_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  <ExternalLink size={14} /> Repository
                </a>
                {submission.presentation_url && (
                  <a 
                    href={submission.presentation_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    <Play size={14} /> Presentation
                  </a>
                )}
              </div>

              <Link 
                to={`/evaluate/${submission.id}`}
                className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-black)] rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
              >
                START_EVALUATION
              </Link>
            </div>
          ))}

          {submissions.length === 0 && (
            <div className="col-span-full text-center py-20 card border-dashed border-white/10">
              <p className="text-[var(--text-light)] uppercase tracking-widest text-sm">Nenhuma submissão encontrada para este hackathon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;
