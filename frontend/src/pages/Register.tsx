import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useAuth } from '../features/auth/AuthContext';
import api from '../services/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'PARTICIPANT',
    has_accepted_terms: false,
  });
  const { showToast } = useToast();
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.has_accepted_terms) {
      showToast('info', 'LGPD_CONSENT_REQUIRED // ACEITE_OS_TERMOS');
      return;
    }
    try {
      const response = await api.post('/users/register/', formData);
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      authLogin(user);

      showToast('success', 'CADASTRO_FINALIZADO // BEM-VINDO_AO_CLUSTER');
      navigate('/');
    } catch (err: any) {
      showToast('error', err.response?.data?.detail || 'ERRO_DE_PROCESSAMENTO // VERIFIQUE_OS_DADOS');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="flex w-full max-w-5xl h-[700px] card p-0 overflow-hidden border-white/5">
        {/* Left Side: Visual Section */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-tl from-[var(--color-bg)] to-[var(--color-bg-secondary)] relative overflow-hidden border-r border-white/5">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="relative z-10 p-12 flex flex-col justify-start h-full">
            <h1 className="text-6xl font-black text-white leading-none mb-4 tracking-tighter">
              JOIN THE <br/>
              <span className="text-[var(--color-secondary)]">FUTURE</span>
            </h1>
            <div className="w-20 h-1 bg-[var(--color-secondary)] mb-6 shadow-[0_0_15px_var(--color-secondary)]"></div>
            <p className="text-[var(--text-light)] max-w-xs uppercase text-[10px] tracking-[0.3em] font-bold">
              Inicie sua jornada na maior plataforma de inovação aberta.
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-[20%] left-[-10%] w-64 h-64 rounded-full bg-[var(--color-secondary)]/10 blur-3xl"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-[var(--color-bg-secondary)]">
          <div className="mb-8 text-right">
            <h2 className="text-4xl font-black tracking-tighter mb-2 italic">CREATE_ACCOUNT</h2>
            <p className="text-[var(--text-light)]">Preencha seus dados para começar.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">User_ID</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-field py-2 text-sm"
                  placeholder="USERNAME"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">Protocol_Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field py-2 text-sm"
                  placeholder="EMAIL"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">Security_Pass</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field py-2 text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">Access_Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-field py-2 text-sm appearance-none cursor-pointer"
              >
                <option value="PARTICIPANT">PARTICIPANTE</option>
                <option value="JUDGE">JURADO</option>
              </select>
            </div>

            <div className="flex items-center gap-3 mt-4 mb-4">
              <input 
                type="checkbox" 
                id="lgpd"
                checked={formData.has_accepted_terms}
                onChange={(e) => setFormData({ ...formData, has_accepted_terms: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-[var(--color-secondary)] focus:ring-[var(--color-secondary)]"
              />
              <label htmlFor="lgpd" className="text-[10px] text-[var(--text-light)] uppercase tracking-widest leading-relaxed">
                Eu aceito os <span className="text-white underline cursor-pointer">Termos de Uso</span> e a <span className="text-white underline cursor-pointer">Política de Privacidade</span> (LGPD).
              </label>
            </div>

            <button type="submit" className="btn-secondary w-full py-4 text-lg">
              INITIALIZE_REGISTRATION
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-[var(--text-light)]">
            Já possui uma ID?{' '}
            <Link to="/login" className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors font-bold">
              AUTH_HERE
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
