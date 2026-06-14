import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { evaluationService } from '../services/evaluation';
import type { RankingEntry } from '../services/evaluation';
import { Trophy, Medal, Award, Download } from 'lucide-react';

const Ranking: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      if (!hackathonId) return;
      try {
        const data = await evaluationService.getRanking(Number(hackathonId));
        setRanking(data);
      } catch (error) {
        console.error('Erro ao carregar ranking:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [hackathonId]);

  const exportToCSV = () => {
    const headers = ['Posição', 'Time', 'Avaliações', 'Score Final'];
    const rows = ranking.map((entry, index) => [
      index + 1,
      entry.team_name,
      entry.evaluations_count,
      entry.final_score.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ranking_hackathon_${hackathonId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-white">Carregando classificação...</div>;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <p className="text-[var(--color-primary)] font-black text-xs uppercase tracking-[0.3em] mb-2">Leaderboard</p>
            <h1 className="text-5xl font-black italic tracking-tighter text-white">
              RANKING_<span className="text-[var(--color-primary)]">FINAL</span>
            </h1>
          </div>
          <div className="flex flex-col items-end gap-4">
            <Link to="/hackathons" className="text-xs font-bold text-[var(--text-light)] hover:text-white uppercase tracking-widest border-b border-white/10 pb-1">
              Back_to_Events
            </Link>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <Download size={14} className="text-[var(--color-primary)]" />
              Download_Report
            </button>
          </div>
        </header>

        <div className="space-y-4">
          {ranking.map((entry, index) => {
            const isTop3 = index < 3;
            const Icon = index === 0 ? Trophy : index === 1 ? Medal : index === 2 ? Award : null;
            const color = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--text-light)';

            return (
              <div 
                key={entry.team_id} 
                className={`card flex items-center gap-6 p-6 transition-all duration-500 hover:scale-[1.02] ${
                  isTop3 ? 'border-[var(--color-primary)]/30 bg-[var(--color-primary)]/[0.02]' : 'border-white/5'
                }`}
              >
                <div className="w-12 h-12 flex items-center justify-center relative">
                  {Icon ? (
                    <Icon size={32} style={{ color }} />
                  ) : (
                    <span className="text-2xl font-black text-white/20 italic">#{index + 1}</span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-black text-white italic tracking-tight uppercase">
                    {entry.team_name}
                  </h3>
                  <p className="text-[10px] text-[var(--text-light)] uppercase tracking-widest mt-1">
                    {entry.evaluations_count} Avaliações Recebidas
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[8px] font-black text-[var(--color-primary)] uppercase tracking-[0.2em] mb-1">Score_Final</p>
                  <p className="text-4xl font-black italic tracking-tighter text-white">
                    {entry.final_score.toFixed(1)}
                  </p>
                </div>
              </div>
            );
          })}

          {ranking.length === 0 && (
            <div className="text-center py-20 card border-dashed border-white/10">
              <p className="text-[var(--text-light)] uppercase tracking-widest text-sm">Nenhuma submissão avaliada ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ranking;
