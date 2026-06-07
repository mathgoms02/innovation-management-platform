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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hackathons Disponíveis</h1>
          <Link to="/" className="text-blue-600 hover:underline">Voltar ao Dashboard</Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => (
            <div key={hackathon.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <h2 className="text-xl font-bold mb-2 text-gray-800">{hackathon.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{hackathon.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                <p>📅 Início: {new Date(hackathon.start_date).toLocaleDateString()}</p>
                <p>🏁 Fim: {new Date(hackathon.end_date).toLocaleDateString()}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  hackathon.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {hackathon.status}
                </span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>

        {hackathons.length === 0 && (
          <p className="text-center text-gray-500 mt-8">Nenhum hackathon encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default Hackathons;
