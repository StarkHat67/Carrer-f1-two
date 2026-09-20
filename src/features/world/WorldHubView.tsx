import React, { useState } from 'react';
import { SeasonView } from '../season/SeasonView';
import { DriversView } from '../drivers/DriversView';
import { TeamsView } from '../teams/TeamsView';
import { WorldDriver } from '../../types/database';

type WorldSection = 'season'|'drivers'|'teams';
interface Props { onSelectDriver:(driver:WorldDriver)=>void; }
export const WorldHubView:React.FC<Props>=({onSelectDriver})=>{
 const [section,setSection]=useState<WorldSection>('season');
 return <div><div className="max-w-5xl mx-auto px-4 pt-5"><div className="inline-flex p-1 bg-[#11141b] border border-white/10 rounded-xl">{([['season','Temporada'],['drivers','Pilotos'],['teams','Equipes']] as const).map(([id,label])=><button key={id} onClick={()=>setSection(id)} className={`px-3 py-2 rounded-lg text-xs font-bold ${section===id?'bg-white/10 text-white':'text-slate-500 hover:text-slate-200'}`}>{label}</button>)}</div></div>{section==='season'&&<SeasonView/>}{section==='drivers'&&<DriversView onSelectDriver={onSelectDriver}/>} {section==='teams'&&<TeamsView/>}</div>
}
