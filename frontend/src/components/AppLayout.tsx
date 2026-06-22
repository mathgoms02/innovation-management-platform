import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useNotifications } from '../features/auth/NotificationContext';
import { getHackathons, type Hackathon } from '../services/hackathon';
import {
  LayoutDashboard,
  Trophy,
  Users,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  icon: LucideIcon;
  label: string;
  to: string;
  roles?: string[]; // se definido, só aparece para esses papéis
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Trophy, label: 'Hackathons', to: '/hackathons' },
  { icon: Users, label: 'Equipes', to: '/teams' },
  { icon: FileText, label: 'Submissões', to: '/submissions' },
  { icon: SlidersHorizontal, label: 'Gerenciar', to: '/manage', roles: ['ADMIN', 'ORGANIZER'] },
];

const SidebarItem = ({ icon: Icon, label, to, active }: NavItem & { active: boolean }) => (
  <Link
    to={to}
    className={`relative flex items-center gap-4 px-6 py-4 transition-all duration-300 group ${
      active
        ? 'text-[var(--color-primary)]'
        : 'text-[var(--text-light)] hover:bg-white/5 hover:text-white'
    }`}
  >
    {active && (
      <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-[var(--color-primary)] shadow-[0_0_12px_var(--color-primary)]" />
    )}
    <Icon
      size={20}
      className={active ? 'text-[var(--color-primary)] drop-shadow-[0_0_6px_var(--color-primary)]' : 'group-hover:text-[var(--color-primary)]'}
    />
    <span className="text-xs font-black uppercase tracking-[0.2em]">{label}</span>
  </Link>
);

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Hackathon autocomplete
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    getHackathons()
      .then(setHackathons)
      .catch(() => undefined);
  }, []);

  const searchResults = searchQuery.trim()
    ? hackathons
        .filter((h) => h.title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
        .slice(0, 6)
    : [];

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] cyber-grid flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm border-r border-white/5 flex flex-col shrink-0">
        <Link to="/" className="p-8 mb-4 block">
          <h1 className="text-2xl font-black italic tracking-tighter text-white">
            INN_<span className="text-[var(--color-primary)]">LAB</span>
          </h1>
          <p className="text-[8px] font-bold text-[var(--text-light)] uppercase tracking-[0.4em] mt-1">
            System Control v2
          </p>
        </Link>

        <nav className="flex-1 flex flex-col">
          {visibleNav.map((item) => (
            <SidebarItem key={item.to} {...item} active={isActive(item.to)} />
          ))}
          <div className="mt-8 mb-2 px-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
            Preferences
          </div>
          <SidebarItem icon={SettingsIcon} label="Settings" to="/settings" active={isActive('/settings')} />
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-4 px-6 py-8 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/5 transition-all"
        >
          <LogOut size={20} />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Terminate_Session</span>
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-8 lg:px-12 shrink-0">
          <div className="relative w-96 max-w-[40vw]">
            <div className="flex items-center gap-4 bg-[var(--color-bg)]/50 px-4 py-2 rounded-lg border border-white/5 focus-within:border-[var(--color-primary)]/40 transition-colors">
              <Search size={16} className="text-[var(--text-light)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                placeholder="BUSCAR_HACKATHON..."
                className="bg-transparent border-none focus:outline-none text-xs text-white w-full uppercase tracking-widest"
              />
            </div>

            {searchFocused && searchQuery.trim() && (
              <div className="absolute left-0 right-0 mt-2 bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                {searchResults.length > 0 ? (
                  searchResults.map((h) => (
                    <button
                      key={h.id}
                      onMouseDown={() => navigate(`/ranking/${h.id}`)}
                      className="w-full text-left px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
                    >
                      <p className="text-[11px] font-bold text-white uppercase tracking-wider group-hover:text-[var(--color-primary)] transition-colors truncate">
                        {h.title}
                      </p>
                      <p className="text-[8px] font-black text-[var(--text-light)] uppercase tracking-[0.2em] mt-1">
                        {h.status}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">
                      Nenhum_evento_encontrado
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-[var(--text-light)] hover:text-white transition-colors"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-secondary)] rounded-full shadow-[0_0_10px_var(--color-secondary)]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-[var(--color-bg-secondary)] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white italic">
                      Protocol_Stream
                    </span>
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
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                        >
                          <p className="text-[10px] text-white uppercase tracking-wider leading-relaxed group-hover:text-[var(--color-primary)] transition-colors">
                            {n.message}
                          </p>
                          <p className="text-[8px] text-[var(--text-light)] mt-2 uppercase">
                            {n.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">
                          No_new_data_stream
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="relative">
              <div
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="text-right">
                  <p className="text-[10px] font-black text-white uppercase tracking-wider">
                    {user?.username}
                  </p>
                  <p className="text-[8px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em]">
                    {user?.role}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-[1px] group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center font-black text-xs">
                      {user?.username?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {showUserMenu && (
                <div className="absolute right-0 mt-4 w-48 bg-[var(--color-bg-secondary)] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-light)] hover:bg-white/5 hover:text-white transition-all"
                  >
                    <SettingsIcon size={14} />
                    Settings
                  </button>
                  <div className="h-px bg-white/5" />
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
