import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login/', { username, password });
      login(response.data);
      showToast('success', 'AUTENTICAÇÃO_BEM_SUCEDIDA // ACESSO_LIBERADO');
      navigate('/');
    } catch (err: any) {
      showToast('error', err.response?.data?.detail || 'ERRO_DE_AUTENTICAÇÃO // CREDENCIAIS_INVÁLIDAS');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="flex w-full max-w-5xl h-[600px] card p-0 overflow-hidden border-white/5">
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-[var(--color-bg-secondary)]">
          <div className="mb-8">
            <h2 className="text-4xl font-black tracking-tighter mb-2 italic">WELCOME_BACK</h2>
            <p className="text-[var(--text-light)]">Identifique-se para acessar o sistema.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">User_ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field bg-[var(--color-bg)]/50"
                placeholder="USERNAME"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">Security_Pass</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field bg-[var(--color-bg)]/50"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-4 text-lg">
              AUTH_ACCESS
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-[var(--text-light)]">
            Ainda não tem acesso?{' '}
            <Link to="/register" className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors font-bold">
              REGISTRE-SE_AQUI
            </Link>
          </p>
        </div>

        {/* Right Side: Visual Section */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-bg-secondary)] relative overflow-hidden border-l border-white/5">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="relative z-10 p-12 flex flex-col justify-end h-full">
            <div className="w-20 h-1 bg-[var(--color-primary)] mb-6 shadow-[0_0_15px_var(--color-primary)]"></div>
            <h1 className="text-6xl font-black text-white leading-none mb-4 tracking-tighter">
              INNOVATION <br/>
              <span className="text-[var(--color-primary)]">PLATFORM</span>
            </h1>
            <p className="text-[var(--text-light)] max-w-xs uppercase text-[10px] tracking-[0.3em] font-bold">
              Módulo de gestão de hackathons v2.0 // Acesso Restrito
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full bg-[var(--color-primary)]/10 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 rounded-full bg-[var(--color-secondary)]/10 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
