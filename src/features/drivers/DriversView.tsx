import React, { useState, useEffect, useMemo } from 'react';
import { useCareer } from '../career/CareerContext';
import { useAuth } from '../auth/AuthContext';
import { WorldDriver, WorldTeam } from '../../types/database';
import { TeamColorBadge } from '../../components/common/TeamColorBadge';
import { Search, ChevronRight, User } from 'lucide-react';

interface DriversViewProps {
  onSelectDriver: (driver: WorldDriver) => void;
}

export const DriversView: React.FC<DriversViewProps> = ({ onSelectDriver }) => {
  const { activeWorld, countries, series, playerDriver } = useCareer();
  const { repo } = useAuth();

  const [drivers, setDrivers] = useState<WorldDriver[]>([]);
  const [teams, setTeams] = useState<WorldTeam[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros (Req. 20)
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      if (!activeWorld) return;
      try {
        setLoading(true);
        const [drvList, tmList] = await Promise.all([
          repo.getWorldDrivers(activeWorld.id),
          repo.getWorldTeams(activeWorld.id),
        ]);
        setDrivers(drvList);
        setTeams(tmList);
      } catch (err) {
        console.error('Erro ao carregar pilotos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeWorld, repo]);

  const countryMap = useMemo(() => {
    return new Map(countries.map((c) => [c.id, c]));
  }, [countries]);

  const teamMap = useMemo(() => {
    return new Map(teams.map((t) => [t.id, t]));
  }, [teams]);

  const seriesMap = useMemo(() => {
    return new Map(series.map((s) => [s.id, s]));
  }, [series]);

  const filteredDrivers = useMemo(() => {
    let result = [...drivers];

    if (selectedSeries !== 'all') {
      result = result.filter((d) => d.current_series_id === selectedSeries);
    }
    if (selectedTeam !== 'all') {
      result = result.filter((d) => d.current_team_id === selectedTeam);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) =>
        `${d.first_name} ${d.last_name}`.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => b.overall - a.overall);
  }, [drivers, selectedSeries, selectedTeam, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-6 space-y-6">
      {/* Header da Tela de Pilotos */}
      <div className="bg-[#121620] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center font-black">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
              Grid de Pilotos
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Pilotos ativos em todas as categorias de monopostos
            </p>
          </div>
        </div>

        <div className="text-xs bg-[#0a0d14] px-3.5 py-2 rounded-xl border border-slate-800 font-mono text-slate-400">
          Total de Pilotos: <span className="font-bold text-slate-200">{filteredDrivers.length}</span>
        </div>
      </div>

      {/* Barra de Filtros (Req. 20) */}
      <div className="bg-[#121620] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Busca por Nome */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome do piloto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Filtro por Categoria */}
          <div>
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Equipe */}
          <div>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="all">Todas as Equipes</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista / Tabela de Pilotos */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs">Carregando pilotos...</span>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="bg-[#121620] border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          <p className="text-sm">Nenhum piloto encontrado com os filtros selecionados.</p>
        </div>
      ) : (
        <>
          {/* Tabela Desktop */}
          <div className="hidden md:block bg-[#121620] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0d14] text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Piloto</th>
                  <th className="py-3 px-4">País</th>
                  <th className="py-3 px-4">Idade</th>
                  <th className="py-3 px-4">Equipe</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-center">Overall</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDrivers.map((driver) => {
                  const country = driver.nationality_country_id ? countryMap.get(driver.nationality_country_id) : undefined;
                  const team = driver.current_team_id ? teamMap.get(driver.current_team_id) : null;
                  const currentSzn = driver.current_series_id ? seriesMap.get(driver.current_series_id) : null;
                  const birthYear = driver.birth_date ? parseInt(driver.birth_date.slice(0, 4), 10) : null;
                  const currentYear = activeWorld?.current_year || 2026;
                  const age = birthYear ? currentYear - birthYear : null;
                  const isPlayer = playerDriver?.id === driver.id;

                  return (
                    <tr
                      key={driver.id}
                      onClick={() => onSelectDriver(driver)}
                      className={`hover:bg-[#171c2a] transition-colors cursor-pointer ${
                        isPlayer ? 'bg-red-950/15' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-2.5">
                        {isPlayer ? (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Você" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-700 shrink-0" />
                        )}
                        <span>
                          {driver.first_name} {driver.last_name}
                        </span>
                        {isPlayer && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600 text-white font-black uppercase">
                            VOCÊ
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="mr-1.5">{country?.flag_emoji}</span>
                        <span>{country?.name}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {age ? `${age} anos` : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-200">
                        {team ? (
                          <div className="flex items-center gap-2">
                            <TeamColorBadge
                              primaryColor={team.primary_color}
                              secondaryColor={team.secondary_color}
                              size="sm"
                            />
                            <span className="truncate max-w-[150px] font-medium">{team.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">Sem equipe</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {currentSzn?.short_name || 'Sem Categoria'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-md bg-[#0a0d14] border border-slate-800 text-slate-100">
                          {driver.overall}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-red-400 hover:text-red-300 text-xs font-semibold inline-flex items-center gap-0.5">
                          Ver Perfil
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards Mobile */}
          <div className="md:hidden space-y-3">
            {filteredDrivers.map((driver) => {
              const country = driver.nationality_country_id ? countryMap.get(driver.nationality_country_id) : undefined;
              const team = driver.current_team_id ? teamMap.get(driver.current_team_id) : null;
              const currentSzn = driver.current_series_id ? seriesMap.get(driver.current_series_id) : null;
              const birthYear = driver.birth_date ? parseInt(driver.birth_date.slice(0, 4), 10) : null;
              const currentYear = activeWorld?.current_year || 2026;
              const age = birthYear ? currentYear - birthYear : null;
              const isPlayer = playerDriver?.id === driver.id;

              return (
                <div
                  key={driver.id}
                  onClick={() => onSelectDriver(driver)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isPlayer
                      ? 'bg-red-950/20 border-red-500/50'
                      : 'bg-[#121620] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country?.flag_emoji}</span>
                      <h3 className="text-sm font-bold text-slate-100">
                        {driver.first_name} {driver.last_name}
                      </h3>
                      {isPlayer && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">
                          VOCÊ
                        </span>
                      )}
                    </div>

                    <span className="font-mono font-bold text-sm px-2 py-0.5 rounded bg-[#0a0d14] border border-slate-800 text-slate-100">
                      {driver.overall}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Equipe:</span>
                      <span className="text-slate-200 font-medium">{team?.name || 'Sem Equipe'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categoria:</span>
                      <span className="text-slate-200">{currentSzn?.short_name || 'Sem Categoria'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Idade:</span>
                      <span className="text-slate-300">{age ? `${age} anos` : '—'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
