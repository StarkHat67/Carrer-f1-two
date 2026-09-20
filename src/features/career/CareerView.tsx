import React from 'react';
import { useCareer } from './CareerContext';
import { AttributeBar } from '../../components/common/AttributeBar';

export const CareerView: React.FC = () => {
  const { activeWorld, playerDriver, playerCareer, playerTeam, countries, series } = useCareer();
  if (!activeWorld || !playerDriver || !playerCareer) return null;
  const country = countries.find(c=>c.id===playerDriver.nationality_country_id);
  const category = series.find(s=>s.id===playerDriver.current_series_id);
  const age = playerDriver.birth_date ? activeWorld.current_year - Number(playerDriver.birth_date.slice(0,4)) : 16;
  const groups = [
    ['Velocidade', [['Qualificação',playerDriver.qualifying],['Ritmo de corrida',playerDriver.racecraft]]],
    ['Disputa', [['Ultrapassagem',playerDriver.overtaking],['Defesa',playerDriver.defending],['Largadas',playerDriver.starts]]],
    ['Controle', [['Consistência',playerDriver.consistency],['Chuva',playerDriver.wet_skill],['Pneus',playerDriver.tyre_management]]],
    ['Mental', [['Confiança',playerDriver.confidence],['Adaptação',playerDriver.adaptability],['Experiência',playerDriver.experience]]],
  ] as const;
  return <div className="max-w-5xl mx-auto px-4 py-5 md:py-8 space-y-5">
    <section className="rounded-2xl border border-white/10 bg-[#11141b] overflow-hidden">
      <div className="h-1" style={{background:playerTeam?.primary_color||'#dc2626'}}/>
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><div className="text-xs text-slate-500">{country?.flag_emoji||'🏁'} {country?.name||'Nacionalidade não informada'} · {age} anos</div><h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{playerDriver.first_name} {playerDriver.last_name}</h1><div className="text-sm text-slate-400 mt-1">#{playerCareer.racing_number} · {category?.name} · {playerTeam?.name}</div></div><div className="text-center shrink-0"><div className="text-[10px] text-slate-500 font-bold">OVR</div><div className="text-4xl font-black text-white leading-none mt-1">{playerDriver.overall}</div><div className="text-[10px] text-slate-500 mt-1">POT {playerDriver.potential}</div></div></div>
        <div className="mt-5 inline-flex px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300">Estilo: {playerCareer.driving_style}</div>
      </div>
    </section>
    <div className="grid md:grid-cols-2 gap-4">{groups.map(([title,attrs])=><section key={title} className="rounded-2xl border border-white/10 bg-[#11141b] p-5"><h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">{title}</h2><div className="space-y-4">{attrs.map(([label,value])=><AttributeBar key={label} label={label} value={value}/>)}</div></section>)}</div>
    <section className="rounded-2xl border border-white/10 bg-[#11141b] p-5"><div className="grid grid-cols-3 gap-3 text-center"><div><div className="text-2xl font-black text-white">{playerDriver.reputation}</div><div className="text-[10px] text-slate-500">reputação</div></div><div><div className="text-2xl font-black text-white">{playerDriver.fame}</div><div className="text-[10px] text-slate-500">fama</div></div><div><div className="text-2xl font-black text-white">{playerDriver.aggression}</div><div className="text-[10px] text-slate-500">agressividade</div></div></div></section>
  </div>;
};
