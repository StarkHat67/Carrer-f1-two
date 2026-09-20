import React from 'react';
import { useCareer } from '../career/CareerContext';
import { History, Award, Flag } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { activeWorld, playerDriver, playerCareer, playerTeam, series, countries } = useCareer();

  if (!activeWorld || !playerDriver || !playerCareer) return null;

  const country = countries.find((c) => c.id === playerDriver.nationality_country_id);
  const currentSeries = series.find((s) => s.id === playerDriver.current_series_id);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-6 space-y-6">
      {/* Header */}
      <div className="bg-[#121620] border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center font-black">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
            Histórico da Carreira
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Trajetória de {playerDriver.first_name} {playerDriver.last_name} no automobilismo
          </p>
        </div>
      </div>

      {/* Estado Inicial Real (Req. 23) */}
      <div className="bg-[#121620] border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-800/80">
          <span className="text-3xl">{country?.flag_emoji || '🏁'}</span>
          <div>
            <h2 className="text-lg font-black text-slate-100">
              {playerDriver.first_name} {playerDriver.last_name} #{playerCareer.racing_number}
            </h2>
            <p className="text-xs text-slate-400">
              Estreante profissional • Estilo {playerCareer.driving_style}
            </p>
          </div>
        </div>

        {/* Informações reais do início */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0a0d14] p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
              Ano de Estreia
            </span>
            <span className="text-slate-100 font-bold text-lg font-mono">
              {activeWorld.start_year || activeWorld.current_year}
            </span>
          </div>

          <div className="bg-[#0a0d14] p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
              Equipe Atual
            </span>
            <span className="text-slate-100 font-bold text-base truncate block">
              {playerTeam?.name || 'Sem equipe'}
            </span>
          </div>

          <div className="bg-[#0a0d14] p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
              Categoria Atual
            </span>
            <span className="text-slate-100 font-bold text-base">
              {currentSeries?.name || 'Não definida'}
            </span>
          </div>
        </div>

        {/* Mensagem Elegante: A história começa agora */}
        <div className="bg-[#0a0d14] border border-slate-800/80 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100">
            A sua história no automobilismo começa agora.
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Cada volta, disputa e decisão nas pistas moldará o seu legado. As suas participações em campeonatos, vitórias e marcos de carreira serão registrados aqui ao longo dos anos.
          </p>
        </div>
      </div>
    </div>
  );
};
