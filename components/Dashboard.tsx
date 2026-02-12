
import React from 'react';
import { InventoryItem, WickingHistory, CoilStats } from '../types.ts';
import { useTranslation } from '../i18n.ts';

interface DashboardProps {
  inventory: InventoryItem[];
  wickingHistory: WickingHistory[];
  coils: CoilStats[];
  updateMl: (historyId: string, delta: number) => void;
  onRewick: (historyId: string) => void;
  onOpenSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, wickingHistory, coils, updateMl, onRewick, onOpenSettings }) => {
  const { t, lang } = useTranslation();
  const activeWicks = wickingHistory.filter(h => h.isActive);

  const getAtty = (id: string) => inventory.find(i => i.id === id);
  const getLiquid = (id: string) => inventory.find(i => i.id === id);
  const totalConsumed = wickingHistory.reduce((acc, h) => acc + h.mlConsumed, 0);
  const isRtl = lang === 'fa';

  return (
    <div className={`p-5 space-y-8 pb-32 animate-in fade-in duration-700 ${isRtl ? 'font-[Vazirmatn]' : ''}`}>
      <header className="flex items-center justify-between mt-6 px-1">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-md">
            VAPE <span className="text-blue-500">PRO</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 opacity-80">
            {t.analyticalInsights}
          </p>
        </div>
        <button 
          onClick={onOpenSettings}
          className="w-12 h-12 glass rounded-2xl flex items-center justify-center border border-slate-800 text-slate-400 active:scale-90 transition-all shadow-lg hover:text-blue-500"
        >
          <i className="fa-solid fa-sliders text-lg"></i>
        </button>
      </header>

      {/* Hero Performance Summary */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-2 opacity-90">{t.globalLiquidLog}</div>
          <div className="flex items-center gap-3">
            <span className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">{totalConsumed.toFixed(1)}</span>
            <span className="text-xl font-bold text-blue-200 uppercase tracking-widest">ML</span>
          </div>
          <div className="mt-4 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-tighter">
            {activeWicks.length} {t.active}
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-black text-slate-100 tracking-tight uppercase flex items-center gap-2">
             <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
             {t.activeSetups}
          </h2>
        </div>

        <div className="space-y-6">
          {activeWicks.length > 0 ? activeWicks.map((wick) => {
            const atty = getAtty(wick.atomizerId);
            const liquid = getLiquid(wick.liquidId);
            const progress = Math.min((wick.mlConsumed / (wick.maxWickLife || 8)) * 100, 100);
            const isExhausted = progress >= 100;
            const risk = progress > 85 ? 'HIGH' : progress > 50 ? 'MEDIUM' : 'LOW';

            return (
              <div key={wick.id} className="glass rounded-[3rem] p-7 border border-slate-800 shadow-xl relative group transition-all hover:border-slate-700">
                
                {/* Failure Risk Indicator */}
                <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} text-[8px] font-black px-3 py-1 rounded-full border ${risk === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                   {t.failureRisk}: {risk}
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner relative">
                      {atty?.imageUrl ? (
                        <img src={atty.imageUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <i className="fa-solid fa-atom text-blue-500 text-2xl"></i>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-slate-100 tracking-tight leading-none mb-2">{atty?.name || 'Unknown'}</h3>
                      <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                        <i className={`fa-solid fa-droplet text-blue-500`}></i> 
                        <span className="truncate max-w-[120px]">{liquid?.name || 'No Liquid'}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-right ${isRtl ? 'mr-auto pl-2' : 'ml-auto pr-2'}`}>
                    <div className={`text-xs font-black uppercase mb-1 ${isExhausted ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                      {isExhausted ? t.wickExhausted : `${progress.toFixed(0)}%`}
                    </div>
                  </div>
                </div>

                <div className="relative h-2 bg-slate-950 rounded-full mb-8 border border-slate-800/40 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      progress > 85 ? 'bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                      progress > 50 ? 'bg-orange-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-slate-950/80 rounded-[2.5rem] p-1 flex items-center justify-between border border-slate-800 shadow-inner">
                    <button 
                      onClick={() => updateMl(wick.id, -0.5)}
                      className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 active:bg-blue-600 active:text-white transition-all"
                    >
                      <i className="fa-solid fa-minus text-xs"></i>
                    </button>
                    <div className="text-center px-1">
                       <div className="text-[8px] font-black text-slate-600 uppercase mb-0.5">{wick.mlConsumed.toFixed(1)}ml</div>
                    </div>
                    <button 
                      onClick={() => updateMl(wick.id, 0.5)}
                      className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 active:bg-blue-600 active:text-white transition-all"
                    >
                      <i className="fa-solid fa-plus text-xs"></i>
                    </button>
                  </div>
                  <button 
                    onClick={() => onRewick(wick.id)}
                    className={`px-6 h-12 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest transition-all shadow-xl ${
                      isExhausted 
                      ? 'bg-blue-600 text-white animate-pulse shadow-blue-600/20' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {t.rewick}
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-20 glass rounded-[3rem] border-dashed border-2 border-slate-800/50 space-y-5">
              <i className="fa-solid fa-droplet-slash text-slate-800 text-4xl"></i>
              <p className="text-slate-500 font-black uppercase text-xs tracking-widest">{t.noHistory}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
