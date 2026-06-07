import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import api from '../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login/', { username, password });
      login(response.data);
      navigate('/');
    } catch {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="card w-96">
        <h2 className="text-3xl font-bold mb-8 text-center">Acessar Conta</h2>
        {error && <p className="text-[var(--color-secondary)] text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[var(--text-light)] text-sm font-medium mb-2">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Digite seu usuário"
              required
            />
          </div>
          <div>
            <label className="block text-[var(--text-light)] text-sm font-medium mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
          >
            ENTRAR
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-[var(--text-light)]">
          Novo por aqui?{' '}
          <Link to="/register" className="text-[var(--color-primary)] hover:underline font-semibold">
            Crie sua conta
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
