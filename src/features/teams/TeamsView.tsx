import React, { useState, useEffect, useMemo } from 'react';
import { useCareer } from '../career/CareerContext';
import { useAuth } from '../auth/AuthContext';
import { WorldTeam, WorldDriver } from '../../types/database';
import { TeamColorBadge, TeamColorStripe } from '../../components/common/TeamColorBadge';
import { AttributeBar } from '../../components/common/AttributeBar';
import { Shield, Search, X, ChevronRight, Users, Wrench } from 'lucide-react';

export const TeamsView: React.FC = () => {
  const { activeWorld, countries, series } = useCareer();
  const { repo } = useAuth();

  const [teams, setTeams] = useState<WorldTeam[]>([]);
  const [drivers, setDrivers] = useState<WorldDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<WorldTeam | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!activeWorld) return;
      try {
        setLoading(true);
        const [teamList, driverList] = await Promise.all([
          repo.getWorldTeams(activeWorld.id),
          repo.getWorldDrivers(activeWorld.id),
        ]);
        setTeams(teamList);
        setDrivers(driverList);
      } catch (err) {
        console.error('Erro ao carregar equipes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeWorld, repo]);

  const countryMap = useMemo(() => {
    return new Map(countries.map((c) => [c.id, c]));
  }, [countries]);

  const seriesMap = useMemo(() => {
    return new Map(series.map((s) => [s.id, s]));
  }, [series]);

  // Mapa de equipe -> pilotos da equipe
  const teamDriversMap = useMemo(() => {
    const map = new Map<string, WorldDriver[]>();
    for (const d of drivers) {
      if (d.current_team_id) {
        const list = map.get(d.current_team_id) || [];
        list.push(d);
        map.set(d.current_team_id, list);
      }
    }
    return map;
  }, [drivers]);

  // Agrupamento por categoria
  const groupedSeries = useMemo(() => {
    // Ordena as categorias do topo até a base
    const sortedSeries = [...series].sort((a, b) => a.tier - b.tier);

    return sortedSeries.map((szn) => {
      let sznTeams = teams.filter((t) => t.current_series_id === szn.id);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        sznTeams = sznTeams.filter((t) => t.name.toLowerCase().includes(q));
      }
      return {
        series: szn,
        teams: sznTeams,
      };
    });
  }, [series, teams, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-6 space-y-6">
      {/* Header */}
      <div className="bg-[#121620] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center font-black">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
              Equipes & Construtores
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Construtores organizados por categoria de competição
            </p>
          </div>
        </div>

        {/* Busca por Nome */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar construtor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs">Carregando construtores...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedSeries.map(({ series: szn, teams: sznTeams }) => {
            if (sznTeams.length === 0) return null;

            return (
              <div key={szn.id} className="space-y-4">
                {/* Título da Categoria */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-red-500 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/50">
                      Tier {szn.tier}
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-slate-100 uppercase">
                      {szn.name}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {sznTeams.length} {sznTeams.length === 1 ? 'Equipe' : 'Equipes'}
                  </span>
                </div>

                {/* Grid de Cards de Equipe */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sznTeams.map((team) => {
                    const country = countryMap.get(team.country_id);
                    const teamDrivers = teamDriversMap.get(team.id) || [];

                    return (
                      <div
                        key={team.id}
                        onClick={() => setSelectedTeam(team)}
                        className="bg-[#121620] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 relative overflow-hidden transition-all hover:shadow-xl cursor-pointer flex flex-col justify-between"
                      >
                        {/* Faixa decorativa com as cores da equipe */}
                        <div className="absolute top-0 left-0 right-0">
                          <TeamColorStripe
                            primary={team.primary_color}
                            secondary={team.secondary_color}
                            height="h-1.5"
                          />
                        </div>

                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3 pt-1">
                            <div>
                              <h3 className="text-base font-black text-slate-100">
                                {team.name}
                              </h3>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {country?.flag_emoji} {country?.name} • Fundada em {team.founded_year}
                              </p>
                            </div>

                            <TeamColorBadge
                              primaryColor={team.primary_color}
                              secondaryColor={team.secondary_color}
                              size="md"
                            />
                          </div>

                          {/* Barras de Desempenho e Confiabilidade */}
                          <div className="space-y-2.5 py-3 border-y border-slate-800/80 my-3">
                            <AttributeBar
                              label="Desempenho"
                              value={team.performance}
                              compact
                            />
                            <AttributeBar
                              label="Confiabilidade"
                              value={team.reliability}
                              compact
                            />
                          </div>
                        </div>

                        {/* Pilotos Atuais da Equipe */}
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            Pilotos Atuais
                          </span>

                          {teamDrivers.length > 0 ? (
                            <div className="space-y-1">
                              {teamDrivers.map((d) => {
                                const dCountry = d.nationality_country_id ? countryMap.get(d.nationality_country_id) : undefined;
                                return (
                                  <div
                                    key={d.id}
                                    className="flex items-center justify-between text-xs bg-[#0a0d14] px-2.5 py-1.5 rounded-lg border border-slate-800/80"
                                  >
                                    <span className="text-slate-200 font-semibold truncate">
                                      {dCountry?.flag_emoji} {d.first_name} {d.last_name}
                                    </span>
                                    <span className="font-mono text-slate-400 font-bold ml-2">
                                      {d.overall}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600 italic">Vagas em aberto</span>
                          )}

                          <div className="mt-4 flex items-center justify-end text-xs text-red-400 font-semibold">
                            <span>Ver Detalhes</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes da Equipe */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#121620] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0">
              <TeamColorStripe
                primary={selectedTeam.primary_color}
                secondary={selectedTeam.secondary_color}
                height="h-2"
              />
            </div>

            <div className="p-6 pt-7 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {countryMap.get(selectedTeam.country_id)?.flag_emoji}
                    </span>
                    <h2 className="text-xl font-black text-slate-100">
                      {selectedTeam.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {seriesMap.get(selectedTeam.current_series_id)?.name}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedTeam(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#0a0d14] p-4 rounded-xl border border-slate-800 space-y-3">
                <AttributeBar label="Desempenho Geral do Carro" value={selectedTeam.performance} />
                <AttributeBar label="Confiabilidade Mecânica" value={selectedTeam.reliability} />
                <AttributeBar label="Instalações de Fábrica" value={selectedTeam.facilities} />
                <AttributeBar label="Desenvolvimento Técnico" value={selectedTeam.development} />
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Pilotos Titulares
                </h4>
                <div className="space-y-2">
                  {(teamDriversMap.get(selectedTeam.id) || []).map((d) => {
                    const c = d.nationality_country_id ? countryMap.get(d.nationality_country_id) : undefined;
                    return (
                      <div
                        key={d.id}
                        className="flex items-center justify-between p-3 bg-[#0a0d14] rounded-xl border border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <span>{c?.flag_emoji}</span>
                          <span className="text-sm font-bold text-slate-100">
                            {d.first_name} {d.last_name}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-200 bg-[#121620] px-2.5 py-1 rounded-lg border border-slate-800">
                          {d.overall} OVR
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
