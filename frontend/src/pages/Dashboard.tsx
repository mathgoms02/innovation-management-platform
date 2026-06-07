import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl tracking-tight">Dashboard</h1>
          <div className="flex gap-4">
            <Link
              to="/hackathons"
              className="btn-primary"
            >
              Ver Hackathons
            </Link>
            <button
              onClick={logout}
              className="btn-secondary"
            >
              Sair
            </button>
          </div>
        </header>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Bem-vindo, {user?.username}!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[var(--color-bg)] rounded-[var(--border-radius)] border border-white/5">
              <p className="text-sm text-[var(--text-light)] mb-1 uppercase tracking-wider">Papel</p>
              <p className="text-xl font-bold text-[var(--color-primary)]">{user?.role}</p>
            </div>
            <div className="p-6 bg-[var(--color-bg)] rounded-[var(--border-radius)] border border-white/5">
              <p className="text-sm text-[var(--text-light)] mb-1 uppercase tracking-wider">E-mail</p>
              <p className="text-xl font-bold text-[var(--color-white)]">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
