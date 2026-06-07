import React, { useEffect, useState } from 'react';
import { getHackathons } from '../services/hackathon';
import type { Hackathon } from '../services/hackathon';
import { Link } from 'react-router-dom';

const Hackathons: React.FC = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const data = await getHackathons();
        setHackathons(data);
      } catch (error) {
        console.error('Erro ao carregar hackathons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  if (loading) return <div className="p-8 text-center">Carregando eventos...</div>;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl tracking-tight">Hackathons</h1>
          <Link to="/" className="text-[var(--color-primary)] hover:underline font-medium">
            ← Voltar ao Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hackathons.map((hackathon) => (
            <div key={hackathon.id} className="card group">
              <h2 className="text-2xl font-bold mb-3 group-hover:text-[var(--color-white)] transition-colors">
                {hackathon.title}
              </h2>
              <p className="text-[var(--text-light)] mb-6 line-clamp-3 leading-relaxed">
                {hackathon.description}
              </p>
              <div className="text-sm space-y-2 mb-8 border-l-2 border-[var(--color-primary)] pl-4">
                <p className="flex justify-between">
                  <span className="text-[var(--text-light)]">Início:</span>
                  <span className="text-[var(--color-white)]">{new Date(hackathon.start_date).toLocaleDateString()}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[var(--text-light)]">Fim:</span>
                  <span className="text-[var(--color-white)]">{new Date(hackathon.end_date).toLocaleDateString()}</span>
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  hackathon.status === 'PUBLISHED' || hackathon.status === 'ONGOING'
                    ? 'bg-[var(--color-primary)] text-[var(--color-black)] shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                    : 'bg-white/10 text-[var(--text-light)]'
                }`}>
                  {hackathon.status}
                </span>
                <button className="text-[var(--color-primary)] font-bold text-sm hover:underline">
                  DETALHES →
                </button>
              </div>
            </div>
          ))}
        </div>

        {hackathons.length === 0 && (
          <div className="text-center py-20 card bg-transparent border-dashed">
            <p className="text-[var(--text-light)] text-lg">Nenhum hackathon disponível no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hackathons;
