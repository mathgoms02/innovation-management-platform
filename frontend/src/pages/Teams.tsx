import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../components/Toast';
import AppLayout from '../components/AppLayout';
import { getHackathons, type Hackathon } from '../services/hackathon';
import {
  getTeams,
  createTeam,
  updateTeam,
  requestToJoin,
  getJoinRequests,
  respondToRequest,
  type Team,
  type JoinRequest,
} from '../services/team';
import { Users, Search, Plus, Crown, Check, X, Pencil, Inbox } from 'lucide-react';

const Teams: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isViewOnly = user?.role === 'JUDGE' || user?.role === 'ORGANIZER';

  const [teams, setTeams] = useState<Team[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [editingName, setEditingName] = useState('');

  // Create form
  const [newName, setNewName] = useState('');
  const [newHackathon, setNewHackathon] = useState<number | ''>('');
  const [creating, setCreating] = useState(false);

  const openHackathons = hackathons.filter(
    (h) => h.status === 'PUBLISHED' || h.status === 'ONGOING'
  );

  const fetchTeams = useCallback(async (term: string) => {
    const data = await getTeams(term ? { search: term } : {});
    setTeams(data);
    return data;
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const [, hackData] = await Promise.all([fetchTeams(''), getHackathons()]);
        setHackathons(hackData);
      } catch (error) {
        console.error('Erro ao carregar equipes:', error);
        showToast('error', 'Falha ao sincronizar equipes.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchTeams, showToast]);

  // Debounced server-side search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTeams(search).catch(() => undefined);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchTeams]);

  const hackathonTitle = (id: number) =>
    hackathons.find((h) => h.id === id)?.title ?? 'Evento';

  const isMember = (team: Team) =>
    !!user && team.members.some((m) => m.user === user.id);

  const myHackathonIds = new Set(
    teams.filter((t) => isMember(t)).map((t) => t.hackathon)
  );

  const selectTeam = async (team: Team) => {
    setSelectedTeam(team);
    setEditingName(team.name);
    setRequests([]);
    if (team.is_leader) {
      try {
        setRequests(await getJoinRequests(team.id));
      } catch {
        // silencioso: não-líderes não chegam aqui
      }
    }
  };

  const refreshSelected = async () => {
    const data = await fetchTeams(search);
    const updated = data.find((t) => t.id === selectedTeam?.id) ?? null;
    if (updated) await selectTeam(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newHackathon) return;
    setCreating(true);
    try {
      const team = await createTeam(newName.trim(), Number(newHackathon));
      showToast('success', `Equipe "${team.name}" criada.`);
      setNewName('');
      setNewHackathon('');
      const data = await fetchTeams(search);
      const created = data.find((t) => t.id === team.id);
      if (created) selectTeam(created);
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showToast('error', detail || 'Não foi possível criar a equipe.');
    } finally {
      setCreating(false);
    }
  };

  const handleRequestJoin = async (team: Team) => {
    try {
      await requestToJoin(team.id);
      showToast('success', 'Solicitação enviada ao líder.');
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showToast('error', detail || 'Não foi possível solicitar entrada.');
    }
  };

  const handleRename = async () => {
    if (!selectedTeam || !editingName.trim() || editingName === selectedTeam.name) return;
    try {
      await updateTeam(selectedTeam.id, editingName.trim());
      showToast('success', 'Equipe atualizada.');
      await refreshSelected();
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showToast('error', detail || 'Falha ao atualizar a equipe.');
    }
  };

  const handleRespond = async (req: JoinRequest, approve: boolean) => {
    if (!selectedTeam) return;
    try {
      await respondToRequest(selectedTeam.id, req.id, approve);
      showToast('success', approve ? `${req.username} aprovado.` : `${req.username} rejeitado.`);
      await refreshSelected();
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showToast('error', detail || 'Falha ao responder solicitação.');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-white/50 font-black uppercase tracking-widest">
          Sincronizando_Equipes...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 lg:p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              System_<span className="text-[var(--color-primary)]">Teams</span>
            </h1>
            <p className="text-[10px] text-[var(--text-light)] uppercase tracking-[0.3em] mt-2">
              {isViewOnly ? 'Visualização de equipes (view-only)' : 'Formação e gestão de equipes'}
            </p>
          </div>
        </header>

        {/* Create panel (participants only) */}
        {!isViewOnly && (
          <form
            onSubmit={handleCreate}
            className="card mb-10 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end border-white/5"
          >
            <div>
              <label className="block text-[8px] font-black uppercase tracking-widest text-[var(--text-light)] mb-2">
                Nome_da_Equipe
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="EX: NEON_RUNNERS"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-xs text-white uppercase tracking-widest focus:outline-none focus:border-[var(--color-primary)]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-[8px] font-black uppercase tracking-widest text-[var(--text-light)] mb-2">
                Hackathon
              </label>
              <select
                value={newHackathon}
                onChange={(e) => setNewHackathon(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-xs text-white uppercase tracking-widest focus:outline-none focus:border-[var(--color-primary)]/50 transition-all appearance-none cursor-pointer"
              >
                <option value="">SELECIONE_EVENTO</option>
                {openHackathons.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={creating || !newName.trim() || !newHackathon}
              className="btn-primary px-6 py-3 text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
              {creating ? 'Criando...' : 'Criar_Equipe'}
            </button>
          </form>
        )}

        {/* Search */}
        <div className="relative flex items-center mb-8">
          <Search size={16} className="absolute left-4 text-[var(--text-light)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="BUSCAR_EQUIPE_POR_NOME..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-xs text-white uppercase tracking-widest focus:outline-none focus:border-[var(--color-primary)]/50 transition-all"
          />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Teams list */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
            {teams.map((team) => {
              const member = isMember(team);
              const canRequest =
                !isViewOnly && !member && !myHackathonIds.has(team.hackathon);
              return (
                <div
                  key={team.id}
                  onClick={() => selectTeam(team)}
                  className={`card p-6 cursor-pointer transition-all ${
                    selectedTeam?.id === team.id
                      ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-black text-white tracking-tight uppercase italic">
                      {team.name}
                    </h3>
                    {team.is_leader && <Crown size={16} className="text-[var(--color-primary)]" />}
                  </div>
                  <p className="text-[9px] text-[var(--text-light)] uppercase tracking-widest mb-4">
                    {hackathonTitle(team.hackathon)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/40">
                      <Users size={12} /> {team.members_count} membro(s)
                    </span>
                    {member ? (
                      <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-primary)]">
                        Você_participa
                      </span>
                    ) : canRequest ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestJoin(team);
                        }}
                        className="text-[8px] font-black uppercase tracking-widest text-[var(--color-secondary)] hover:underline"
                      >
                        Solicitar_Entrada →
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
            {teams.length === 0 && (
              <div className="card border-dashed border-white/10 p-12 text-center md:col-span-2">
                <p className="text-[10px] text-[var(--text-light)] uppercase tracking-widest">
                  Nenhuma equipe encontrada.
                </p>
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-1">
            {selectedTeam ? (
              <div className="card border-white/10 space-y-8 sticky top-8">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--text-light)] mb-1">
                    {hackathonTitle(selectedTeam.hackathon)}
                  </p>
                  <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                    {selectedTeam.name}
                  </h2>
                  <p className="text-[9px] text-[var(--text-light)] uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Crown size={12} className="text-[var(--color-primary)]" /> {selectedTeam.leader_username}
                  </p>
                </div>

                {/* Members */}
                <div>
                  <h4 className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-3">
                    Membros
                  </h4>
                  <div className="space-y-2">
                    {selectedTeam.members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/70 bg-white/[0.02] px-3 py-2 rounded-lg"
                      >
                        <span>{m.username}</span>
                        {m.user === selectedTeam.leader && (
                          <Crown size={10} className="text-[var(--color-primary)]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leader controls */}
                {selectedTeam.is_leader && (
                  <>
                    <div>
                      <h4 className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-3">
                        Editar_Equipe
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[10px] text-white uppercase tracking-widest focus:outline-none focus:border-[var(--color-primary)]/50"
                        />
                        <button
                          onClick={handleRename}
                          disabled={!editingName.trim() || editingName === selectedTeam.name}
                          className="btn-primary px-3 py-2 text-[10px] flex items-center gap-1 disabled:opacity-40"
                        >
                          <Pencil size={12} /> Salvar
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-3 flex items-center gap-2">
                        <Inbox size={12} /> Solicitações_Pendentes
                      </h4>
                      {requests.length > 0 ? (
                        <div className="space-y-2">
                          {requests.map((req) => (
                            <div
                              key={req.id}
                              className="flex items-center justify-between bg-white/[0.02] px-3 py-2 rounded-lg"
                            >
                              <span className="text-[10px] uppercase tracking-widest text-white/70">
                                {req.username}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRespond(req, true)}
                                  className="w-7 h-7 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 flex items-center justify-center transition-all"
                                  title="Aprovar"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => handleRespond(req, false)}
                                  className="w-7 h-7 rounded-lg bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20 flex items-center justify-center transition-all"
                                  title="Rejeitar"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[9px] text-white/20 uppercase tracking-widest italic">
                          Nenhuma solicitação pendente.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="card border-dashed border-white/10 min-h-[300px] flex flex-col items-center justify-center text-center opacity-50">
                <Users size={40} className="text-white/10 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">
                  Selecione_uma_Equipe
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Teams;
