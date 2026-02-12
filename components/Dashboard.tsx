
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
  const activeWicks = wickingHistory.filter(h => h.isActive || h.status === 'active');

  const getAtty = (id: string) => inventory.find(i => i.id === id);
  const getLiquid = (id: string) => inventory.find(i => i.id === id);
  const totalConsumed = wickingHistory.reduce((acc, h) => acc + h.mlConsumed, 0);
  const isRtl = lang === 'fa';

  return (
    <div className={`p-6 space-y-10 pb-36 animate-in fade-in duration-700`}>
      <header className="flex items-center justify-between mt-4 px-1">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-xl">
            VAPE <span className="text-blue-500">PRO</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2.5 opacity-70">
            {t.analyticalInsights}
          </p>
        </div>
        <button 
          onClick={onOpenSettings}
          className="w-14 h-14 glass rounded-2xl flex items-center justify-center border border-slate-800 text-slate-400 active:scale-90 transition-all shadow-xl hover:text-blue-500 hover:border-blue-500/30"
        >
          <i className="fa-solid fa-sliders text-xl"></i>
        </button>
      </header>

      {/* Hero Performance Summary */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group border border-white/5">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-[10px] font-black text-blue-100 uppercase tracking-[0.4em] mb-3 opacity-80">{t.globalLiquidLog}</div>
          <div className="flex items-center gap-4">
            <span className="text-7xl font-black text-white tracking-tighter drop-shadow-2xl">{totalConsumed.toFixed(1)}</span>
            <span className="text-2xl font-black text-blue-200 uppercase tracking-widest mt-2">ML</span>
          </div>
          <div className="mt-6 px-6 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
            {activeWicks.length} {t.activeStatus} SETUPS
          </div>
        </div>
      </div>

      <section className="space-y-8">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-2xl font-black text-slate-100 tracking-tight uppercase flex items-center gap-3">
             <span className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"></span>
             {t.activeSetups}
          </h2>
        </div>

        <div className="space-y-8">
          {activeWicks.length > 0 ? activeWicks.map((wick) => {
            const atty = getAtty(wick.atomizerId);
            const liquid = getLiquid(wick.liquidId);
            const progress = Math.min((wick.mlConsumed / (wick.maxWickLife || 8)) * 100, 100);
            const isExhausted = progress >= 100;
            const risk = progress > 90 ? 'CRITICAL' : progress > 75 ? 'HIGH' : progress > 50 ? 'MEDIUM' : 'LOW';

            return (
              <div key={wick.id} className="glass rounded-[3.5rem] p-8 border border-slate-800 shadow-2xl relative group transition-all hover:border-slate-700 hover:shadow-blue-900/10">
                
                {/* Failure Risk Indicator */}
                <div className={`absolute top-8 ${isRtl ? 'left-8' : 'right-8'} text-[9px] font-black px-4 py-1.5 rounded-full border transition-colors ${risk === 'CRITICAL' || risk === 'HIGH' ? 'bg-red-500/15 text-red-500 border-red-500/30 animate-pulse' : 'bg-green-500/15 text-green-500 border-green-500/30'}`}>
                   {t.failureRisk}: {risk}
                </div>

                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl relative group-hover:border-blue-500/40 transition-colors">
                      {atty?.imageUrl || wick.imageUrl ? (
                        <img src={wick.imageUrl || atty?.imageUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <i className="fa-solid fa-atom text-blue-500 text-3xl opacity-80"></i>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-slate-100 tracking-tight leading-none mb-3">{atty?.name || 'Unknown'}</h3>
                      <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2.5">
                        <i className={`fa-solid fa-droplet text-blue-500`}></i> 
                        <span className="truncate max-w-[140px] tracking-widest">{liquid?.name || 'No Liquid'} • {wick.vapingStyle}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative h-2.5 bg-slate-950 rounded-full mb-10 border border-slate-800/40 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      progress > 90 ? 'bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 
                      progress > 75 ? 'bg-orange-600' :
                      progress > 50 ? 'bg-orange-500' : 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-slate-950/60 rounded-[3rem] p-1.5 flex items-center justify-between border border-slate-800 shadow-inner">
                    <button 
                      onClick={() => updateMl(wick.id, -1)}
                      className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 active:bg-blue-600 active:text-white transition-all hover:text-slate-200"
                    >
                      <i className="fa-solid fa-minus text-xs"></i>
                    </button>
                    <div className="text-center px-2">
                       <div className="text-[10px] font-black text-slate-100 uppercase mb-0.5">{wick.mlConsumed.toFixed(0)} <span className="text-slate-600">/ {wick.maxWickLife}ml</span></div>
                    </div>
                    <button 
                      onClick={() => updateMl(wick.id, 1)}
                      className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 active:bg-blue-600 active:text-white transition-all hover:text-slate-200"
                    >
                      <i className="fa-solid fa-plus text-xs"></i>
                    </button>
                  </div>
                  <button 
                    onClick={() => onRewick(wick.id)}
                    className={`px-8 h-14 rounded-[3rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl ${
                      isExhausted 
                      ? 'bg-blue-600 text-white animate-pulse shadow-blue-600/30' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {t.rewick}
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-24 glass rounded-[4rem] border-dashed border-2 border-slate-800/50 space-y-6">
              <i className="fa-solid fa-droplet-slash text-slate-800 text-5xl mb-2"></i>
              <p className="text-slate-600 font-black uppercase text-[11px] tracking-[0.3em]">{t.noHistory}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
