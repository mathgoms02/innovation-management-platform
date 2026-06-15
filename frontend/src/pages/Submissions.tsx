import React, { useEffect, useState } from 'react';
import { getMyTeams, type Team } from '../services/team';
import { getMySubmissions, type Submission } from '../services/submission';
import { getHackathons, type Hackathon } from '../services/hackathon';
import SubmissionForm from '../features/submissions/SubmissionForm';
import { LayoutDashboard, Send, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

const Submissions: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const fetchData = async () => {
    try {
      const [teamsData, submissionsData, hackathonsData] = await Promise.all([
        getMyTeams(),
        getMySubmissions(),
        getHackathons()
      ]);
      setTeams(teamsData);
      setSubmissions(submissionsData);
      setHackathons(hackathonsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-12 text-center text-white/50 font-black uppercase tracking-widest">Sincronizando...</div>;

  if (user?.role === 'JUDGE' || user?.role === 'ORGANIZER') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] p-12 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic mb-4">
          Acesso_<span className="text-[var(--color-primary)]">View-Only</span>
        </h1>
        <p className="text-[10px] text-[var(--text-light)] uppercase tracking-[0.3em] mb-8 max-w-md">
          Como {user.role}, o envio de projetos é restrito a Participantes. Seu papel é estritamente focado em visualização e avaliação.
        </p>
        <div className="flex gap-4">
          <Link to="/hackathons" className="btn-primary px-8 py-4 text-[10px] uppercase tracking-widest">
            Acessar Eventos
          </Link>
          <Link to="/" className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-light)] hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition-all">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              Minhas_<span className="text-[var(--color-primary)]">Submissões</span>
            </h1>
            <p className="text-[10px] text-[var(--text-light)] uppercase tracking-[0.3em] mt-2">Gestão de entregas por equipe</p>
          </div>
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] hover:underline border border-[var(--color-primary)]/20 px-4 py-2 rounded-lg">
            ← Voltar_Terminal
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Teams List */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-4">Equipes_Ativas</h3>
            {teams.map((team) => {
              const hackathon = hackathons.find(h => h.id === team.hackathon);
              const submission = submissions.find(s => s.team === team.id);
              const isOngoing = hackathon?.status === 'ONGOING';

              return (
                <div 
                  key={team.id} 
                  onClick={() => setSelectedTeam(team)}
                  className={`card p-6 cursor-pointer transition-all ${
                    selectedTeam?.id === team.id 
                    ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5' 
                    : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-bold text-white tracking-tight">{team.name}</h4>
                    {submission ? (
                      <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
                    ) : (
                      <Clock size={16} className="text-[var(--color-secondary)]" />
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-light)] uppercase tracking-wider mb-4">
                    {hackathon?.title || 'Hackathon Carregando...'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                      isOngoing ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-white/5 text-white/30'
                    }`}>
                      {isOngoing ? 'EM_ANDAMENTO' : 'ENCERRADO'}
                    </span>
                    {submission && (
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">ENTREGUE</span>
                    )}
                  </div>
                </div>
              );
            })}
            {teams.length === 0 && (
              <div className="card border-dashed p-8 text-center">
                <p className="text-[10px] text-[var(--text-light)] uppercase tracking-widest">Nenhuma equipe encontrada.</p>
              </div>
            )}
          </div>

          {/* Submission Panel */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-6 p-6 rounded-3xl bg-gradient-to-r from-white/5 to-transparent border border-white/5">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--color-primary)]">
                    <LayoutDashboard size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Painel_{selectedTeam.name}</h2>
                    <p className="text-[10px] text-[var(--text-light)] uppercase tracking-[0.2em] mt-1">Configuração de entrega final</p>
                  </div>
                </div>

                <SubmissionForm 
                  teamId={selectedTeam.id} 
                  existingSubmission={submissions.find(s => s.team === selectedTeam.id)}
                  onSuccess={fetchData}
                />
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 card border-dashed opacity-50">
                <Send size={48} className="text-white/10 mb-6" />
                <h3 className="text-xl font-black text-white/20 uppercase tracking-widest italic">Selecione_uma_Equipe</h3>
                <p className="text-[10px] text-white/10 uppercase tracking-[0.3em] mt-4">Para gerenciar ou enviar sua submissão</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submissions;
