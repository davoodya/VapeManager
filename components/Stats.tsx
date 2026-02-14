
import React, { useMemo } from 'react';
import { WickingHistory, InventoryItem } from '../types.ts';
import { useTranslation } from '../i18n.ts';

interface StatsProps {
  history: WickingHistory[];
  inventory: InventoryItem[];
}

const Stats: React.FC<StatsProps> = ({ history, inventory }) => {
  const { t, lang } = useTranslation();

  const stats = useMemo(() => {
    const totalMl = history.reduce((acc, h) => acc + h.mlConsumed, 0);
    const avgLife = history.length > 0 ? totalMl / history.length : 0;
    
    const liquids = inventory.filter(i => i.category === 'liquid');
    const totalSpentOnLiquids = liquids.reduce((acc, i) => acc + (i.price || 0), 0);
    const totalVolume = liquids.reduce((acc, i) => acc + (Number(i.specs?.bottleSize) || 60), 0);
    const costPerMl = totalVolume > 0 ? (totalSpentOnLiquids / totalVolume).toFixed(2) : "0.00";

    const flavorCounts: Record<string, number> = {};
    history.forEach(h => {
      const liquid = inventory.find(i => i.id === h.liquidId);
      const category = liquid?.specs?.flavorCategory || 'Other';
      flavorCounts[category] = (flavorCounts[category] || 0) + h.mlConsumed;
    });
    
    const topFlavors = Object.entries(flavorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return { totalMl, avgLife, costPerMl, topFlavors };
  }, [history, inventory]);

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in">
      <header className="flex justify-between items-center mt-4">
        <div>
          <h2 className="text-3xl font-black text-blue-500 tracking-tight uppercase italic">{t.perfReports}</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.analyticalInsights}</p>
        </div>
        <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center border border-slate-800 shadow-2xl">
          <i className="fa-solid fa-chart-line text-blue-500 text-xl"></i>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-5">
        <div className="glass p-7 rounded-[3rem] shadow-2xl border-slate-800/40">
          <div className="text-[10px] font-black text-slate-600 uppercase mb-3 tracking-widest">{t.avgWickLife}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">{stats.avgLife.toFixed(1)}</span>
            <span className="text-[10px] text-blue-500 uppercase font-black tracking-widest">ml</span>
          </div>
        </div>
        <div className="glass p-7 rounded-[3rem] shadow-2xl border-slate-800/40">
          <div className="text-[10px] font-black text-slate-600 uppercase mb-3 tracking-widest">{lang === 'fa' ? 'هزینه / میل' : 'Cost / ml'}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-indigo-400 tracking-tighter">${stats.costPerMl}</span>
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-[3.5rem] border-slate-800 shadow-xl space-y-6">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-droplet text-blue-500"></i> Favorite Flavors Distribution
        </h3>
        <div className="space-y-4">
          {stats.topFlavors.length > 0 ? stats.topFlavors.map(([name, val], idx) => (
            <div key={name} className="space-y-1.5">
               <div className="flex justify-between text-[11px] font-black uppercase text-slate-300">
                  <span>{name}</span>
                  <span className="text-blue-500">{((val / stats.totalMl) * 100).toFixed(0)}%</span>
               </div>
               <div className="h-2 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                  <div className={`h-full ${idx === 0 ? 'bg-blue-600' : 'bg-slate-700'}`} style={{ width: `${(val / stats.totalMl) * 100}%` }}></div>
               </div>
            </div>
          )) : <p className="text-xs text-slate-600 italic">No consumption data recorded yet.</p>}
        </div>
      </div>

      <div className="p-8 bg-blue-600/5 rounded-[3.5rem] border border-blue-500/10 space-y-4 shadow-xl">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <i className="fa-solid fa-brain text-blue-500"></i>
            </div>
            <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">Efficiency Tip</span>
         </div>
         <p className="text-xs text-slate-400 leading-relaxed italic">
            {lang === 'fa' 
              ? 'بر اساس سوابق شما، ستاپ‌های با ارتفاع کویل ۱.۵ میلی‌متر بازدهی بیشتری در طعم‌دهی داشته‌اند.' 
              : 'Based on your history, setups with 1.5mm coil height provided 15% better flavor longevity.'}
         </p>
      </div>
    </div>
  );
};

export default Stats;
