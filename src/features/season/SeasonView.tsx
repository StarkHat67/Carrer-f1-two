import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Flag, Play, Trophy } from 'lucide-react';
import { useCareer } from '../career/CareerContext';
import { useAuth } from '../auth/AuthContext';
import {
  ChampionshipEntry,
  Race,
  RaceResult,
  Season,
  SeasonRound,
  WorldDriver,
} from '../../types/database';
import { WeekendSimulation } from '../../game/racing/simulateWeekend';

interface StoredRaceResult {
  race: Race;
  results: RaceResult[];
}

export const SeasonView: React.FC = () => {
  const { activeWorld, playerDriver, teams, countries, refreshActiveWorldData } = useCareer();
  const { repo } = useAuth();
  const [season, setSeason] = useState<Season | null>(null);
  const [rounds, setRounds] = useState<SeasonRound[]>([]);
  const [entries, setEntries] = useState<ChampionshipEntry[]>([]);
  const [drivers, setDrivers] = useState<WorldDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastWeekend, setLastWeekend] = useState<WeekendSimulation | null>(null);
  const [lastRoundName, setLastRoundName] = useState<string>('');
  const [openRoundId, setOpenRoundId] = useState<string | null>(null);
  const [storedResults, setStoredResults] = useState<StoredRaceResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const load = async () => {
    if (!activeWorld) return;
    setLoading(true);
    try {
      const currentSeason = await repo.getCurrentSeason(activeWorld.id);
      setSeason(currentSeason);
      if (currentSeason) {
        const [seasonRounds, seasonEntries, seasonDrivers] = await Promise.all([
          repo.getSeasonRounds(activeWorld.id, currentSeason.id),
          repo.getChampionshipEntries(activeWorld.id, currentSeason.id),
          repo.getWorldDrivers(activeWorld.id, { seriesId: currentSeason.series_id }),
        ]);
        setRounds(seasonRounds);
        setEntries(seasonEntries);
        setDrivers(seasonDrivers);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [activeWorld?.id]);

  const driverMap = useMemo(() => new Map(drivers.map((driver) => [driver.id, driver])), [drivers]);
  const teamMap = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const countryMap = useMemo(() => new Map(countries.map((country) => [country.id, country])), [countries]);
  const standings = useMemo(
    () => [...entries].sort((a, b) => b.points - a.points || b.wins - a.wins || b.podiums - a.podiums),
    [entries],
  );
  const nextRound = rounds.find((round) => round.status === 'scheduled');

  const play = async () => {
    if (!activeWorld || !nextRound || playing) return;
    setError(null);
    setPlaying(true);
    try {
      const simulation = await repo.playNextRound(activeWorld.id);
      setLastWeekend(simulation);
      setLastRoundName(nextRound.name);
      setOpenRoundId(null);
      setStoredResults([]);
      await refreshActiveWorldData();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível simular a etapa.');
    } finally {
      setPlaying(false);
    }
  };

  const toggleStoredResults = async (round: SeasonRound) => {
    if (!activeWorld || round.status !== 'completed') return;
    if (openRoundId === round.id) {
      setOpenRoundId(null);
      return;
    }

    setOpenRoundId(round.id);
    setLoadingResults(true);
    try {
      const races = await repo.getRacesByRound(activeWorld.id, round.id);
      const data = await Promise.all(
        races.map(async (race) => ({
          race,
          results: await repo.getRaceResults(activeWorld.id, race.id),
        })),
      );
      setStoredResults(data);
    } finally {
      setLoadingResults(false);
    }
  };

  if (!activeWorld) return null;
  if (loading) {
    return <div className="max-w-5xl mx-auto p-8 text-sm text-slate-500">Carregando temporada...</div>;
  }

  const playerWeekend = lastWeekend && playerDriver
    ? lastWeekend.races.map((race) => race.results.find((result) => result.driver_id === playerDriver.id))
    : [];
  const qualifyingPosition = playerWeekend[0]?.grid_position ?? null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 md:py-8 space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs text-red-500 font-black">F4 BRASIL</div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Temporada {activeWorld.current_year}</h1>
        </div>
        <div className="text-xs text-slate-500">{rounds.filter((round) => round.status === 'completed').length}/{rounds.length} etapas</div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-3 text-xs text-red-300">{error}</div>
      )}

      {lastWeekend && playerDriver && (
        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Etapa concluída</div>
              <h2 className="text-xl font-black text-white mt-1">{lastRoundName}</h2>
            </div>
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <ResultTile label="Quali" value={qualifyingPosition ? `P${qualifyingPosition}` : '—'} />
            {playerWeekend.map((result, index) => (
              <ResultTile
                key={index}
                label={`Corrida ${index + 1}`}
                value={result?.finish_position ? `P${result.finish_position}` : 'DNF'}
                sub={result ? `${result.points_awarded} pts${result.fastest_lap ? ' · melhor volta' : ''}` : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {nextRound ? (
        <section className="rounded-2xl border border-white/10 bg-[#11141b] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black text-red-400 uppercase tracking-wider">Etapa {nextRound.round_number}</div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{nextRound.name}</h2>
              <p className="text-sm text-slate-400 mt-1">{nextRound.circuit_name}</p>
            </div>
            <Flag className="w-6 h-6 text-slate-600" />
          </div>
          <div className="grid grid-cols-3 gap-2 my-5 text-center">
            <MiniStat value="Q" label="classificação" />
            <MiniStat value="3" label="corridas" />
            <MiniStat value={String(standings.length)} label="pilotos" />
          </div>
          <button
            onClick={play}
            disabled={playing}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            {playing ? 'SIMULANDO...' : 'CORRER ETAPA'}
          </button>
        </section>
      ) : (
        <section className="rounded-2xl border border-white/10 bg-[#11141b] p-6">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-black text-white mt-3">Temporada concluída</h2>
          <p className="text-sm text-slate-400 mt-1">O campeonato terminou. A promoção de categoria será decidida na próxima evolução do sistema.</p>
        </section>
      )}

      <section className="rounded-2xl border border-white/10 bg-[#11141b] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-black text-white">Classificação</h2>
          <span className="text-[10px] text-slate-500">PTS · V · PÓDIOS</span>
        </div>
        <div className="divide-y divide-white/5">
          {standings.map((entry, index) => {
            const driver = driverMap.get(entry.driver_id);
            const team = teamMap.get(entry.team_id);
            const country = driver?.nationality_country_id ? countryMap.get(driver.nationality_country_id) : undefined;
            const isPlayer = driver?.id === playerDriver?.id;
            return (
              <div key={entry.id} className={`grid grid-cols-[32px_1fr_auto] items-center gap-3 px-4 py-3 ${isPlayer ? 'bg-red-950/20' : ''}`}>
                <div className={`text-sm font-black ${index < 3 ? 'text-white' : 'text-slate-500'}`}>{index + 1}</div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-100 truncate">
                    {country?.flag_emoji || '🏁'} {driver?.first_name} {driver?.last_name}
                    {isPlayer && <span className="text-[9px] ml-1 text-red-400">VOCÊ</span>}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{team?.name || '—'} · {entry.wins}V · {entry.podiums}P</div>
                </div>
                <div className="text-base font-black text-white">{entry.points}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#11141b] p-4">
        <h2 className="text-sm font-black text-white mb-3">Calendário</h2>
        <div className="space-y-1">
          {rounds.map((round) => (
            <React.Fragment key={round.id}>
              <button
                type="button"
                disabled={round.status !== 'completed'}
                onClick={() => void toggleStoredResults(round)}
                className={`w-full flex items-center justify-between gap-3 py-2 border-b border-white/5 text-left ${round.status === 'completed' ? 'cursor-pointer hover:bg-white/[0.02]' : 'cursor-default'}`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">{round.round_number}. {round.name}</div>
                  <div className="text-[10px] text-slate-500">{round.circuit_name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold ${round.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {round.status === 'completed' ? 'CONCLUÍDA' : 'A DISPUTAR'}
                  </span>
                  {round.status === 'completed' && (openRoundId === round.id ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />)}
                </div>
              </button>

              {openRoundId === round.id && (
                <div className="py-3 px-1 border-b border-white/5">
                  {loadingResults ? (
                    <div className="text-xs text-slate-500 py-3">Carregando resultados...</div>
                  ) : storedResults.length === 0 ? (
                    <div className="text-xs text-slate-500 py-3">Nenhum resultado salvo para esta etapa.</div>
                  ) : (
                    <div className="grid gap-3 lg:grid-cols-3">
                      {storedResults.map(({ race, results }) => (
                        <StoredRaceTable
                          key={race.id}
                          race={race}
                          results={results}
                          driverMap={driverMap}
                          playerDriverId={playerDriver?.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  );
};

const MiniStat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="bg-black/20 rounded-xl p-3">
    <div className="text-lg font-black text-white">{value}</div>
    <div className="text-[10px] text-slate-500">{label}</div>
  </div>
);

const ResultTile: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
    <div className="text-[10px] uppercase font-bold text-slate-500">{label}</div>
    <div className="text-xl font-black text-white mt-1">{value}</div>
    {sub && <div className="text-[10px] text-slate-500 mt-1">{sub}</div>}
  </div>
);

const StoredRaceTable: React.FC<{
  race: Race;
  results: RaceResult[];
  driverMap: Map<string, WorldDriver>;
  playerDriverId?: string;
}> = ({ race, results, driverMap, playerDriverId }) => (
  <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
    <div className="px-3 py-2 border-b border-white/10 text-[11px] font-black text-slate-200">Corrida {race.race_number}</div>
    <div className="divide-y divide-white/5">
      {results.slice(0, 10).map((result, index) => {
        const driver = driverMap.get(result.driver_id);
        const isPlayer = result.driver_id === playerDriverId;
        return (
          <div key={result.id} className={`grid grid-cols-[24px_1fr_auto] gap-2 px-3 py-2 text-[11px] ${isPlayer ? 'bg-red-950/20' : ''}`}>
            <span className="font-black text-slate-500">{result.finish_position ?? '—'}</span>
            <span className={`truncate ${isPlayer ? 'text-red-300 font-bold' : 'text-slate-300'}`}>{driver ? `${driver.first_name} ${driver.last_name}` : 'Piloto'}</span>
            <span className="font-bold text-slate-400">{result.points_awarded}</span>
          </div>
        );
      })}
    </div>
  </div>
);
