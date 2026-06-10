import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import api from '../services/api';
import { LayoutDashboard, Trophy, Users, FileText, Settings, LogOut, Bell, Search, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
  active?: boolean;
}

const SidebarItem = ({ icon: Icon, label, to, active = false }: SidebarItemProps) => (
  <Link 
    to={to} 
    className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 group ${
      active 
      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-r-2 border-[var(--color-primary)]' 
      : 'text-[var(--text-light)] hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={20} className={active ? 'text-[var(--color-primary)]' : 'group-hover:text-[var(--color-primary)]'} />
    <span className="text-xs font-black uppercase tracking-[0.2em]">{label}</span>
  </Link>
);

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (window.confirm('ALERTA CRÍTICO: Esta ação excluirá permanentemente todos os seus dados pessoais (LGPD). Deseja continuar?')) {
      try {
        await api.delete('/users/me/');
        logout();
        navigate('/login');
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        alert('Falha ao processar requisição de exclusão.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-bg-secondary)] border-r border-white/5 flex flex-col">
        <div className="p-8 mb-4">
          <h1 className="text-2xl font-black italic tracking-tighter text-white">
            INN_<span className="text-[var(--color-primary)]">LAB</span>
          </h1>
          <p className="text-[8px] font-bold text-[var(--text-light)] uppercase tracking-[0.4em] mt-1">
            System Control v2
          </p>
        </div>
        
        <nav className="flex-1 flex flex-col">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" active />
          <SidebarItem icon={Trophy} label="Hackathons" to="/hackathons" />
          <SidebarItem icon={Users} label="Equipes" to="#" />
          <SidebarItem icon={FileText} label="Submissões" to="/submissions" />
          <div className="mt-8 mb-2 px-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Preferences</div>
          <SidebarItem icon={Settings} label="Settings" to="#" />
          
          <button 
            onClick={handleDeleteAccount}
            className="flex items-center gap-4 px-6 py-4 text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all group mt-auto mb-4"
          >
            <Trash2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Delete_Account</span>
          </button>
        </nav>

        <button 
          onClick={logout}
          className="flex items-center gap-4 px-6 py-8 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/5 transition-all group"
        >
          <LogOut size={20} />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Terminate_Session</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-[var(--color-bg-secondary)] border-b border-white/5 flex items-center justify-between px-12">
          <div className="flex items-center gap-4 bg-[var(--color-bg)]/50 px-4 py-2 rounded-lg border border-white/5 w-96">
            <Search size={16} className="text-[var(--text-light)]" />
            <input 
              type="text" 
              placeholder="SEARCH_COMMAND..." 
              className="bg-transparent border-none focus:outline-none text-xs text-white w-full uppercase tracking-widest"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-[var(--text-light)] hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-secondary)] rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-white uppercase tracking-wider">{user?.username}</p>
                <p className="text-[8px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em]">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-[1px]">
                <div className="w-full h-full rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center font-black text-xs">
                  {user?.username?.substring(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Hero Section */}
            <section className="relative h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-[var(--color-bg-secondary)] to-[var(--color-bg)] border border-white/5 p-12 flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <LayoutDashboard size={160} />
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-white mb-4">
                SYSTEM_<span className="text-[var(--color-primary)]">ACTIVE</span>
              </h2>
              <p className="text-[var(--text-light)] max-w-lg leading-relaxed">
                Bem-vindo ao terminal de controle. Você está operando como <span className="text-[var(--color-primary)] font-bold">{user?.role}</span>. 
                Sincronização completa com o cluster de inovação.
              </p>
            </section>

            {/* Quick Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Hackathons_Ativos', value: '12', color: 'var(--color-primary)' },
                { label: 'Minhas_Equipes', value: '03', color: 'var(--color-white)' },
                { label: 'Notificações', value: '08', color: 'var(--color-secondary)' },
                { label: 'Pontuação_XP', value: '1,240', color: 'var(--color-primary)' },
              ].map((stat, i) => (
                <div key={i} className="card py-8 flex flex-col items-center justify-center border-white/5 hover:border-white/20">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--text-light)] mb-2">{stat.label}</p>
                  <p className="text-3xl font-black italic tracking-tighter" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </section>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <section className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black uppercase tracking-widest italic italic">Recent_Activity</h3>
                  <button className="text-[10px] font-bold text-[var(--color-primary)] hover:underline">VIEW_ALL</button>
                </div>
                {[1, 2, 3].map((item) => (
                  <div key={item} className="card flex items-center gap-6 p-4 border-white/5 bg-white/[0.02]">
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-[var(--color-primary)]">
                      <Bell size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Novo Hackathon Publicado</p>
                      <p className="text-[10px] text-[var(--text-light)] uppercase tracking-widest mt-1">Hackathon "Global AI Challenge" iniciou fase de inscrições.</p>
                    </div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">2h_AGO</p>
                  </div>
                ))}
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black uppercase tracking-widest italic italic">Cluster_News</h3>
                </div>
                <div className="card p-0 overflow-hidden border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                  <div className="h-40 bg-white/5 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <Trophy size={60} />
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.3em] mb-2">Announcement</p>
                    <h4 className="text-lg font-bold text-white leading-tight mb-4">Grand Finale: Innovation Summit 2026</h4>
                    <p className="text-[10px] leading-relaxed text-[var(--text-light)] uppercase tracking-wider mb-6">
                      Os vencedores da temporada serão anunciados no evento presencial em Dezembro.
                    </p>
                    <button className="w-full py-3 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-colors">
                      READ_MORE
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
