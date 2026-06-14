import React, { useEffect, useState } from 'react';
import { getHackathons } from '../services/hackathon';
import type { Hackathon } from '../services/hackathon';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Search, Filter } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';

const Hackathons: React.FC = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const data = await getHackathons();
        setHackathons(data);
        setFilteredHackathons(data);
      } catch (error) {
        console.error('Erro ao carregar hackathons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  useEffect(() => {
    let result = hackathons;

    if (searchTerm) {
      result = result.filter(h => 
        h.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        h.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(h => h.status === statusFilter);
    }

    setFilteredHackathons(result);
  }, [searchTerm, statusFilter, hackathons]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-12">
            <h1 className="text-4xl tracking-tight text-white">Hackathons</h1>
            <Link to="/" className="text-[var(--color-primary)] hover:underline font-medium">
              ← Voltar ao Dashboard
            </Link>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card group">
                <Skeleton className="h-8 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-6" />
                <div className="space-y-2 mb-8 border-l-2 border-white/20 pl-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl tracking-tight uppercase italic font-black">
            System_<span className="text-[var(--color-primary)]">Events</span>
          </h1>
          <Link to="/" className="text-xs font-black text-[var(--color-primary)] hover:underline uppercase tracking-widest">
            ← Back_to_Terminal
          </Link>
        </header>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="flex-1 relative flex items-center">
            <Search size={16} className="absolute left-4 text-[var(--text-light)]" />
            <input 
              type="text" 
              placeholder="SEARCH_BY_KEYWORD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-xs text-white uppercase tracking-widest focus:outline-none focus:border-[var(--color-primary)]/50 transition-all"
            />
          </div>
          <div className="relative flex items-center">
            <Filter size={16} className="absolute left-4 text-[var(--text-light)]" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-10 text-xs text-white uppercase tracking-widest focus:outline-none focus:border-[var(--color-primary)]/50 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">ALL_STATUS</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ONGOING">ONGOING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHackathons.map((hackathon) => (
            <div key={hackathon.id} className="card group hover:translate-y-[-4px] transition-all duration-300">
              <h2 className="text-2xl font-black mb-3 group-hover:text-[var(--color-primary)] transition-colors italic tracking-tighter uppercase">
                {hackathon.title}
              </h2>
              <p className="text-[10px] text-[var(--text-light)] mb-6 line-clamp-3 leading-relaxed uppercase tracking-widest">
                {hackathon.description}
              </p>
              <div className="text-xs space-y-2 mb-8 border-l-2 border-[var(--color-primary)]/30 pl-4 bg-white/[0.02] py-4 rounded-r-lg">
                <p className="flex justify-between px-2">
                  <span className="text-[8px] font-black text-[var(--text-light)] uppercase tracking-widest">Início</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{new Date(hackathon.start_date).toLocaleDateString()}</span>
                </p>
                <p className="flex justify-between px-2">
                  <span className="text-[8px] font-black text-[var(--text-light)] uppercase tracking-widest">Fim</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{new Date(hackathon.end_date).toLocaleDateString()}</span>
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  hackathon.status === 'PUBLISHED' || hackathon.status === 'ONGOING'
                    ? 'bg-[var(--color-primary)] text-[var(--color-black)]'
                    : 'bg-white/10 text-[var(--text-light)]'
                }`}>
                  {hackathon.status}
                </span>
                <div className="flex gap-4">
                  <Link 
                    to={`/ranking/${hackathon.id}`}
                    className="text-[10px] font-black text-[var(--text-light)] hover:text-[var(--color-primary)] transition-colors uppercase tracking-widest"
                  >
                    Ranking
                  </Link>
                  {user?.role === 'JUDGE' && (
                    <Link 
                      to={`/judge/${hackathon.id}`}
                      className="text-[10px] font-black text-[var(--color-primary)] hover:underline uppercase tracking-widest"
                    >
                      Avaliar →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHackathons.length === 0 && (
          <div className="text-center py-20 card bg-transparent border-dashed border-white/10">
            <p className="text-[var(--text-light)] uppercase tracking-widest text-sm">Nenhum evento corresponde aos filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hackathons;
