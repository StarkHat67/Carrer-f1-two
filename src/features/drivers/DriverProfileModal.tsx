import React from 'react';
import { WorldDriver, Country, WorldTeam, Series } from '../../types/database';
import { TeamColorBadge, TeamColorStripe } from '../../components/common/TeamColorBadge';
import { AttributeBar } from '../../components/common/AttributeBar';
import { X, Activity, Award } from 'lucide-react';

interface DriverProfileModalProps {
  driver: WorldDriver | null;
  onClose: () => void;
  countries: Country[];
  teams: WorldTeam[];
  series: Series[];
  currentYear: number;
}

export const DriverProfileModal: React.FC<DriverProfileModalProps> = ({
  driver,
  onClose,
  countries,
  teams,
  series,
  currentYear,
}) => {
  if (!driver) return null;

  const country = countries.find((c) => c.id === driver.nationality_country_id);
  const team = teams.find((t) => t.id === driver.current_team_id);
  const currentSeries = series.find((s) => s.id === driver.current_series_id);

  const birthYear = driver.birth_date ? parseInt(driver.birth_date.slice(0, 4), 10) : null;
  const age = birthYear ? currentYear - birthYear : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#121620] border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl my-auto overflow-hidden">
        {/* Faixa decorativa com as cores da equipe */}
        {team && (
          <div className="absolute top-0 left-0 right-0">
            <TeamColorStripe
              primary={team.primary_color}
              secondary={team.secondary_color}
              height="h-1.5"
            />
          </div>
        )}

        {/* Header do Piloto */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5 pt-1">
          <div className="flex items-center gap-3.5">
            <div className="text-3xl sm:text-4xl" title={country?.name}>
              {country?.flag_emoji || '🏁'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
                  {driver.first_name} {driver.last_name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#0a0d14] text-slate-300 border border-slate-800">
                  {driver.career_status === 'active' ? 'Piloto Ativo' : driver.career_status}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-400 mt-1 flex-wrap">
                <span>{country?.name}</span>
                <span className="text-slate-700">•</span>
                <span>{age ? `${age} anos` : 'idade não informada'}</span>
                <span className="text-slate-700">•</span>
                <span>Estreia: {driver.debut_year}</span>
              </div>
            </div>
          </div>

          <button
            id="btn-close-driver-profile"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações de Equipe e Categoria */}
        <div className="bg-[#0a0d14] p-3.5 rounded-xl border border-slate-800 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {team ? (
              <>
                <TeamColorBadge
                  primaryColor={team.primary_color}
                  secondaryColor={team.secondary_color}
                  size="md"
                />
                <span className="text-slate-200 font-bold">{team.name}</span>
              </>
            ) : (
              <span className="text-slate-500">Sem equipe contratada</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Categoria:</span>
            <span className="text-slate-100 font-semibold">
              {currentSeries?.name || 'Não atribuída'}
            </span>
          </div>
        </div>

        {/* Métricas Principais (OVR, POT, REP, FAME) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#0a0d14] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
              Overall (OVR)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-black text-slate-100">
                {driver.overall}
              </span>
              <span className="text-xs text-slate-600 font-mono">/99</span>
            </div>
          </div>

          <div className="bg-[#0a0d14] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
              Potencial
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-black text-emerald-400">
                {driver.potential}
              </span>
              <span className="text-xs text-slate-600 font-mono">/99</span>
            </div>
          </div>

          <div className="bg-[#0a0d14] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
              Reputação
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-black text-slate-200">
                {driver.reputation}
              </span>
              <span className="text-xs text-slate-600 font-mono">%</span>
            </div>
          </div>

          <div className="bg-[#0a0d14] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
              Fama
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-black text-slate-200">
                {driver.fame}
              </span>
              <span className="text-xs text-slate-600 font-mono">%</span>
            </div>
          </div>
        </div>

        {/* Grid Completo de Atributos */}
        <div className="mb-6">
          <h3 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-red-500" />
            Atributos de Pilotagem
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            <AttributeBar label="Classificação (Volta Rápida)" value={driver.qualifying} />
            <AttributeBar label="Ritmo de Corrida" value={driver.racecraft} />
            <AttributeBar label="Consistência" value={driver.consistency} />
            <AttributeBar label="Habilidade na Chuva" value={driver.wet_skill} />
            <AttributeBar label="Agressividade" value={driver.aggression} />
            <AttributeBar label="Gestão de Pneus" value={driver.tyre_management} />
            <AttributeBar label="Largadas" value={driver.starts} />
            <AttributeBar label="Defesa de Posição" value={driver.defending} />
            <AttributeBar label="Ultrapassagens" value={driver.overtaking} />
            <AttributeBar label="Adaptação" value={driver.adaptability} />
            <AttributeBar label="Experiência" value={driver.experience} />
            <AttributeBar label="Confiança" value={driver.confidence} />
          </div>
        </div>

        {/* Botão de Fechar */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Fechar Perfil
          </button>
        </div>
      </div>
    </div>
  );
};
