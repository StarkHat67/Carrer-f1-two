import React, { useState } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { CareerProvider, useCareer } from './features/career/CareerContext';
import { AuthModal } from './features/auth/AuthModal';
import { Header } from './components/common/Header';
import { Navigation, TabType } from './components/common/Navigation';
import { DashboardView } from './features/career/DashboardView';
import { CareerView } from './features/career/CareerView';
import { WorldHubView } from './features/world/WorldHubView';
import { MoreHubView } from './features/more/MoreHubView';
import { NewCareerModal } from './features/career/NewCareerModal';
import { DriverProfileModal } from './features/drivers/DriverProfileModal';
import { WorldDriver } from './types/database';
import { Flag, Plus } from 'lucide-react';

function MotorsportApp() {
  const { currentUser, loading: authLoading } = useAuth();
  const { activeWorld, saves, teams, countries, series, loadingSaves } = useCareer();
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isNewCareerOpen, setIsNewCareerOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<WorldDriver | null>(null);

  if (authLoading) return <div className="min-h-screen bg-[#090b10] flex items-center justify-center text-slate-500 text-sm">Carregando...</div>;
  if (!currentUser) return <AuthModal />;

  const firstCareer = !activeWorld && !loadingSaves && saves.length === 0;

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 pb-20 md:pb-0">
      <Header onOpenNewCareer={() => setIsNewCareerOpen(true)} />
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} hasActiveWorld={!!activeWorld} />

      {firstCareer ? (
        <main className="max-w-lg mx-auto px-5 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-600 mx-auto flex items-center justify-center"><Flag className="w-6 h-6 text-white" /></div>
          <h1 className="text-2xl font-black text-white mt-5">Comece pela F4 Brasil.</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">Crie seu piloto aos 16 anos e entre no grid real de 2026. A partir daí, a história deixa de ser real e passa a ser sua.</p>
          <button onClick={()=>setIsNewCareerOpen(true)} className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black"><Plus className="w-4 h-4"/>CRIAR CARREIRA</button>
        </main>
      ) : !activeWorld && currentTab !== 'more' ? (
        <main className="max-w-lg mx-auto px-5 py-20 text-center"><p className="text-sm text-slate-400">Selecione uma carreira em Mais → Carreiras.</p><button onClick={()=>setCurrentTab('more')} className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">Abrir carreiras</button></main>
      ) : (
        <main>
          {currentTab === 'home' && <DashboardView onNavigateToSeason={()=>setCurrentTab('world')} onNavigateToCareer={()=>setCurrentTab('career')} />}
          {currentTab === 'career' && <CareerView />}
          {currentTab === 'world' && <WorldHubView onSelectDriver={setSelectedDriver} />}
          {currentTab === 'more' && <MoreHubView onOpenNewCareer={()=>setIsNewCareerOpen(true)} onSelectSaveSuccess={()=>setCurrentTab('home')} />}
        </main>
      )}

      <NewCareerModal isOpen={isNewCareerOpen} onClose={()=>setIsNewCareerOpen(false)} onSuccess={()=>setCurrentTab('home')} />
      <DriverProfileModal driver={selectedDriver} onClose={()=>setSelectedDriver(null)} countries={countries} teams={teams} series={series} currentYear={activeWorld?.current_year || 2026} />
    </div>
  );
}

export default function App() {
  return <AuthProvider><CareerProvider><MotorsportApp /></CareerProvider></AuthProvider>;
}
