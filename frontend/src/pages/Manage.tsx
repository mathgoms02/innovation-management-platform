import React, { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../components/Toast';
import AppLayout from '../components/AppLayout';
import {
  getHackathons,
  createHackathon,
  updateHackathon,
  setHackathonJudges,
  type Hackathon,
  type HackathonInput,
} from '../services/hackathon';
import { evaluationService, type Criterion } from '../services/evaluation';
import { monitoringService, type Announcement } from '../services/monitoring';
import { getUsers, type PlatformUser } from '../services/user';
import { Plus, Trophy, SlidersHorizontal, Users, Megaphone, Trash2, Save, Gavel } from 'lucide-react';

const STATUSES = ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED'];
const ANNOUNCEMENT_TYPES: Announcement['type'][] = ['INFO', 'SUCCESS', 'WARNING', 'URGENT'];

// datetime-local <-> ISO helpers
const toLocalInput = (iso?: string) => (iso ? iso.slice(0, 16) : '');

const emptyForm = (): Partial<HackathonInput> => ({
  title: '',
  description: '',
  rules: '',
  start_date: '',
  end_date: '',
  registration_deadline: '',
  status: 'DRAFT',
});

type Tab = 'details' | 'criteria' | 'judges';

const Manage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<HackathonInput>>(emptyForm());

  const [selected, setSelected] = useState<Hackathon | null>(null);
  const [tab, setTab] = useState<Tab>('details');
  const [editForm, setEditForm] = useState<Partial<HackathonInput>>({});

  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [critName, setCritName] = useState('');
  const [critWeight, setCritWeight] = useState('1');

  const [judges, setJudges] = useState<PlatformUser[]>([]);
  const [selectedJudges, setSelectedJudges] = useState<number[]>([]);

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<Announcement['type']>('INFO');

  const canManage = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  const fetchHackathons = useCallback(async () => {
    const data = await getHackathons();
    // Organizador vê apenas os próprios eventos; admin vê todos.
    const visible = user?.role === 'ADMIN' ? data : data.filter((h) => h.organizer === user?.id);
    setHackathons(visible);
    return visible;
  }, [user]);

  useEffect(() => {
    if (!canManage) return;
    const init = async () => {
      try {
        const [, judgesData] = await Promise.all([fetchHackathons(), getUsers('JUDGE')]);
        setJudges(judgesData);
      } catch {
        showToast('error', 'Falha ao carregar dados de gestão.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [canManage, fetchHackathons, showToast]);

  const selectHackathon = async (h: Hackathon) => {
    setSelected(h);
    setTab('details');
    setEditForm({
      title: h.title,
      description: h.description,
      rules: h.rules ?? '',
      start_date: h.start_date,
      end_date: h.end_date,
      registration_deadline: h.registration_deadline,
      status: h.status,
    });
    setSelectedJudges(h.judges ?? []);
    try {
      setCriteria(await evaluationService.getCriteria(h.id));
    } catch {
      setCriteria([]);
    }
  };

  const errMsg = (err: unknown, fallback: string) =>
    (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      ? JSON.stringify((err as { response: { data: unknown } }).response.data)
      : fallback;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createHackathon(createForm);
      showToast('success', `Evento "${created.title}" criado.`);
      setCreateForm(emptyForm());
      const list = await fetchHackathons();
      const fresh = list.find((h) => h.id === created.id);
      if (fresh) selectHackathon(fresh);
    } catch (err) {
      showToast('error', errMsg(err, 'Não foi possível criar o evento.'));
    } finally {
      setCreating(false);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      await updateHackathon(selected.id, editForm);
      showToast('success', 'Evento atualizado.');
      const list = await fetchHackathons();
      const fresh = list.find((h) => h.id === selected.id);
      if (fresh) setSelected(fresh);
    } catch (err) {
      showToast('error', errMsg(err, 'Falha ao atualizar o evento.'));
    }
  };

  const handleAddCriterion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !critName.trim()) return;
    try {
      await evaluationService.createCriterion(selected.id, critName.trim(), Number(critWeight) || 1);
      setCritName('');
      setCritWeight('1');
      setCriteria(await evaluationService.getCriteria(selected.id));
      showToast('success', 'Critério adicionado.');
    } catch (err) {
      showToast('error', errMsg(err, 'Falha ao adicionar critério.'));
    }
  };

  const handleDeleteCriterion = async (id: number) => {
    if (!selected) return;
    try {
      await evaluationService.deleteCriterion(id);
      setCriteria(await evaluationService.getCriteria(selected.id));
    } catch (err) {
      showToast('error', errMsg(err, 'Falha ao remover critério.'));
    }
  };

  const toggleJudge = (id: number) =>
    setSelectedJudges((prev) => (prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]));

  const handleSaveJudges = async () => {
    if (!selected) return;
    try {
      await setHackathonJudges(selected.id, selectedJudges);
      showToast('success', 'Jurados atualizados.');
      await fetchHackathons();
    } catch (err) {
      showToast('error', errMsg(err, 'Falha ao designar jurados.'));
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    try {
      await monitoringService.createAnnouncement({ title: annTitle.trim(), content: annContent.trim(), type: annType });
      showToast('success', 'Anúncio publicado.');
      setAnnTitle('');
      setAnnContent('');
      setAnnType('INFO');
    } catch (err) {
      showToast('error', errMsg(err, 'Falha ao publicar anúncio.'));
    }
  };

  if (!canManage) return <Navigate to="/" replace />;

  const inputCls =
    'w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-white tracking-widest focus:outline-none focus:border-[var(--color-primary)]/50 transition-all';
  const labelCls = 'block text-[8px] font-black uppercase tracking-widest text-[var(--text-light)] mb-1.5';

  return (
    <AppLayout>
      <div className="p-8 lg:p-12">
        <header className="mb-10">
          <p className="text-[var(--color-primary)] font-black text-[10px] uppercase tracking-[0.4em] mb-2">Control_Deck</p>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
            ORGANIZER_<span className="text-[var(--color-primary)]">COCKPIT</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start">
          {/* Left: list + create + announcement */}
          <div className="space-y-8">
            {/* Create */}
            <form onSubmit={handleCreate} className="card border-white/10 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Plus size={14} className="text-[var(--color-primary)]" /> Novo_Evento
              </h3>
              <div>
                <label className={labelCls}>Título</label>
                <input className={inputCls} value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Descrição</label>
                <textarea className={inputCls} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Início</label>
                  <input type="datetime-local" className={inputCls} value={toLocalInput(createForm.start_date)} onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })} required />
                </div>
                <div>
                  <label className={labelCls}>Fim</label>
                  <input type="datetime-local" className={inputCls} value={toLocalInput(createForm.end_date)} onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className={labelCls}>Prazo de Inscrição</label>
                <input type="datetime-local" className={inputCls} value={toLocalInput(createForm.registration_deadline)} onChange={(e) => setCreateForm({ ...createForm, registration_deadline: e.target.value })} required />
              </div>
              <button type="submit" disabled={creating} className="btn-primary w-full py-2.5 text-[10px] uppercase tracking-widest disabled:opacity-40">
                {creating ? 'Criando...' : 'Criar_Evento'}
              </button>
            </form>

            {/* List */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Meus_Eventos</h3>
              {loading ? (
                <p className="text-[10px] text-white/20 uppercase tracking-widest">Carregando...</p>
              ) : hackathons.length > 0 ? (
                hackathons.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => selectHackathon(h)}
                    className={`w-full text-left card p-4 transition-all ${
                      selected?.id === h.id ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5' : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <Trophy size={14} className="text-[var(--color-primary)]" /> {h.title}
                      </span>
                      <span className="text-[7px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-2 py-1 rounded">{h.status}</span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-[10px] text-white/20 uppercase tracking-widest italic">Nenhum evento ainda.</p>
              )}
            </div>

            {/* Announcement publisher */}
            <form onSubmit={handlePublishAnnouncement} className="card border-white/10 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Megaphone size={14} className="text-[var(--color-secondary)]" /> Publicar_Anúncio
              </h3>
              <input className={inputCls} placeholder="TÍTULO" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} />
              <textarea className={inputCls} placeholder="CONTEÚDO" value={annContent} onChange={(e) => setAnnContent(e.target.value)} />
              <select className={inputCls} value={annType} onChange={(e) => setAnnType(e.target.value as Announcement['type'])}>
                {ANNOUNCEMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button type="submit" className="btn-secondary w-full py-2.5 text-[10px] uppercase tracking-widest">Transmitir</button>
            </form>
          </div>

          {/* Right: management panel */}
          <div>
            {selected ? (
              <div className="card border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">{selected.title}</h2>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-white/5 pb-4">
                  {([
                    { id: 'details', label: 'Detalhes', icon: SlidersHorizontal },
                    { id: 'criteria', label: 'Critérios', icon: Gavel },
                    { id: 'judges', label: 'Jurados', icon: Users },
                  ] as { id: Tab; label: string; icon: typeof Users }[]).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        tab === t.id ? 'bg-[var(--color-primary)] text-black' : 'text-[var(--text-light)] hover:bg-white/5'
                      }`}
                    >
                      <t.icon size={13} /> {t.label}
                    </button>
                  ))}
                </div>

                {tab === 'details' && (
                  <form onSubmit={handleSaveDetails} className="space-y-4">
                    <div>
                      <label className={labelCls}>Título</label>
                      <input className={inputCls} value={editForm.title ?? ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Descrição</label>
                      <textarea className={inputCls} value={editForm.description ?? ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Regras</label>
                      <textarea className={inputCls} value={editForm.rules ?? ''} onChange={(e) => setEditForm({ ...editForm, rules: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Início</label>
                        <input type="datetime-local" className={inputCls} value={toLocalInput(editForm.start_date)} onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>Fim</label>
                        <input type="datetime-local" className={inputCls} value={toLocalInput(editForm.end_date)} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>Prazo Insc.</label>
                        <input type="datetime-local" className={inputCls} value={toLocalInput(editForm.registration_deadline)} onChange={(e) => setEditForm({ ...editForm, registration_deadline: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select className={inputCls} value={editForm.status ?? 'DRAFT'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn-primary px-6 py-2.5 text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <Save size={13} /> Salvar_Detalhes
                    </button>
                  </form>
                )}

                {tab === 'criteria' && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddCriterion} className="grid grid-cols-[1fr_100px_auto] gap-3 items-end">
                      <div>
                        <label className={labelCls}>Critério</label>
                        <input className={inputCls} value={critName} onChange={(e) => setCritName(e.target.value)} placeholder="EX: INOVAÇÃO" />
                      </div>
                      <div>
                        <label className={labelCls}>Peso</label>
                        <input type="number" step="0.1" min="0" className={inputCls} value={critWeight} onChange={(e) => setCritWeight(e.target.value)} />
                      </div>
                      <button type="submit" className="btn-primary px-4 py-2.5 text-[10px] uppercase tracking-widest flex items-center gap-1">
                        <Plus size={13} /> Add
                      </button>
                    </form>

                    <div className="space-y-2">
                      {criteria.length > 0 ? (
                        criteria.map((c) => (
                          <div key={c.id} className="flex items-center justify-between bg-white/[0.02] px-4 py-3 rounded-lg">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{c.name}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-[9px] font-black text-[var(--color-primary)] uppercase tracking-widest border border-[var(--color-primary)]/30 px-2 py-1 rounded">
                                Peso {c.weight}
                              </span>
                              <button onClick={() => handleDeleteCriterion(c.id)} className="text-[var(--color-secondary)] hover:scale-110 transition-transform">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-white/20 uppercase tracking-widest italic">Nenhum critério definido.</p>
                      )}
                    </div>
                  </div>
                )}

                {tab === 'judges' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {judges.length > 0 ? (
                        judges.map((j) => (
                          <button
                            key={j.id}
                            onClick={() => toggleJudge(j.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                              selectedJudges.includes(j.id)
                                ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5'
                                : 'border-white/5 hover:border-white/20'
                            }`}
                          >
                            <Gavel size={14} className={selectedJudges.includes(j.id) ? 'text-[var(--color-primary)]' : 'text-white/30'} />
                            <div>
                              <p className="text-xs font-bold text-white uppercase tracking-wider">{j.username}</p>
                              <p className="text-[8px] text-[var(--text-light)] uppercase tracking-widest">{j.email}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-[10px] text-white/20 uppercase tracking-widest italic">Nenhum jurado cadastrado na plataforma.</p>
                      )}
                    </div>
                    <button onClick={handleSaveJudges} className="btn-primary px-6 py-2.5 text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <Save size={13} /> Salvar_Jurados
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="card border-dashed border-white/10 min-h-[400px] flex flex-col items-center justify-center text-center opacity-50">
                <SlidersHorizontal size={40} className="text-white/10 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Selecione_ou_Crie_um_Evento</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Manage;
