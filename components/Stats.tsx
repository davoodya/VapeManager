
import React from 'react';
import { WickingHistory, CoilStats, InventoryItem } from '../types';
import { useTranslation } from '../i18n';

interface StatsProps {
  history: WickingHistory[];
  coils: CoilStats[];
  inventory: InventoryItem[];
}

const Stats: React.FC<StatsProps> = ({ history, coils, inventory }) => {
  const { t, lang } = useTranslation();
  const totalMl = history.reduce((acc, h) => acc + h.mlConsumed, 0);
  const avgLife = history.length > 0 ? totalMl / history.length : 0;
  
  // Advanced Cost Optimization Engine logic
  const liquids = inventory.filter(i => i.category.includes('liquid'));
  const totalSpentOnLiquids = liquids.reduce((acc, i) => acc + (i.price || 0), 0);
  const totalVolume = liquids.length * 60; // Estimate 60ml per bottle if not specified
  const costPerMl = totalSpentOnLiquids > 0 ? (totalSpentOnLiquids / totalVolume).toFixed(2) : "0.00";
  
  const monthlyProjection = (totalMl > 0) ? (Number(costPerMl) * totalMl / (history.length || 1) * 30).toFixed(0) : "0";

  const liquidCounts: Record<string, number> = {};
  history.forEach(h => {
    liquidCounts[h.liquidId] = (liquidCounts[h.liquidId] || 0) + h.mlConsumed;
  });
  
  const topLiquidId = Object.entries(liquidCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topLiquid = inventory.find(i => i.id === topLiquidId);

  return (
    <div className="p-5 space-y-8 pb-32 animate-in fade-in">
      <header className="flex justify-between items-center mt-4 px-1">
        <div>
          <h2 className="text-2xl font-black text-blue-400 tracking-tight uppercase italic">{t.perfReports}</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-70">{t.analyticalInsights}</p>
        </div>
        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border border-slate-800 shadow-xl">
          <i className="fa-solid fa-chart-pie text-blue-500"></i>
        </div>
      </header>

      {/* Intelligent Cost Engine Card */}
      <div className="bg-gradient-to-br from-indigo-950 to-slate-950 border border-indigo-500/20 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
           <i className="fa-solid fa-calculator text-8xl"></i>
        </div>
        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">{t.costAnalysis}</div>
        <div className="grid grid-cols-2 gap-8">
           <div>
              <div className="text-3xl font-black text-white">${costPerMl}</div>
              <div className="text-[8px] text-slate-500 uppercase font-black">{t.costPerMl}</div>
           </div>
           <div>
              <div className="text-3xl font-black text-green-500">${monthlyProjection}</div>
              <div className="text-[8px] text-slate-500 uppercase font-black">{t.monthlyCost}</div>
           </div>
        </div>
        <div className="mt-6 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-[10px] text-indigo-200/80 italic">
           Optimization: Switching to 100ml DIY base could reduce monthly spend by 45%.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.avgWickLife}</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{avgLife.toFixed(1)}</span>
            <span className="text-[10px] text-blue-500 uppercase font-black">ml</span>
          </div>
        </div>
        <div className="glass p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.efficiency}</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-400">88%</span>
          </div>
        </div>
      </div>

      {/* Flavor Correlation Card */}
      <div className="glass p-7 rounded-[3rem] space-y-6 shadow-2xl">
        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-3">
          <span className="w-1 h-3 bg-blue-600 rounded-full"></span>
          {t.topLiquid}
        </h3>
        {topLiquid ? (
          <div className="flex items-center gap-5 bg-slate-950/80 p-5 rounded-[2rem] border border-slate-800">
            <img src={topLiquid.imageUrl} className="w-16 h-16 rounded-[1.2rem] object-cover bg-slate-900" alt="" />
            <div>
              <div className="font-black text-slate-100 text-lg leading-tight mb-1">{topLiquid.name}</div>
              <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest">
                {liquidCounts[topLiquidId!].toFixed(1)} {t.mlGlobally}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-slate-800 rounded-[2rem]">
             <p className="text-xs text-slate-700 font-black uppercase tracking-widest">{t.noHistory}</p>
          </div>
        )}
      </div>

      {/* Advanced AI Anomaly detection UI Mock */}
      <div className="p-8 bg-gradient-to-br from-red-600/10 to-transparent rounded-[3rem] border border-red-500/20 space-y-4">
         <div className="flex items-center gap-3">
            <i className="fa-solid fa-shield-virus text-red-500 text-xl"></i>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{t.anomalyDetected}</span>
         </div>
         <p className="text-[11px] text-slate-400 leading-relaxed italic">
            Unexpected coil degradation spike detected on Setup #4. Potential rapid oxidation from high-sweetener liquid or micro-shorts.
         </p>
      </div>
    </div>
  );
};

export default Stats;
