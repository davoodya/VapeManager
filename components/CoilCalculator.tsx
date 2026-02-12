
import React, { useState, useEffect, useRef } from 'react';
import { WireMaterial, CoilStats, WireType, CoilConfig, SimulationResult } from '../types.ts';
import { GAUGE_TO_MM } from '../constants.ts';
import { useTranslation } from '../i18n.ts';
import { runSimulation } from '../services/simulationEngine.ts';

interface CoilCalculatorProps {
  onSaveToClasses?: (coil: CoilStats) => void;
}

const CoilCalculator: React.FC<CoilCalculatorProps> = ({ onSaveToClasses }) => {
  const { t, lang } = useTranslation();
  const [material, setMaterial] = useState<WireMaterial>(WireMaterial.KANTHAL_A1);
  const [wireConfig, setWireConfig] = useState<WireType>('Round');
  const [coilCount, setCoilCount] = useState<CoilConfig>('Single');
  const [gauge, setGauge] = useState<number>(26);
  const [id, setId] = useState<number>(3.0);
  const [wraps, setWraps] = useState<number>(6);
  const [voltage, setVoltage] = useState<number>(3.7);
  const [cdr, setCdr] = useState<number>(20);
  const [coilImageUrl, setCoilImageUrl] = useState('');
  const coilImageRef = useRef<HTMLInputElement>(null);
  
  const [sim, setSim] = useState<{
    res: number,
    sa: number,
    hc: number,
    data: SimulationResult,
    amp: number,
    isSafe: boolean
  } | null>(null);

  const [name, setName] = useState('');

  useEffect(() => {
    const result = runSimulation(material, wireConfig, coilCount, gauge, id, wraps, voltage);
    const currentAmp = voltage / result.resistance;
    
    setSim({
      res: result.resistance,
      sa: result.surfaceArea,
      hc: result.heatCapacity,
      data: result.simulation,
      amp: currentAmp,
      isSafe: currentAmp < cdr
    });
  }, [material, wireConfig, coilCount, gauge, id, wraps, voltage, cdr]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoilImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!onSaveToClasses || !sim) return;
    const coil: CoilStats = {
      id: `coil-${Date.now()}`,
      name: name || `${material} ${wireConfig} ${sim.res.toFixed(2)}Ω`,
      resistance: parseFloat(sim.res.toFixed(3)),
      material,
      gauge,
      wraps,
      innerDiameter: id,
      type: 'Contact',
      wireConfig,
      coilCount,
      liquidConsumed: 0,
      usageCount: 0,
      simulation: sim.data,
      heatCapacity: sim.hc,
      surfaceArea: sim.sa,
      images: coilImageUrl ? [coilImageUrl] : [],
      createdAt: Date.now()
    };
    onSaveToClasses(coil);
    setName('');
    setCoilImageUrl('');
    alert(lang === 'fa' ? 'در کتابخانه ثبت شد!' : 'Saved to Library!');
  };

  if (!sim) return null;

  const fluxColor = sim.data.heatFlux < 150 ? 'text-blue-400' : sim.data.heatFlux < 250 ? 'text-green-400' : sim.data.heatFlux < 350 ? 'text-orange-400' : 'text-red-500';

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto mb-20 animate-in fade-in">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black text-blue-500 uppercase italic tracking-tighter">
          {t.lab}
        </h2>
        <div className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase border glass ${sim.isSafe ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]'}`}>
          {sim.isSafe ? t.safe : t.unsafe}
        </div>
      </div>
      
      {/* Resistance Display Card */}
      <div className="glass p-8 rounded-[3rem] shadow-2xl text-center relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${sim.isSafe ? 'via-blue-500' : 'via-red-500'} to-transparent opacity-40`}></div>
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{t.estimatedResistance}</div>
        <div className="text-7xl font-mono font-black text-white group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          {sim.res.toFixed(3)}<span className="text-2xl ml-1 text-slate-600">Ω</span>
        </div>
        
        <div className="mt-8 grid grid-cols-3 gap-2 border-t border-slate-800/50 pt-6">
           <div>
              <div className="text-[7px] font-black text-slate-600 uppercase mb-1">{t.ampDraw}</div>
              <div className={`text-xs font-black ${sim.isSafe ? 'text-slate-200' : 'text-red-400'}`}>{sim.amp.toFixed(1)}A</div>
           </div>
           <div>
              <div className="text-[7px] font-black text-slate-600 uppercase mb-1">{t.heatFlux}</div>
              <div className={`text-xs font-black ${fluxColor}`}>{sim.data.heatFlux.toFixed(0)}</div>
           </div>
           <div>
              <div className="text-[7px] font-black text-slate-600 uppercase mb-1">{t.rampUp}</div>
              <div className="text-xs font-black text-indigo-400">{sim.data.rampUpTime.toFixed(2)}s</div>
           </div>
        </div>
      </div>

      {/* Task 2: Coil Image Button and Preview */}
      <section className="space-y-3">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.addCoilPicture}</label>
        <div onClick={() => coilImageRef.current?.click()}
          className="w-full h-32 rounded-[2.5rem] bg-slate-950/30 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-500/50 transition-all shadow-inner relative">
          {coilImageUrl ? (
            <img src={coilImageUrl} className="w-full h-full object-cover" alt="Coil" />
          ) : (
            <>
              <i className="fa-solid fa-microchip text-2xl text-slate-700 group-hover:text-blue-500 mb-2 transition-colors"></i>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t.uploadImg}</span>
            </>
          )}
        </div>
        <input type="file" ref={coilImageRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
      </section>

      <div className="glass p-6 rounded-[2.5rem] space-y-6 shadow-xl border-slate-800/40">
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.material}</label>
                <select value={material} onChange={(e) => setMaterial(e.target.value as WireMaterial)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white outline-none">
                  {Object.values(WireMaterial).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.wireConfig}</label>
                <select value={wireConfig} onChange={(e) => setWireConfig(e.target.value as WireType)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white outline-none">
                  <option value="Round">Round</option>
                  <option value="Parallel">Parallel</option>
                  <option value="Twisted">Twisted</option>
                </select>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.coilCount}</label>
                <select value={coilCount} onChange={(e) => setCoilCount(e.target.value as CoilConfig)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white outline-none">
                  <option value="Single">Single</option>
                  <option value="Dual">Dual</option>
                  <option value="Triple">Triple</option>
                  <option value="Quad">Quad</option>
                </select>
              </div>
             <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.gauge} (AWG)</label>
               <select value={gauge} onChange={(e) => setGauge(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white outline-none">
                 {[20, 22, 24, 26, 28, 30, 32].map(g => <option key={g} value={g}>{g} ga</option>)}
               </select>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.id}</label>
               <input type="number" step="0.1" value={id} onChange={(e) => setId(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white outline-none" />
             </div>
             <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.wraps}</label>
               <input type="number" step="0.5" value={wraps} onChange={(e) => setWraps(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white outline-none" />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.name}</label>
             <input placeholder="..." value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white outline-none" />
           </div>
        </div>

        <button onClick={handleSave} className="w-full bg-blue-600 py-5 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3">
          <i className="fa-solid fa-microchip"></i>
          {t.saveToClasses}
        </button>
      </div>
    </div>
  );
};

export default CoilCalculator;
