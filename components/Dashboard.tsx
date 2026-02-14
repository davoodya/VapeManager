
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

const Dashboard: React.FC<DashboardProps> = ({ inventory, wickingHistory, coils, experiences, updateMl, onRewick, onOpenSettings, onNavigate, onArchive }) => {
  const { t, lang } = useTranslation();
  const activeWicks = wickingHistory.filter(h => h.isActive);
  const totalConsumed = wickingHistory.reduce((acc, h) => acc + h.mlConsumed, 0);

  const getAtty = (id: string) => inventory.find(i => i.id === id);
  const getLiquid = (id: string) => inventory.find(i => i.id === id);

  const quickActions = [
    { id: 'inventory', icon: 'fa-boxes-stacked', label: 'Add Gear' },
    { id: 'setup', icon: 'fa-screwdriver-wrench', label: 'Add Setup' },
    { id: 'lab', icon: 'fa-microchip', label: 'Coil Lab' },
    { id: 'liquidLab', icon: 'fa-flask-vial', label: 'Liquid Lab' },
    { id: 'stats', icon: 'fa-chart-line', label: 'See Insight' },
    { id: 'archive', icon: 'fa-box-archive', label: 'Archive' },
    { id: 'journey', icon: 'fa-book-open', label: 'Journey' },
    { id: 'gallery', icon: 'fa-images', label: 'Gallery' },
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
        <button onClick={onOpenSettings} className="w-14 h-14 glass rounded-2xl flex items-center justify-center border border-slate-800 text-slate-400 shadow-xl active:scale-90 transition-all">
          <i className="fa-solid fa-sliders text-xl"></i>
        </button>
      </header>

      {/* Global Consumption */}
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

      {/* Quick Actions Grid */}
      <section className="grid grid-cols-2 gap-4">
        {quickActions.map(btn => (
          <button key={btn.id} onClick={() => onNavigate(btn.id)} className="flex flex-col items-center justify-center p-6 bg-slate-900/60 border border-slate-800 rounded-[2.5rem] hover:bg-blue-600/10 hover:border-blue-500/30 active:scale-95 transition-all shadow-xl group">
            <i className={`fa-solid ${btn.icon} text-2xl text-slate-500 group-hover:text-blue-500 mb-3`}></i>
            <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">{btn.label}</span>
          </button>
        ))}
      </section>

      {/* Active Setup Control */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black text-slate-100 tracking-tight uppercase flex items-center gap-3">
           <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span> {t.activeSetups}
        </h2>

        <div className="space-y-6">
          {activeWicks.map((wick) => {
            const atty = getAtty(wick.atomizerId);
            const progress = Math.min((wick.mlConsumed / wick.maxWickLife) * 100, 100);
            return (
              <div key={wick.id} className="glass rounded-[3.5rem] p-8 border border-slate-800 shadow-2xl relative animate-in slide-in-from-bottom-2">
                <div className="absolute top-8 right-8">
                   <button onClick={() => onArchive(wick.id)} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-600 hover:text-blue-500 transition-colors"><i className="fa-solid fa-box-archive text-xs"></i></button>
                </div>
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
                    {wick.imageUrl ? <img src={wick.imageUrl} className="w-full h-full object-cover" alt="" /> : <i className="fa-solid fa-atom text-blue-500 text-3xl"></i>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-xl text-slate-100 truncate italic">{atty?.name || 'Device'}</h3>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                      {progress.toFixed(0)}% Consumed
                    </div>
                  </div>
                </div>
                <div className="relative h-2 bg-slate-950 rounded-full mb-8 border border-slate-800 overflow-hidden shadow-inner">
                  <div className={`h-full transition-all duration-1000 ${progress > 85 ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 bg-slate-950/60 rounded-[3rem] p-1 flex items-center justify-between border border-slate-800">
                    <button onClick={() => updateMl(wick.id, -1)} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-500 active:bg-blue-600 active:text-white transition-all"><i className="fa-solid fa-minus text-xs"></i></button>
                    <div className="text-[10px] font-black text-slate-100">{wick.mlConsumed.toFixed(1)} ml</div>
                    <button onClick={() => updateMl(wick.id, 1)} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-500 active:bg-blue-600 active:text-white transition-all"><i className="fa-solid fa-plus text-xs"></i></button>
                  </div>
                  <button onClick={onRewick} className="px-6 h-12 rounded-[2.5rem] bg-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-widest border border-slate-700 active:scale-95 transition-all">{t.rewick}</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Analytics Insight */}
      <section className="glass rounded-[3rem] p-8 border-slate-800 shadow-inner">
         <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-3">
           <i className="fa-solid fa-chart-pie text-blue-500"></i> Fleet Status
         </h3>
         <div className="grid grid-cols-3 gap-4 text-center">
            <div>
               <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Total Wicks</div>
               <div className="text-lg font-black text-white">{wickingHistory.length}</div>
            </div>
            <div>
               <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Gear Count</div>
               <div className="text-lg font-black text-white">{inventory.length}</div>
            </div>
            <div>
               <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Experiences</div>
               <div className="text-lg font-black text-white">{experiences.length}</div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Dashboard;
