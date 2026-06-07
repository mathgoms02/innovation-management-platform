import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="space-x-4">
            <Link
              to="/hackathons"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Ver Hackathons
            </Link>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Sair
            </button>
          </div>
        </header>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Bem-vindo, {user?.username}!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded">
              <p className="text-sm text-gray-500">Seu Papel</p>
              <p className="text-lg font-medium text-gray-900">{user?.role}</p>
            </div>
            <div className="p-4 border border-gray-200 rounded">
              <p className="text-sm text-gray-500">E-mail</p>
              <p className="text-lg font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
