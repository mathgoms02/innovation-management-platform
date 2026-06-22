import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../components/Toast';
import { uploadAvatar, deleteAvatar } from '../services/user';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import { User as UserIcon, Shield, Palette, Trash2, AlertTriangle, Save, Camera, X, Loader2 } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'prefs'>('profile');
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
    } catch (err: any) {
      showToast('error', 'SYNC_ERROR // FALHA_NA_ATUALIZAÇÃO');
    } finally {
      setSaving(false);
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
    } catch (err: any) {
      showToast('error', 'DELETE_ERROR // FALHA_NA_EXCLUSÃO');
    }
  };

  return (
    <AppLayout>
      <div className="p-8 lg:p-12">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <p className="text-[var(--color-primary)] font-black text-[10px] uppercase tracking-[0.4em] mb-2">System_Configuration</p>
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">
              SETTINGS_<span className="text-[var(--color-primary)]">CORE</span>
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
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all uppercase text-[10px] font-black tracking-widest ${
                  activeTab === tab.id 
                  ? 'bg-[var(--color-primary)] text-black shadow-[0_0_20px_rgba(0,240,255,0.2)]' 
                  : 'text-[var(--text-light)] hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}

            <div className="pt-12">
              <button 
                onClick={() => setShowUserDeleteModal(true)}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all uppercase text-[10px] font-black tracking-widest border border-dashed border-red-500/20 hover:border-red-500/50"
              >
                <Trash2 size={18} />
                Delete_Account
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
              <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl animation-fade-in">
                <Shield size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Security_Protocols_Locked</p>
                <p className="text-[8px] uppercase tracking-widest text-white/10 mt-2">v2.0 encrypted module pending</p>
              </div>
            )}

            {activeTab === 'prefs' && (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl animation-fade-in">
                <Palette size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">UI_Customization_Inactive</p>
                <p className="text-[8px] uppercase tracking-widest text-white/10 mt-2">aesthetic modules loading...</p>
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
