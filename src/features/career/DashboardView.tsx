import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronRight, Flag, Trophy } from 'lucide-react';
import { useCareer } from './CareerContext';
import { useAuth } from '../auth/AuthContext';
import { ChampionshipEntry, Season, SeasonRound } from '../../types/database';

interface DashboardViewProps {
  onNavigateToSeason: () => void;
  onNavigateToCareer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToSeason, onNavigateToCareer }) => {
  const { activeWorld, playerDriver, playerCareer, playerTeam, countries, series } = useCareer();
  const { repo } = useAuth();
  const [season, setSeason] = useState<Season | null>(null);
  const [rounds, setRounds] = useState<SeasonRound[]>([]);
  const [entries, setEntries] = useState<ChampionshipEntry[]>([]);

  useEffect(() => {
    if (!activeWorld) return;
    (async () => {
      const s = await repo.getCurrentSeason(activeWorld.id);
      setSeason(s);
      if (s) {
        const [rs, es] = await Promise.all([
          repo.getSeasonRounds(activeWorld.id, s.id),
          repo.getChampionshipEntries(activeWorld.id, s.id),
        ]);
        setRounds(rs); setEntries(es);
      }
    })();
  }, [activeWorld, repo]);

  if (!activeWorld || !playerDriver || !playerCareer) return null;
  const country = countries.find((c) => c.id === playerDriver.nationality_country_id);
  const currentSeries = series.find((s) => s.id === playerDriver.current_series_id);
  const age = playerDriver.birth_date ? activeWorld.current_year - Number(playerDriver.birth_date.slice(0,4)) : 16;
  const nextRound = rounds.find((r) => r.status === 'scheduled');
  const standings = [...entries].sort((a,b) => b.points-a.points || b.wins-a.wins);
  const playerEntry = standings.find((e) => e.driver_id === playerDriver.id);
  const playerPos = playerEntry ? standings.findIndex((e) => e.driver_id === playerDriver.id)+1 : null;
  const completed = rounds.filter((r) => r.status === 'completed').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 md:py-8 space-y-5">
      <section className="relative overflow-hidden border border-white/10 rounded-2xl bg-[#11141b] p-5 sm:p-7">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: playerTeam?.primary_color || '#dc2626' }} />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-slate-500 mb-2">{country?.flag_emoji || '🏁'} {currentSeries?.name || 'Fórmula 4 Brasil'} · {age} anos</div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white truncate">{playerDriver.first_name} {playerDriver.last_name}</h1>
            <div className="mt-2 text-sm text-slate-400">#{playerCareer.racing_number} · {playerTeam?.name || 'Sem equipe'} · {playerCareer.driving_style}</div>
          </div>
          <button onClick={onNavigateToCareer} className="shrink-0 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200">Ver piloto</button>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-6">
          {[
            ['OVR', playerDriver.overall], ['POT', playerDriver.potential], ['POS', playerPos ? `P${playerPos}` : '—'], ['PTS', playerEntry?.points ?? 0],
          ].map(([label,value]) => <div key={String(label)} className="bg-black/20 rounded-xl p-3 border border-white/5"><div className="text-[10px] text-slate-500 font-bold">{label}</div><div className="mt-1 text-lg sm:text-xl font-black text-white">{value}</div></div>)}
        </div>
      </section>

      <button onClick={onNavigateToSeason} className="w-full text-left rounded-2xl border border-white/10 bg-[#11141b] hover:bg-[#151923] transition-colors p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-400 text-[11px] font-black uppercase tracking-wider"><Flag className="w-4 h-4" /> Próximo passo</div>
            {nextRound ? <>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2">{nextRound.name}</h2>
              <p className="text-sm text-slate-400 mt-1">{nextRound.circuit_name} · Etapa {nextRound.round_number} de {rounds.length}</p>
              <p className="text-xs text-slate-500 mt-3">Qualificação + 3 corridas. O resultado passa a fazer parte permanentemente deste save.</p>
            </> : <>
              <h2 className="text-xl font-black text-white mt-2">Temporada concluída</h2>
              <p className="text-sm text-slate-400 mt-1">A classificação final já está definida.</p>
            </>}
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 mt-1" />
        </div>
      </button>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#11141b] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><CalendarDays className="w-4 h-4 text-red-500" /> Temporada</div>
          <div className="text-3xl font-black text-white mt-3">{completed}<span className="text-base text-slate-600">/{rounds.length || 7}</span></div>
          <p className="text-xs text-slate-500 mt-1">etapas concluídas</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#11141b] p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Trophy className="w-4 h-4 text-red-500" /> Resultados</div>
          <div className="flex gap-6 mt-3"><div><div className="text-2xl font-black text-white">{playerEntry?.wins ?? 0}</div><div className="text-[10px] text-slate-500">vitórias</div></div><div><div className="text-2xl font-black text-white">{playerEntry?.podiums ?? 0}</div><div className="text-[10px] text-slate-500">pódios</div></div><div><div className="text-2xl font-black text-white">{playerEntry?.poles ?? 0}</div><div className="text-[10px] text-slate-500">poles</div></div></div>
        </div>
      </div>
    </div>
  );
};
