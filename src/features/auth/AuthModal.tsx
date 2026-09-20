import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { AlertCircle, ArrowRight, Flag } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { signIn, signUp } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!username.trim()) {
          setErrorMessage('Informe o nome do piloto.');
          setLoading(false);
          return;
        }
        if (!email.trim() || !password) {
          setErrorMessage('Preencha email e senha.');
          setLoading(false);
          return;
        }
        const { error, message } = await signUp(email.trim(), password, username.trim());
        if (error) setErrorMessage(error);
        if (message) {
          setInfoMessage(message);
          setIsRegister(false);
          setPassword('');
        }
      } else {
        if (!email.trim() || !password) {
          setErrorMessage('Informe seu email e senha.');
          setLoading(false);
          return;
        }
        const { error } = await signIn(email.trim(), password);
        if (error) {
          setErrorMessage(error);
        }
      }
    } catch (err: unknown) {
      console.error('Falha de autenticação:', err);
      setErrorMessage('Não foi possível conectar ao serviço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex items-center justify-center p-4">
      {/* Background motorsport pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(239,68,68,0.06),transparent)] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#121620] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Header esportivo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 mb-3.5">
            <Flag className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-100">
            APEX CAREER
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Construa uma carreira. Deixe uma história.
          </p>
        </div>

        {/* Abas ENTRAR / CRIAR CONTA */}
        <div className="flex bg-[#0a0d14] p-1 rounded-xl border border-slate-800 mb-6">
          <button
            id="tab-auth-login"
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMessage(null);
              setInfoMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              !isRegister
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar
          </button>
          <button
            id="tab-auth-register"
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMessage(null);
              setInfoMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              isRegister
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-950/40 border border-red-900/60 text-red-300 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-5 p-3.5 bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 rounded-xl text-xs">
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Nome do Piloto
              </label>
              <input
                id="input-auth-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: Gabriel Silva"
                className="w-full bg-[#090c13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              id="input-auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@exemplo.com"
              className="w-full bg-[#090c13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Senha
            </label>
            <input
              id="input-auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#090c13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              required
            />
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Criar Conta' : 'Entrar'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
