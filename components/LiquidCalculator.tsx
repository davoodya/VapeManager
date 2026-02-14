
import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n.ts';
import { InventoryItem } from '../types.ts';

interface LiquidCalculatorProps {
  onSaveToGear?: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => void;
}

const LiquidCalculator: React.FC<LiquidCalculatorProps> = ({ onSaveToGear }) => {
  const { t, lang } = useTranslation();
  const [targetNic, setTargetNic] = useState(6);
  const [baseNic, setBaseNic] = useState(100);
  const [targetVolume, setTargetVolume] = useState(60);
  const [flavorPercentage, setFlavorPercentage] = useState(15);
  const [recipeName, setRecipeName] = useState('');

  const results = useMemo(() => {
    const nicBaseAmount = (targetNic * targetVolume) / baseNic;
    const flavorAmount = (flavorPercentage / 100) * targetVolume;
    const diluentAmount = targetVolume - nicBaseAmount - flavorAmount;

    return {
      nicBaseAmount: parseFloat(nicBaseAmount.toFixed(2)),
      flavorAmount: parseFloat(flavorAmount.toFixed(2)),
      diluentAmount: parseFloat(diluentAmount.toFixed(2))
    };
  }, [targetNic, baseNic, targetVolume, flavorPercentage]);

  const handleSaveToGear = () => {
    if (!onSaveToGear) return;
    const name = recipeName || `DIY ${targetNic}mg ${targetVolume}ml`;
    onSaveToGear({
      name: name,
      brand: 'DIY Lab',
      category: 'liquid',
      price: 0,
      specs: {
        liquidType: targetNic > 12 ? 'Nic Salt' : 'E-Juice Freebase',
        nicotineStrength: targetNic,
        flavor: `${flavorPercentage}% Concentration`,
        bottleSize: targetVolume.toString(),
      }
    });
    setRecipeName('');
    alert(lang === 'fa' ? 'به تجهیزات اضافه شد!' : 'Added to Gear!');
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto animate-in fade-in">
      <header className="px-1">
        <h2 className="text-2xl font-black text-indigo-400 uppercase italic tracking-tighter">
          {t.liquidLab}
        </h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-70">
          Professional DIY Mixology Engine
        </p>
      </header>

      <div className="glass p-8 rounded-[3rem] shadow-2xl space-y-8 border-slate-800/40">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.name}</label>
            <input 
              placeholder="e.g. Blue Raspberry Custard..."
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.targetVolume}</label>
            <input 
              type="number" 
              value={targetVolume} 
              onChange={(e) => setTargetVolume(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.targetNic}</label>
              <input 
                type="number" 
                value={targetNic} 
                onChange={(e) => setTargetNic(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.baseNic}</label>
              <input 
                type="number" 
                value={baseNic} 
                onChange={(e) => setBaseNic(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.flavorPercentage}</label>
            <input 
              type="number" 
              value={flavorPercentage} 
              onChange={(e) => setFlavorPercentage(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500" 
            />
          </div>
        </div>

        <div className="bg-slate-950/60 p-6 rounded-[2.5rem] border border-slate-800/60 space-y-5 shadow-inner">
          <div className="flex justify-between items-center group">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{t.nicAmount}</div>
            <div className="text-lg font-black text-white">{results.nicBaseAmount} <span className="text-xs text-slate-600">ml</span></div>
          </div>
          <div className="h-px bg-slate-800/50"></div>
          <div className="flex justify-between items-center group">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{t.flavorAmount}</div>
            <div className="text-lg font-black text-white">{results.flavorAmount} <span className="text-xs text-slate-600">ml</span></div>
          </div>
          <div className="h-px bg-slate-800/50"></div>
          <div className="flex justify-between items-center group">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{t.diluentAmount}</div>
            <div className="text-lg font-black text-white">{results.diluentAmount} <span className="text-xs text-slate-600">ml</span></div>
          </div>
        </div>

        <button 
          onClick={handleSaveToGear}
          className="w-full py-5 bg-indigo-600 rounded-[2rem] font-black uppercase text-xs tracking-widest text-white shadow-xl shadow-indigo-900/40 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <i className="fa-solid fa-flask-vial"></i>
          {lang === 'fa' ? 'افزودن به انبار تجهیزات' : 'SAVE TO GEAR LIST'}
        </button>
      </div>
    </div>
  );
};

export default LiquidCalculator;
