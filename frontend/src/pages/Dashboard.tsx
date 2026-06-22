import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useNotifications } from '../features/auth/NotificationContext';
import { monitoringService } from '../services/monitoring';
import type { AuditLog, Announcement, DashboardStats, ChartEntry } from '../services/monitoring';
import AppLayout from '../components/AppLayout';
import { LayoutDashboard, Activity, Newspaper } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, newsRes] = await Promise.all([
        monitoringService.getStats(),
        monitoringService.getAnnouncements(),
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

  // Refresh on incoming realtime notifications
  useEffect(() => {
    if (notifications.length > 0) {
      fetchData();
    }
  }, [notifications, fetchData]);

  return (
    <AppLayout>
      <div className="p-8 lg:p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero */}
          <section className="relative h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-[var(--color-bg-secondary)] to-[var(--color-bg)] border border-white/5 p-12 flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <LayoutDashboard size={160} />
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white mb-4">
              SYSTEM_<span className="text-[var(--color-primary)]">ACTIVE</span>
            </h2>
            <p className="text-[var(--text-light)] max-w-lg leading-relaxed uppercase text-[10px] tracking-widest font-bold">
              Bem-vindo ao terminal de controle. Você está operando como{' '}
              <span className="text-[var(--color-primary)]">{user?.role}</span>. Sincronização completa com o cluster de inovação.
            </p>
          </section>

          {/* Quick Stats */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Hackathons_Ativos', value: stats?.active_hackathons ?? '...', color: 'var(--color-primary)' },
              { label: 'Minhas_Equipes', value: stats?.user_teams ?? '...', color: 'var(--color-white)' },
              { label: 'Média_Score', value: stats?.avg_score ?? '...', color: 'var(--color-secondary)' },
              { label: 'Pontuação_XP', value: stats?.xp_total.toLocaleString() ?? '...', color: 'var(--color-primary)' },
            ].map((stat, i) => (
              <div key={i} className="card py-8 flex flex-col items-center justify-center border-white/5 hover:border-white/20">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--text-light)] mb-2">{stat.label}</p>
                <p className="text-3xl font-black italic tracking-tighter" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </section>

          {/* Content Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <section className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black uppercase tracking-widest italic tracking-tighter">Recent_Activity</h3>
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
                      <p className="text-[10px] text-[var(--text-light)] uppercase tracking-widest mt-1 truncate">
                        User: {log.user_email} | Resource ID: {log.resource_id}
                      </p>
                    </div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-white/20 uppercase tracking-widest italic">
                  No dynamic activity available for this terminal level.
                </p>
              )}

              <div className="mt-12 h-64 card p-6 border-white/5 bg-white/[0.01]">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-light)] mb-6">Performance_Metrics</p>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
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
                announcements.map((news) => (
                  <div key={news.id} className="card p-0 overflow-hidden border-white/5 bg-gradient-to-b from-white/5 to-transparent mb-4">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <p
                          className={`text-[8px] font-black uppercase tracking-[0.3em] px-2 py-1 rounded ${
                            news.type === 'URGENT'
                              ? 'bg-red-500 text-white'
                              : 'text-[var(--color-primary)] border border-[var(--color-primary)]/30'
                          }`}
                        >
                          {news.type}
                        </p>
                        <span className="text-[8px] text-white/20 font-black">{new Date(news.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-md font-bold text-white leading-tight mb-3 uppercase tracking-tighter">{news.title}</h4>
                      <p className="text-[10px] leading-relaxed text-[var(--text-light)] uppercase tracking-wider line-clamp-3">{news.content}</p>
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
    </AppLayout>
  );
};

export default Dashboard;
