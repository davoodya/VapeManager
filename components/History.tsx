
import React, { useState } from 'react';
import { WickingHistory, InventoryItem, CoilStats } from '../types';
import { useTranslation } from '../i18n';

interface HistoryProps {
  history: WickingHistory[];
  inventory: InventoryItem[];
  coils: CoilStats[];
}

const History: React.FC<HistoryProps> = ({ history, inventory, coils }) => {
  const { t, lang } = useTranslation();
  const [filterAtty, setFilterAtty] = useState<string>('all');

  const atomizers = inventory.filter(i => i.category === 'atomizer' || i.category === 'pod_system');
  
  const filteredHistory = filterAtty === 'all' 
    ? history 
    : history.filter(h => h.atomizerId === filterAtty);

  const getAttyName = (id: string) => inventory.find(i => i.id === id)?.name || (lang === 'fa' ? 'دستگاه نامعلوم' : 'Unknown Device');
  const getCoilName = (id?: string) => coils.find(c => c.id === id)?.name || t.customSetup;
  const getLiquidName = (id: string) => inventory.find(i => i.id === id)?.name || (lang === 'fa' ? 'لیکوئید نامعلوم' : 'Unknown Liquid');
  const getCottonName = (id: string) => inventory.find(i => i.id === id)?.name || (lang === 'fa' ? 'پنبه نامعلوم' : 'Unknown Cotton');

  return (
    <div className="p-4 space-y-6 pb-32 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-400">{t.history}</h2>
        <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 shadow-xl">
           <i className="fa-solid fa-clock-rotate-left text-blue-500"></i>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">{t.deviceSelection}</label>
        <select 
          value={filterAtty} 
          onChange={e => setFilterAtty(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 shadow-inner appearance-none"
        >
          <option value="all">{lang === 'fa' ? 'کل تاریخچه' : 'Full History'}</option>
          {atomizers.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div className="space-y-6">
        {filteredHistory.sort((a, b) => b.date - a.date).map((log) => (
          <div key={log.id} className="bg-slate-900/60 rounded-[3rem] p-7 border border-slate-800 relative overflow-hidden group shadow-2xl">
            <div className={`absolute top-7 ${lang === 'fa' ? 'left-7' : 'right-7'} text-[9px] font-black uppercase tracking-widest`}>
              {!log.isActive ? (
                <span className="text-slate-600 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">{t.archived}</span>
              ) : (
                <span className="text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/30">{t.active}</span>
              )}
            </div>

            <div className="mb-8">
              <h3 className="font-black text-2xl text-slate-100 leading-none mb-2 tracking-tight">{getAttyName(log.atomizerId)}</h3>
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
                {new Date(log.date).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')} • {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-950/60 p-5 rounded-[2rem] border border-slate-800/60">
                <div className="text-[8px] text-slate-600 font-black uppercase mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-microchip text-blue-500"></i> {t.coilConfig}
                </div>
                <div className="text-sm font-black text-slate-200 truncate">{getCoilName(log.coilId)}</div>
              </div>
              <div className="bg-slate-950/60 p-5 rounded-[2rem] border border-slate-800/60">
                <div className="text-[8px] text-slate-600 font-black uppercase mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-droplet text-indigo-500"></i> {t.flavorLiquid}
                </div>
                <div className="text-sm font-black text-slate-200 truncate">{getLiquidName(log.liquidId)}</div>
              </div>
              <div className="bg-slate-950/60 p-5 rounded-[2rem] border border-slate-800/60">
                <div className="text-[8px] text-slate-600 font-black uppercase mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-cloud text-slate-500"></i> {t.cottonBrand}
                </div>
                <div className="text-sm font-black text-slate-200 truncate">{getCottonName(log.cottonId)}</div>
              </div>
              <div className="bg-slate-950/60 p-5 rounded-[2rem] border border-slate-800/60">
                <div className="text-[8px] text-slate-600 font-black uppercase mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-green-500"></i> {t.mlUsed}
                </div>
                <div className="text-sm font-black text-slate-200">
                  {log.mlConsumed.toFixed(1)} <span className="text-[10px] text-slate-600">/ {log.maxWickLife}ml</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-800 px-4 py-2 rounded-full text-[10px] font-black uppercase text-slate-400 border border-slate-700 tracking-wider">
                 {t.airflowStyle}: {log.airflowSetting}
              </div>
            </div>

            {log.notes && (
              <div className="bg-slate-950/40 p-5 rounded-[2rem] border border-slate-800/30">
                <div className="text-[9px] text-slate-600 font-black uppercase mb-3 tracking-widest">{t.setupNotes}</div>
                <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-4">{log.notes}</p>
              </div>
            )}
          </div>
        ))}

        {filteredHistory.length === 0 && (
          <div className="text-center py-24 bg-slate-900/20 rounded-[4rem] border-2 border-dashed border-slate-900">
            <i className="fa-solid fa-ghost text-6xl mb-6 block opacity-10"></i>
            <p className="text-slate-700 font-black uppercase text-sm tracking-widest">{t.noHistory}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
