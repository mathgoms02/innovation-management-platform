import React, { useState } from 'react';
import { Send, Link as LinkIcon, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createOrUpdateSubmission, type Submission } from '../../services/submission';

interface SubmissionFormProps {
  teamId: number;
  existingSubmission?: Submission;
  onSuccess?: () => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ teamId, existingSubmission, onSuccess }) => {
  const [description, setDescription] = useState(existingSubmission?.description || '');
  const [repoUrl, setRepoUrl] = useState(existingSubmission?.repository_url || '');
  const [presentationUrl, setPresentationUrl] = useState(existingSubmission?.presentation_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createOrUpdateSubmission({
        team: teamId,
        description,
        repository_url: repoUrl,
        presentation_url: presentationUrl,
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao enviar submissão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8 border-white/5 bg-white/[0.02]">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
          <Send size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-widest italic">Enviar_Projeto</h3>
          <p className="text-[10px] text-[var(--text-light)] uppercase tracking-widest mt-1">Sincronize sua solução com o cluster.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-light)] ml-1">
            Descrição_da_Solução
          </label>
          <div className="relative group">
            <div className="absolute top-4 left-4 text-white/20 group-focus-within:text-[var(--color-primary)] transition-colors">
              <FileText size={18} />
            </div>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explique sua inovação..."
              rows={4}
              className="w-full bg-[var(--color-bg)] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all placeholder:text-white/10 custom-scrollbar"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-light)] ml-1">
              Repositório_GitHub
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-white/20 group-focus-within:text-[var(--color-primary)] transition-colors">
                <LinkIcon size={18} />
              </div>
              <input
                required
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-[var(--color-bg)] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all placeholder:text-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-light)] ml-1">
              Apresentação_(Link)
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-white/20 group-focus-within:text-[var(--color-primary)] transition-colors">
                <LinkIcon size={18} />
              </div>
              <input
                type="url"
                value={presentationUrl}
                onChange={(e) => setPresentationUrl(e.target.value)}
                placeholder="Google Drive, Slides, etc."
                className="w-full bg-[var(--color-bg)] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all placeholder:text-white/10"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 flex items-center gap-3 text-[var(--color-secondary)]">
            <AlertCircle size={18} />
            <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center gap-3 text-[var(--color-primary)]">
            <CheckCircle2 size={18} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Submissão realizada com sucesso!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl text-white text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? 'PROCESSANDO...' : 'TRANSMITIR_DADOS'}
          {!loading && <Send size={16} />}
        </button>
      </form>
    </div>
  );
};

export default SubmissionForm;
