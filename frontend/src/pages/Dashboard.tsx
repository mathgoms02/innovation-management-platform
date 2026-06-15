import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useNotifications } from '../features/auth/NotificationContext';
import { monitoringService } from '../services/monitoring';
import type { AuditLog, Announcement, DashboardStats, ChartEntry } from '../services/monitoring';
import { LayoutDashboard, Trophy, Users, FileText, Settings, LogOut, Bell, Search, Activity, Newspaper } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
  const { notifications, clearNotifications } = useNotifications();
  const navigate = useNavigate();

  // Real Data State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartEntry[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, newsRes] = await Promise.all([
        monitoringService.getStats(),
        monitoringService.getAnnouncements()
      ]);
      
      setStats(statsRes.stats);
      setChartData(statsRes.chart_data);
      setAnnouncements(newsRes);

      if (user?.role === 'ADMIN') {
        const logsRes = await monitoringService.getLogs();
        setLogs(logsRes.slice(0, 5));
      }
    } catch (error) {
      console.error('Erro ao sincronizar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync with WebSocket notifications to refresh data if needed
  useEffect(() => {
    if (notifications.length > 0) {
        // Debounced refresh or immediate
        fetchData();
    }
  }, [notifications, fetchData]);

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
          <SidebarItem icon={Settings} label="Settings" to="/settings" />
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
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-[var(--text-light)] hover:text-white transition-colors"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-secondary)] rounded-full shadow-[0_0_10px_var(--color-secondary)]"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-[var(--color-bg-secondary)] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Protocol_Stream</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotifications();
                      }}
                      className="text-[8px] font-black uppercase tracking-widest text-[var(--color-primary)] hover:underline"
                    >
                      Clear_All
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <p className="text-[10px] text-white uppercase tracking-wider leading-relaxed group-hover:text-[var(--color-primary)] transition-colors">{n.message}</p>
                          <p className="text-[8px] text-[var(--text-light)] mt-2 uppercase">{n.timestamp.toLocaleTimeString()}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">No_new_data_stream</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-white/10"></div>
            
            <div className="relative">
              <div 
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="text-right">
                  <p className="text-[10px] font-black text-white uppercase tracking-wider">{user?.username}</p>
                  <p className="text-[8px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em]">{user?.role}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-[1px] group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all">
                  <div className="w-full h-full rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center font-black text-xs">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>

              {showUserMenu && (
                <div className="absolute right-0 mt-4 w-48 bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animation-fade-in">
                  <button 
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-light)] hover:bg-white/5 hover:text-white transition-all"
                  >
                    <Settings size={14} />
                    Settings
                  </button>
                  <div className="h-px bg-white/5"></div>
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/5 transition-all"
                  >
                    <LogOut size={14} />
                    Terminate
                  </button>
                </div>
              )}
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
              <p className="text-[var(--text-light)] max-w-lg leading-relaxed uppercase text-[10px] tracking-widest font-bold">
                Bem-vindo ao terminal de controle. Você está operando como <span className="text-[var(--color-primary)]">{user?.role}</span>. 
                Sincronização completa com o cluster de inovação.
              </p>
            </section>

            {/* Quick Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Hackathons_Ativos', value: stats?.active_hackathons ?? '...', color: 'var(--color-primary)' },
                { label: 'Minhas_Equipes', value: stats?.user_teams ?? '...', color: 'var(--color-white)' },
                { label: 'Média_Score', value: stats?.avg_score ?? '...', color: 'var(--color-secondary)' },
                { label: 'Pontuação_XP', value: stats?.xp_total.toLocaleString() ?? '...', color: 'var(--color-primary)' },
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
                  <h3 className="text-xl font-black uppercase tracking-widest italic tracking-tighter">Recent_Activity</h3>
                  <button className="text-[10px] font-bold text-[var(--color-primary)] hover:underline">VIEW_ALL</button>
                </div>
                
                {loading ? (
                  <div className="text-[10px] uppercase tracking-widest text-white/20">Loading_Logs...</div>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <div key={log.id} className="card flex items-center gap-6 p-4 border-white/5 bg-white/[0.02]">
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-[var(--color-primary)]">
                        <Activity size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">
                          {log.action} - {log.resource_type}
                        </p>
                        <p className="text-[10px] text-[var(--text-light)] uppercase tracking-widest mt-1 text-xs truncate">
                          User: {log.user_email} | Resource ID: {log.resource_id}
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-white/20 uppercase tracking-widest italic">No dynamic activity available for this terminal level.</p>
                )}

                <div className="mt-12 h-64 card p-6 border-white/5 bg-white/[0.01]">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-light)] mb-6">Performance_Metrics</p>
                   <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(255,255,255,0.3)" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                        itemStyle={{ color: 'var(--color-primary)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                   </ResponsiveContainer>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black uppercase tracking-widest italic tracking-tighter">Cluster_News</h3>
                </div>
                
                {loading ? (
                    <div className="text-[10px] uppercase tracking-widest text-white/20">Syncing_Stream...</div>
                ) : announcements.length > 0 ? (
                    announcements.map(news => (
                        <div key={news.id} className="card p-0 overflow-hidden border-white/5 bg-gradient-to-b from-white/5 to-transparent mb-4">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <p className={`text-[8px] font-black uppercase tracking-[0.3em] px-2 py-1 rounded ${
                                        news.type === 'URGENT' ? 'bg-red-500 text-white' : 'text-[var(--color-primary)] border border-[var(--color-primary)]/30'
                                    }`}>
                                        {news.type}
                                    </p>
                                    <span className="text-[8px] text-white/20 font-black">{new Date(news.created_at).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-md font-bold text-white leading-tight mb-3 uppercase tracking-tighter">{news.title}</h4>
                                <p className="text-[10px] leading-relaxed text-[var(--text-light)] uppercase tracking-wider line-clamp-3">
                                    {news.content}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="card p-8 border-dashed border-white/10 text-center">
                        <Newspaper size={32} className="mx-auto text-white/10 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">No_announcements_in_buffer</p>
                    </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
