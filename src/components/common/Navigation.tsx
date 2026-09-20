import React from 'react';
import { Home, Gauge, Globe2, Menu } from 'lucide-react';

export type TabType = 'home' | 'career' | 'world' | 'more';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  hasActiveWorld: boolean;
}

const tabs = [
  { id: 'home' as TabType, label: 'Início', icon: Home, requiresWorld: true },
  { id: 'career' as TabType, label: 'Carreira', icon: Gauge, requiresWorld: true },
  { id: 'world' as TabType, label: 'Mundo', icon: Globe2, requiresWorld: true },
  { id: 'more' as TabType, label: 'Mais', icon: Menu, requiresWorld: false },
];

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab, hasActiveWorld }) => (
  <nav className="fixed md:sticky bottom-0 md:top-[57px] left-0 right-0 z-30 bg-[#0b0d12]/95 backdrop-blur border-t md:border-t-0 md:border-b border-white/10">
    <div className="max-w-6xl mx-auto flex items-center justify-around md:justify-start md:gap-2 px-2 md:px-4 py-1.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const disabled = tab.requiresWorld && !hasActiveWorld;
        const active = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            disabled={disabled}
            onClick={() => onSelectTab(tab.id)}
            className={`min-w-[70px] md:min-w-0 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-colors ${
              active ? 'text-white bg-white/10' : disabled ? 'text-slate-700' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className={`w-4 h-4 ${active ? 'text-red-500' : ''}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);
