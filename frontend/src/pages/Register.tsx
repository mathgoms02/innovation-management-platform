import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'PARTICIPANT',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/register/', formData);
      navigate('/login');
    } catch {
      setError('Erro ao registrar. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="card w-96">
        <h2 className="text-3xl font-bold mb-8 text-center">Criar Conta</h2>
        {error && <p className="text-[var(--color-secondary)] text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[var(--text-light)] text-sm font-medium mb-2">Usuário</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input-field"
              placeholder="Username"
              required
            />
          </div>
          <div>
            <label className="block text-[var(--text-light)] text-sm font-medium mb-2">E-mail</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="exemplo@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-[var(--text-light)] text-sm font-medium mb-2">Senha</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-[var(--text-light)] text-sm font-medium mb-2">Papel</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field appearance-none"
            >
              <option value="PARTICIPANT">Participante</option>
              <option value="JUDGE">Jurado</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn-primary w-full mt-4"
          >
            REGISTRAR
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-[var(--text-light)]">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-[var(--color-primary)] hover:underline font-semibold">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
