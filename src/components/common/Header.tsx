import React from 'react';
import { Flag, Plus } from 'lucide-react';
import { useCareer } from '../../features/career/CareerContext';

interface HeaderProps { onOpenNewCareer: () => void; }

export const Header: React.FC<HeaderProps> = ({ onOpenNewCareer }) => {
  const { activeWorld, playerDriver, playerCareer, countries, series } = useCareer();
  const country = countries.find((c) => c.id === playerDriver?.nationality_country_id);
  const currentSeries = series.find((s) => s.id === playerDriver?.current_series_id);

  return (
    <header className="sticky top-0 z-40 h-[57px] bg-[#090b10]/95 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
            <Flag className="w-4 h-4 text-white" />
          </div>
          <div className="leading-none min-w-0">
            <div className="font-black tracking-tight text-sm sm:text-base text-white">APEX CAREER</div>
            {activeWorld && playerDriver && (
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                {country?.flag_emoji || '🏁'} {playerDriver.last_name} · #{playerCareer?.racing_number ?? playerDriver.racing_number ?? '--'} · {currentSeries?.short_name || '—'} · {activeWorld.current_year}
              </div>
            )}
          </div>
        </div>

        <button onClick={onOpenNewCareer} className="p-2 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5" title="Nova carreira">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
