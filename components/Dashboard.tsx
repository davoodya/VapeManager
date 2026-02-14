
import React from 'react';
import { InventoryItem, WickingHistory, CoilStats, UserExperience } from '../types.ts';
import { useTranslation } from '../i18n.ts';

interface DashboardProps {
  inventory: InventoryItem[];
  wickingHistory: WickingHistory[];
  coils: CoilStats[];
  experiences: UserExperience[];
  updateMl: (historyId: string, delta: number) => void;
  onRewick: () => void;
  onOpenSettings: () => void;
  onNavigate: (route: string) => void;
  onArchive: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  inventory, 
  wickingHistory, 
  coils, 
  experiences,
  updateMl, 
  onRewick, 
  onOpenSettings, 
  onNavigate, 
  onArchive 
}) => {
  const { t, lang } = useTranslation();
  const activeWicks = wickingHistory.filter(h => h.isActive);
  const totalConsumed = wickingHistory.reduce((acc, h) => acc + h.mlConsumed, 0);

  const getAtty = (id: string) => inventory.find(i => i.id === id);
  const getLiquid = (id: string) => inventory.find(i => i.id === id);

  const actionButtons = [
    { id: 'inventory', icon: 'fa-boxes-stacked', label: 'Add New Gear', color: 'text-blue-500' },
    { id: 'setup', icon: 'fa-screwdriver-wrench', label: 'Add New Setup', color: 'text-orange-500' },
    { id: 'lab', icon: 'fa-microchip', label: 'Coil Lab', color: 'text-emerald-500' },
    { id: 'liquidLab', icon: 'fa-flask-vial', label: 'Liquid Lab', color: 'text-purple-500' },
    { id: 'stats', icon: 'fa-chart-line', label: 'See Insight', color: 'text-blue-400' },
    { id: 'archive', icon: 'fa-box-archive', label: 'Setup Archive', color: 'text-slate-500' },
    { id: 'journey', icon: 'fa-book-open', label: 'Journey', color: 'text-amber-500' },
    { id: 'gallery', icon: 'fa-images', label: 'Gallery', color: 'text-rose-500' },
  ];

  return (
    <div className={`p-6 space-y-10 pb-36 animate-in fade-in duration-700`}>
      <header className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-xl">
            VAPE <span className="text-blue-500">PRO</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2.5">{t.analyticalInsights}</p>
        </div>
        <button onClick={onOpenSettings} className="w-14 h-14 glass rounded-2xl flex items-center justify-center border border-slate-800 text-slate-400 shadow-xl transition-all active:scale-90">
          <i className="fa-solid fa-sliders text-xl"></i>
        </button>
      </header>

      {/* Consumption Overview Card */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-950 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-[10px] font-black text-blue-100 uppercase tracking-[0.4em] mb-3 opacity-80">{t.globalLiquidLog}</div>
          <div className="flex items-center gap-4">
            <span className="text-7xl font-black text-white tracking-tighter">{totalConsumed.toFixed(1)}</span>
            <span className="text-2xl font-black text-blue-200 uppercase tracking-widest mt-2">ML</span>
          </div>
          <div className="mt-6 px-6 py-2 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black text-white uppercase tracking-widest">
            {activeWicks.length} {t.activeStatus}
          </div>
        </div>
      </div>

      {/* ACTIVE SETUPS AREA */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-100 tracking-tight uppercase flex items-center gap-3">
           <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span> {t.activeSetups}
        </h2>

        <div className="space-y-6">
          {activeWicks.map((wick) => {
            const atty = getAtty(wick.atomizerId);
            const liquid = getLiquid(wick.liquidId);
            const progress = Math.min((wick.mlConsumed / wick.maxWickLife) * 100, 100);
            return (
              <div key={wick.id} className="glass-card rounded-[3rem] p-8 border border-slate-800 shadow-2xl relative animate-in slide-in-from-bottom-2">
                <div className="absolute top-8 right-8 flex gap-2">
                   <button onClick={() => onArchive(wick.id)} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-600 hover:text-blue-500 transition-colors"><i className="fa-solid fa-box-archive text-xs"></i></button>
                   <div className={`text-[9px] font-black px-3 py-1.5 rounded-full border ${progress > 90 ? 'bg-red-500/15 text-red-500 border-red-500/30' : 'bg-green-500/15 text-green-500 border-green-500/30'}`}>
                    {lang === 'fa' ? 'عمر: ' : 'LIFE: '} {(100 - progress).toFixed(0)}%
                   </div>
                </div>

                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {wick.imageUrl ? <img src={wick.imageUrl} className="w-full h-full object-cover" alt="" /> : <i className="fa-solid fa-atom text-blue-500 text-3xl"></i>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-xl text-slate-100 truncate uppercase tracking-tighter italic">{atty?.name || 'Device'}</h3>
                    <div className="text-[10px] font-black text-slate-400 uppercase truncate mt-1 flex items-center gap-2">
                      <i className="fa-solid fa-droplet text-blue-500"></i> {liquid?.name || 'No Liquid'}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-slate-950 rounded-full mb-6 border border-slate-800 overflow-hidden shadow-inner">
                  <div className={`h-full transition-all duration-1000 ${progress > 85 ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-950/60 rounded-[2.5rem] p-1.5 flex items-center justify-between border border-slate-800">
                    <button onClick={() => updateMl(wick.id, -1)} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-500 active:bg-blue-600 active:text-white transition-all"><i className="fa-solid fa-minus text-xs"></i></button>
                    <div className="text-[10px] font-black text-slate-100">{wick.mlConsumed.toFixed(1)} / {wick.maxWickLife}ml</div>
                    <button onClick={() => updateMl(wick.id, 1)} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-500 active:bg-blue-600 active:text-white transition-all"><i className="fa-solid fa-plus text-xs"></i></button>
                  </div>
                  <button onClick={onRewick} className="px-6 h-12 rounded-[2.5rem] bg-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-widest border border-slate-700 hover:text-white transition-all">{t.rewick}</button>
                </div>
              </div>
            );
          })}
          {activeWicks.length === 0 && <div className="text-center py-20 glass rounded-[4rem] border-dashed border-2 border-slate-800/50"><p className="text-slate-600 font-black uppercase text-[11px] tracking-[0.3em]">{t.noHistory}</p></div>}
        </div>
      </section>

      {/* QUICK ACTION BUTTONS */}
      <section className="grid grid-cols-2 gap-4">
        {actionButtons.map((btn, idx) => (
          <button 
            key={idx} 
            onClick={() => onNavigate(btn.id)}
            className="flex flex-col items-center justify-center p-6 bg-slate-900/60 border border-slate-800 rounded-[2.5rem] hover:bg-blue-600/10 hover:border-blue-500/30 active:scale-95 transition-all shadow-xl group overflow-hidden"
          >
            <i className={`fa-solid ${btn.icon} text-2xl ${btn.color} mb-3 group-hover:scale-110 transition-transform duration-300`}></i>
            <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest text-center">
              {t[btn.id as keyof typeof t] || btn.label}
            </span>
          </button>
        ))}
      </section>

      {/* DASHBOARD SUMMARY REPORTS */}
      <section className="glass rounded-[3.5rem] p-8 border-slate-800 shadow-inner space-y-6">
         <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-3">
           <i className="fa-solid fa-chart-pie text-blue-500"></i> {lang === 'fa' ? 'گزارش جزئیات' : 'Detailed Insights'}
         </h3>
         <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
               <div className="text-[9px] font-black text-slate-600 uppercase">Total Wicks</div>
               <div className="text-xl font-black text-white">{wickingHistory.length}</div>
            </div>
            <div className="space-y-1">
               <div className="text-[9px] font-black text-slate-600 uppercase">Gears</div>
               <div className="text-xl font-black text-white">{inventory.length}</div>
            </div>
            <div className="space-y-1">
               <div className="text-[9px] font-black text-slate-600 uppercase">XP Memories</div>
               <div className="text-xl font-black text-white">{experiences.length}</div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Dashboard;
