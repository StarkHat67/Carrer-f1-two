import React from 'react';
import { LogOut, Settings, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export const SettingsView: React.FC = () => {
  const { currentUser, signOut } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-6 space-y-5">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center">
          <Settings className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100">Configurações</h1>
          <p className="text-xs text-slate-500 mt-0.5">Conta e sessão</p>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#11141b] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2 text-xs font-bold text-slate-300">
          <User className="w-4 h-4 text-red-500" /> Conta
        </div>
        <div className="p-5 grid sm:grid-cols-2 gap-4">
          <Info label="Jogador" value={currentUser?.username || 'Piloto'} />
          <Info label="Membro desde" value={currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('pt-BR') : '—'} />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#11141b] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-slate-500 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-slate-200">Sua carreira fica vinculada à sua conta.</div>
            <div className="text-xs text-slate-500 mt-1">Sair não apaga nenhum save.</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </section>

      <div className="text-[10px] text-slate-600 text-center">APEX CAREER · v0.2</div>
    </div>
  );
};

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl bg-black/20 border border-white/5 p-4">
    <div className="text-[10px] uppercase font-bold text-slate-500">{label}</div>
    <div className="text-sm font-bold text-slate-200 mt-1">{value}</div>
  </div>
);
