import React, { useState } from 'react';
import { SavesView } from '../saves/SavesView';
import { HistoryView } from '../history/HistoryView';
import { SettingsView } from '../settings/SettingsView';

type Section='saves'|'history'|'settings';
interface Props { onOpenNewCareer:()=>void; onSelectSaveSuccess:()=>void; }
export const MoreHubView:React.FC<Props>=({onOpenNewCareer,onSelectSaveSuccess})=>{
 const [section,setSection]=useState<Section>('saves');
 return <div><div className="max-w-5xl mx-auto px-4 pt-5"><div className="inline-flex p-1 bg-[#11141b] border border-white/10 rounded-xl">{([['saves','Carreiras'],['history','Histórico'],['settings','Configurações']] as const).map(([id,label])=><button key={id} onClick={()=>setSection(id)} className={`px-3 py-2 rounded-lg text-xs font-bold ${section===id?'bg-white/10 text-white':'text-slate-500 hover:text-slate-200'}`}>{label}</button>)}</div></div>{section==='saves'&&<SavesView onOpenNewCareer={onOpenNewCareer} onSelectSaveSuccess={onSelectSaveSuccess}/>} {section==='history'&&<HistoryView/>}{section==='settings'&&<SettingsView/>}</div>
}
