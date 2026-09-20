import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  GameWorld,
  PlayerCareer,
  WorldDriver,
  WorldTeam,
  Country,
  Series,
} from '../../types/database';
import { useAuth } from '../auth/AuthContext';
import { CreateNewCareerPayload } from '../../game/world/creation';

interface CareerContextType {
  saves: GameWorld[];
  activeWorld: GameWorld | null;
  playerCareer: PlayerCareer | null;
  playerDriver: WorldDriver | null;
  playerTeam: WorldTeam | null;
  teams: WorldTeam[];
  countries: Country[];
  series: Series[];
  loadingSaves: boolean;
  loadingWorld: boolean;
  loadSaves: () => Promise<void>;
  selectWorld: (world: GameWorld | null) => Promise<void>;
  createNewCareer: (payload: Omit<CreateNewCareerPayload, 'userId'>) => Promise<string>;
  deleteSave: (worldId: string) => Promise<boolean>;
  refreshActiveWorldData: () => Promise<void>;
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

export function CareerProvider({ children }: { children: ReactNode }) {
  const { currentUser, repo } = useAuth();

  const [saves, setSaves] = useState<GameWorld[]>([]);
  const [activeWorld, setActiveWorld] = useState<GameWorld | null>(null);
  const [playerCareer, setPlayerCareer] = useState<PlayerCareer | null>(null);
  const [playerDriver, setPlayerDriver] = useState<WorldDriver | null>(null);
  const [playerTeam, setPlayerTeam] = useState<WorldTeam | null>(null);
  const [teams, setTeams] = useState<WorldTeam[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [series, setSeries] = useState<Series[]>([]);

  const [loadingSaves, setLoadingSaves] = useState<boolean>(true);
  const [loadingWorld, setLoadingWorld] = useState<boolean>(false);

  // Carrega catálogo global de países e séries
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [cList, sList] = await Promise.all([
          repo.getCountries(),
          repo.getSeries(),
        ]);
        setCountries(cList);
        setSeries(sList);
      } catch (err) {
        console.error('Erro ao carregar catálogo base:', err);
      }
    }
    loadCatalog();
  }, [repo]);

  // Carrega os saves do usuário conectado
  const loadSaves = useCallback(async () => {
    if (!currentUser) {
      setSaves([]);
      setActiveWorld(null);
      setLoadingSaves(false);
      return;
    }
    try {
      setLoadingSaves(true);
      const list = await repo.listWorlds(currentUser.id);
      setSaves(list);

      // Se houver um save ativo memorizado ou primeiro save, carrega
      const savedWorldId = localStorage.getItem(`active_world_${currentUser.id}`);
      const found = list.find(w => w.id === savedWorldId) || list[0] || null;
      if (found && (!activeWorld || activeWorld.id !== found.id)) {
        await selectWorld(found);
      }
    } catch (err) {
      console.error('Erro ao listar saves:', err);
    } finally {
      setLoadingSaves(false);
    }
  }, [currentUser, repo]);

  useEffect(() => {
    loadSaves();
  }, [loadSaves]);

  // Carrega dados completos do save selecionado
  const selectWorld = async (world: GameWorld | null) => {
    if (!world) {
      setActiveWorld(null);
      setPlayerCareer(null);
      setPlayerDriver(null);
      setPlayerTeam(null);
      setTeams([]);
      if (currentUser) {
        localStorage.removeItem(`active_world_${currentUser.id}`);
      }
      return;
    }

    try {
      setLoadingWorld(true);
      setActiveWorld(world);
      if (currentUser) {
        localStorage.setItem(`active_world_${currentUser.id}`, world.id);
      }

      const [career, driver, worldTeams] = await Promise.all([
        repo.getPlayerCareer(world.id),
        repo.getPlayerDriver(world.id),
        repo.getWorldTeams(world.id),
      ]);

      setPlayerCareer(career);
      setPlayerDriver(driver);
      setTeams(worldTeams);

      if (driver?.current_team_id) {
        const team = worldTeams.find(t => t.id === driver.current_team_id) || await repo.getWorldTeam(world.id, driver.current_team_id);
        setPlayerTeam(team);
      } else {
        setPlayerTeam(null);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do mundo:', err);
    } finally {
      setLoadingWorld(false);
    }
  };

  const refreshActiveWorldData = async () => {
    if (activeWorld) {
      await selectWorld(activeWorld);
    }
  };

  const createNewCareer = async (payload: Omit<CreateNewCareerPayload, 'userId'>): Promise<string> => {
    if (!currentUser) throw new Error('Usuário não autenticado');

    const result = await repo.createWorld({
      ...payload,
      userId: currentUser.id,
    });

    // Atualiza lista de saves e define novo mundo como ativo
    await loadSaves();
    await selectWorld(result.gameWorld);
    return result.gameWorld.id;
  };

  const deleteSave = async (worldId: string): Promise<boolean> => {
    const success = await repo.deleteWorld(worldId);
    if (success) {
      if (activeWorld?.id === worldId) {
        setActiveWorld(null);
        setPlayerCareer(null);
        setPlayerDriver(null);
        setPlayerTeam(null);
      }
      await loadSaves();
    }
    return success;
  };

  return (
    <CareerContext.Provider
      value={{
        saves,
        activeWorld,
        playerCareer,
        playerDriver,
        playerTeam,
        teams,
        countries,
        series,
        loadingSaves,
        loadingWorld,
        loadSaves,
        selectWorld,
        createNewCareer,
        deleteSave,
        refreshActiveWorldData,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const ctx = useContext(CareerContext);
  if (!ctx) {
    throw new Error('useCareer deve ser usado dentro de um CareerProvider');
  }
  return ctx;
}
