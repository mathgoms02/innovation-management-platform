import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { usePreferences, ACCENTS } from '../features/auth/PreferencesContext';
import { useToast } from '../components/Toast';
import {
  uploadAvatar, deleteAvatar, changePassword, resendVerification, logoutAll,
} from '../services/user';
import type { AccentName, LanguageCode } from '../services/user';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import {
  User as UserIcon, Shield, Palette, Trash2, AlertTriangle, Save, Camera, X, Loader2,
  Lock, LogOut, MailCheck, MailWarning, Zap, Bell, Type, Globe, Check,
} from 'lucide-react';

interface PrefToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const PrefToggle: React.FC<PrefToggleProps> = ({ icon, label, description, checked, onChange }) => (
  <div className="card flex items-center justify-between gap-4 border-white/5 bg-white/[0.02]">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--color-primary)] shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-white uppercase tracking-wider">{label}</p>
        <p className="text-[9px] text-[var(--text-light)] uppercase tracking-widest mt-1">{description}</p>
      </div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-all shrink-0 ${
        checked ? 'bg-[var(--color-primary)] shadow-[0_0_12px_var(--color-primary)]' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
          checked ? 'left-[26px]' : 'left-0.5'
        }`}
      />
    </button>
  </div>
);

const Settings: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { prefs, setPreference, fmt } = usePreferences();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'prefs'>('profile');

  // Security tab state
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [changingPw, setChangingPw] = useState(false);
  const [resending, setResending] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [showDeleteModal, setShowUserDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'FILE_OVERFLOW // LIMITE_5MB_EXCEDIDO');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('error', 'INVALID_FORMAT // APENAS_IMAGENS');
      return;
    }

    setUploadingAvatar(true);
    try {
      const data = await uploadAvatar(file);
      updateUser(data);
      showToast('success', 'AVATAR_SYNCED // IMAGEM_ATUALIZADA');
    } catch {
      showToast('error', 'UPLOAD_FAILED // ERRO_NO_ENVIO');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    setUploadingAvatar(true);
    try {
      const data = await deleteAvatar();
      updateUser(data);
      showToast('success', 'AVATAR_REMOVED // IMAGEM_DELETADA');
    } catch {
      showToast('error', 'REMOVE_FAILED // ERRO_NA_REMOÇÃO');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.patch('/users/me/', formData);
      updateUser(response.data);
      showToast('success', 'PROFILE_UPDATED // DADOS_SINCRONIZADOS');
    } catch {
      showToast('error', 'SYNC_ERROR // FALHA_NA_ATUALIZAÇÃO');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password.length < 8) {
      showToast('error', 'WEAK_PASSWORD // MÍNIMO_8_CARACTERES');
      return;
    }
    if (pwForm.new_password !== pwForm.confirm) {
      showToast('error', 'MISMATCH // SENHAS_NÃO_CONFEREM');
      return;
    }
    setChangingPw(true);
    try {
      await changePassword(pwForm.old_password, pwForm.new_password);
      showToast('success', 'PASSWORD_UPDATED // SENHA_ALTERADA');
      setPwForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showToast('error', detail ? `ERROR // ${detail}` : 'CHANGE_FAILED // SENHA_ATUAL_INCORRETA');
    } finally {
      setChangingPw(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await resendVerification();
      showToast('success', 'SENT // E-MAIL_DE_VERIFICAÇÃO_ENVIADO');
    } catch {
      showToast('error', 'FAILED // NÃO_FOI_POSSÍVEL_REENVIAR');
    } finally {
      setResending(false);
    }
  };

  const handleLogoutAll = async () => {
    setLoggingOutAll(true);
    try {
      await logoutAll();
      showToast('info', 'SESSIONS_TERMINATED // DESCONECTANDO...');
      logout();
      navigate('/login');
    } catch {
      showToast('error', 'FAILED // ERRO_AO_ENCERRAR_SESSÕES');
    } finally {
      setLoggingOutAll(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== `deletar_${user?.username}`) {
      showToast('error', 'VALIDATION_FAILED // TEXTO_INCORRETO');
      return;
    }

    try {
      await api.delete('/users/me/');
      showToast('info', 'ACCOUNT_TERMINATED // DADOS_ANONIMIZADOS');
      logout();
      navigate('/login');
    } catch {
      showToast('error', 'DELETE_ERROR // FALHA_NA_EXCLUSÃO');
    }
  };

  return (
    <AppLayout>
      <div className="p-8 lg:p-12">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <p className="text-[var(--color-primary)] font-black text-[10px] uppercase tracking-[0.4em] mb-2">{fmt('System_Configuration')}</p>
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">
              {fmt('SETTINGS_')}<span className="text-[var(--color-primary)]">CORE</span>
            </h1>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Tabs */}
          <aside className="space-y-2">
            {[
              { id: 'profile', label: 'User_Profile', icon: UserIcon },
              { id: 'security', label: 'Security_Lock', icon: Shield },
              { id: 'prefs', label: 'Preferences', icon: Palette },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'security' | 'prefs')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all uppercase text-[10px] font-black tracking-widest ${
                  activeTab === tab.id 
                  ? 'bg-[var(--color-primary)] text-black shadow-[0_0_20px_rgba(0,240,255,0.2)]' 
                  : 'text-[var(--text-light)] hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                <tab.icon size={18} />
                {fmt(tab.label)}
              </button>
            ))}

            <div className="pt-12">
              <button 
                onClick={() => setShowUserDeleteModal(true)}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all uppercase text-[10px] font-black tracking-widest border border-dashed border-red-500/20 hover:border-red-500/50"
              >
                <Trash2 size={18} />
                {fmt('Delete_Account')}
              </button>
            </div>
          </aside>

          {/* Content Area */}
          <main className="lg:col-span-3 card p-12 border-white/5 min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-white text-[10px] font-black uppercase tracking-[0.4em]">
                Core_Protocol_v2
            </div>

            {activeTab === 'profile' && (
              <div className="space-y-12 animation-fade-in">
                <div className="flex items-center gap-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-[2px] shadow-2xl transition-all group-hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                       {user?.avatar ? (
                         <img
                           src={user.avatar}
                           alt={user.username}
                           className="w-full h-full rounded-[22px] object-cover"
                         />
                       ) : (
                         <div className="w-full h-full rounded-[22px] bg-[var(--color-bg-secondary)] flex items-center justify-center text-4xl font-black text-white italic">
                           {user?.username?.substring(0, 2).toUpperCase()}
                         </div>
                       )}
                    </div>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 rounded-3xl bg-black/60 flex items-center justify-center">
                        <Loader2 size={32} className="text-[var(--color-primary)] animate-spin" />
                      </div>
                    )}
                    <button
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className="absolute bottom-2 right-2 bg-[var(--color-secondary)] text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                    >
                      <Camera size={16} />
                    </button>
                    {user?.avatar && !uploadingAvatar && (
                      <button
                        onClick={handleAvatarRemove}
                        className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-lg shadow-lg hover:bg-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{user?.username}</h3>
                    <p className="text-[10px] text-[var(--color-primary)] font-black uppercase tracking-[0.3em] mt-1">{user?.role} // LEVEL_01</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-light)] ml-2">Public_Identifier</label>
                      <input 
                        type="text" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="input-field w-full bg-white/[0.02]"
                        placeholder="USERNAME"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-light)] ml-2">Comms_Channel</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="input-field w-full bg-white/[0.02]"
                        placeholder="EMAIL"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-light)] ml-2">User_Bio_Data</label>
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="input-field w-full bg-white/[0.02] min-h-[120px] py-4"
                      placeholder="TELL US ABOUT YOUR SKILLS..."
                    />
                  </div>

                  <div className="pt-8">
                    <button 
                      type="submit"
                      disabled={saving}
                      className="btn-primary px-12 py-4 text-xs tracking-[0.3em] flex items-center gap-3"
                    >
                      <Save size={16} />
                      {saving ? 'UPLOADING...' : 'SAVE_CHANGES'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-10 animation-fade-in">
                {/* Change password */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-[var(--color-primary)]" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">{fmt('Change_Password')}</h3>
                  </div>
                  <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-light)] ml-2">{fmt('Current_Password')}</label>
                      <input
                        type="password"
                        value={pwForm.old_password}
                        onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
                        className="input-field w-full bg-white/[0.02]"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-light)] ml-2">{fmt('New_Password')}</label>
                        <input
                          type="password"
                          value={pwForm.new_password}
                          onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                          className="input-field w-full bg-white/[0.02]"
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-light)] ml-2">{fmt('Confirm_Password')}</label>
                        <input
                          type="password"
                          value={pwForm.confirm}
                          onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                          className="input-field w-full bg-white/[0.02]"
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={changingPw} className="btn-primary px-10 py-4 text-xs tracking-[0.3em] flex items-center gap-3">
                      {changingPw ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                      {changingPw ? fmt('UPDATING...') : fmt('UPDATE_PASSWORD')}
                    </button>
                  </form>
                </section>

                <div className="h-px bg-white/5" />

                {/* Email verification */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-[var(--color-primary)]" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">{fmt('Email_Verification')}</h3>
                  </div>
                  <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4 border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                      {user?.is_email_verified ? (
                        <MailCheck size={28} className="text-green-400 shrink-0" />
                      ) : (
                        <MailWarning size={28} className="text-yellow-400 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{user?.email || fmt('No_email_set')}</p>
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${user?.is_email_verified ? 'text-green-400' : 'text-yellow-400'}`}>
                          {user?.is_email_verified ? fmt('Verified') : fmt('Not_verified')}
                        </p>
                      </div>
                    </div>
                    {!user?.is_email_verified && (
                      <button
                        onClick={handleResendVerification}
                        disabled={resending || !user?.email}
                        className="btn-secondary px-6 py-3 text-[10px] tracking-[0.25em] flex items-center gap-2 disabled:opacity-40 shrink-0"
                      >
                        {resending ? <Loader2 size={14} className="animate-spin" /> : <MailCheck size={14} />}
                        {fmt('Resend_Link')}
                      </button>
                    )}
                  </div>
                </section>

                <div className="h-px bg-white/5" />

                {/* Active sessions */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <LogOut size={18} className="text-[var(--color-secondary)]" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">{fmt('Active_Sessions')}</h3>
                  </div>
                  <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4 border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] text-[var(--text-light)] uppercase tracking-widest leading-relaxed max-w-md">
                      {fmt('Encerra_todas_as_sessões_ativas_em_outros_dispositivos._Você_precisará_entrar_novamente.')}
                    </p>
                    <button
                      onClick={handleLogoutAll}
                      disabled={loggingOutAll}
                      className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-secondary)] border border-[var(--color-secondary)]/30 hover:bg-[var(--color-secondary)]/10 transition-all flex items-center gap-2 disabled:opacity-40 shrink-0"
                    >
                      {loggingOutAll ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                      {fmt('Sign_out_everywhere')}
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'prefs' && (
              <div className="space-y-10 animation-fade-in">
                {/* Accent color */}
                <section className="space-y-5">
                  <div className="flex items-center gap-3">
                    <Palette size={18} className="text-[var(--color-primary)]" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">{fmt('Accent_Color')}</h3>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {(Object.keys(ACCENTS) as AccentName[]).map((name) => {
                      const accent = ACCENTS[name];
                      const selected = prefs.accent === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setPreference('accent', name)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                            selected ? 'border-white/30 bg-white/[0.03]' : 'border-transparent hover:bg-white/[0.02]'
                          }`}
                        >
                          <span
                            className="relative w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})` }}
                          >
                            {selected && <Check size={18} className="text-black" />}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-light)]">{accent.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <div className="h-px bg-white/5" />

                {/* Toggles */}
                <section className="space-y-4">
                  <PrefToggle
                    icon={<Zap size={18} />}
                    label={fmt('Reduce_Motion')}
                    description={fmt('Desativa_animações_de_entrada_e_transições')}
                    checked={prefs.reduce_motion}
                    onChange={(v) => setPreference('reduce_motion', v)}
                  />
                  <PrefToggle
                    icon={<Bell size={18} />}
                    label={fmt('Notifications')}
                    description={fmt('Exibe_toasts_para_eventos_em_tempo_real')}
                    checked={prefs.notifications}
                    onChange={(v) => setPreference('notifications', v)}
                  />
                  <PrefToggle
                    icon={<Type size={18} />}
                    label={fmt('Plain_Text_Mode')}
                    description={fmt('Remove_o_estilo_com_underline_dos_rótulos')}
                    checked={prefs.plain_text}
                    onChange={(v) => setPreference('plain_text', v)}
                  />
                </section>

                <div className="h-px bg-white/5" />

                {/* Language */}
                <section className="space-y-5">
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-[var(--color-primary)]" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">{fmt('Language')}</h3>
                  </div>
                  <div className="inline-flex rounded-xl border border-white/10 overflow-hidden">
                    {([['pt-BR', 'Português'], ['en', 'English']] as [LanguageCode, string][]).map(([code, label]) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setPreference('language', code)}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                          prefs.language === code
                            ? 'bg-[var(--color-primary)] text-black'
                            : 'text-[var(--text-light)] hover:bg-white/5'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-white/20 uppercase tracking-widest italic">
                    {fmt('i18n_em_expansão_—_aplicado_à_navegação_e_configurações')}
                  </p>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Danger Zone Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-8 border-red-500/20 bg-[#0b0c10] shadow-[0_0_50px_rgba(255,0,0,0.1)] animation-slide-up">
            <div className="flex items-center gap-4 text-red-500 mb-6">
              <AlertTriangle size={32} />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">Danger_Zone</h2>
            </div>
            
            <p className="text-xs text-[var(--text-light)] uppercase tracking-widest leading-relaxed mb-8">
              Esta ação é IRREVERSÍVEL. Todos os seus dados serão anonimizados seguindo as diretrizes da LGPD.
            </p>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Digite <span className="text-red-500 font-black">deletar_{user?.username}</span> para confirmar:
              </p>
              <input 
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="input-field w-full border-red-500/20 focus:border-red-500 transition-all text-red-500"
                placeholder="CONFIRMATION_TEXT"
              />
            </div>

            <div className="flex gap-4 mt-12">
              <button 
                onClick={() => setShowUserDeleteModal(false)}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== `deletar_${user?.username}`}
                className="flex-1 py-4 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all hover:bg-red-600 shadow-lg shadow-red-500/20"
              >
                TERMINATE_ID
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Settings;
