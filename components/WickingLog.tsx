
import React, { useState, useEffect } from 'react';
import { InventoryItem, CoilStats, WickingHistory, UserExperience, WireMaterial } from '../types.ts';
import { findSweetSpot } from '../services/geminiService.ts';
import { useTranslation } from '../i18n.ts';

interface WickingLogProps {
  inventory: InventoryItem[];
  coils: CoilStats[];
  history: WickingHistory[];
  experiences: UserExperience[];
  onAdd: (log: WickingHistory) => void;
}

const WickingLog: React.FC<WickingLogProps> = ({ inventory, coils, history, experiences, onAdd }) => {
  const { t, lang } = useTranslation();
  const [attyId, setAttyId] = useState('');
  const [coilId, setCoilId] = useState('');
  const [cottonId, setCottonId] = useState('');
  const [liquidId, setLiquidId] = useState('');
  const [airflowType, setAirflowType] = useState<'Insert' | 'AFC'>('AFC');
  const [airflowSetting, setAirflowSetting] = useState('');
  // Added wattage state to satisfy WickingHistory type requirements
  const [wattage, setWattage] = useState(15);
  const [maxLife, setMaxLife] = useState(8);
  const [notes, setNotes] = useState('');
  const [aiFinding, setAiFinding] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const atomizers = inventory.filter(i => i.category === 'atomizer' || i.category === 'pod_system');
  const cottons = inventory.filter(i => i.category === 'cotton');
  const liquids = inventory.filter(i => i.category === 'liquid_salt' || i.category === 'liquid_ejuice');
  const stockCoils = inventory.filter(i => i.category === 'prebuilt_coil' || i.category === 'pod_cartridge');

  useEffect(() => {
    const selectedCoil = coils.find(c => c.id === coilId);
    if (selectedCoil) {
      if (selectedCoil.material === WireMaterial.KANTHAL_A1) setMaxLife(12);
      else if (selectedCoil.material === WireMaterial.SS316L) setMaxLife(7);
      else setMaxLife(10);
    }
  }, [coilId, coils]);

  const handleGetSweetSpot = async () => {
    const selectedCoil = coils.find(c => c.id === coilId);
    const liquid = inventory.find(i => i.id === liquidId);
    if (!selectedCoil || !liquid) return;

    setLoadingAi(true);
    const attyHistory = history.filter(h => h.atomizerId === attyId);
    const result = await findSweetSpot(selectedCoil, attyHistory, liquid.name);
    setAiFinding(result);
    setLoadingAi(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attyId || !cottonId || !liquidId) return;

    // Fixed: Added missing 'wattage' and 'degradationScore' properties
    const newLog: WickingHistory = {
      id: Date.now().toString(),
      atomizerId: attyId,
      coilId: coilId || undefined,
      cottonId,
      liquidId,
      wattage,
      airflowType,
      airflowSetting,
      mlConsumed: 0,
      maxWickLife: maxLife,
      notes,
      sweetSpot: aiFinding || undefined,
      degradationScore: 0,
      date: Date.now(),
      isActive: true
    };

    onAdd(newLog);
    setAttyId('');
    setCoilId('');
    setCottonId('');
    setLiquidId('');
    setWattage(15);
    setNotes('');
    setAiFinding(null);
  };

  const isRtl = lang === 'fa';

  return (
    <div className="p-5 space-y-6 pb-32 animate-in slide-in-from-bottom-6">
      <header>
        <h2 className="text-2xl font-black text-blue-400 uppercase tracking-tight">{t.initializeSetup}</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-80">{t.regInstance}</p>
      </header>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/50 backdrop-blur-xl p-7 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.deviceSelection}</label>
            <select required value={attyId} onChange={e => setAttyId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all">
              <option value="">{t.deviceSelection}</option>
              {atomizers.map(a => <option key={a.id} value={a.id}>{a.name} ({a.brand})</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.coilConfig}</label>
            <select value={coilId} onChange={e => setCoilId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all">
              <option value="">{t.customBuild}</option>
              {coils.length > 0 && (
                <optgroup label={t.coilClasses}>
                  {coils.map(c => <option key={c.id} value={c.id}>{c.name} ({c.resistance}Ω)</option>)}
                </optgroup>
              )}
              {stockCoils.length > 0 && (
                <optgroup label={t.stockInventory}>
                  {stockCoils.map(s => <option key={s.id} value={s.id}>{s.name} ({s.brand})</option>)}
                </optgroup>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.cottonBrand}</label>
              <select required value={cottonId} onChange={e => setCottonId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 outline-none">
                <option value="">{isRtl ? 'انتخاب...' : 'Select...'}</option>
                {cottons.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.flavorLiquid}</label>
              <select required value={liquidId} onChange={e => setLiquidId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 outline-none">
                <option value="">{isRtl ? 'انتخاب...' : 'Select...'}</option>
                {liquids.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'توان (وات)' : 'Wattage (W)'}</label>
              <input 
                type="number"
                step="0.5"
                value={wattage} 
                onChange={e => setWattage(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'میزان باز بودن' : 'Aperture'}</label>
              <input 
                placeholder="e.g. 1.2mm" 
                value={airflowSetting} 
                onChange={e => setAirflowSetting(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 outline-none placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.airflowStyle}</label>
            <select value={airflowType} onChange={e => setAirflowType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 outline-none">
              <option value="AFC">AFC Ring</option>
              <option value="Insert">Pin / Insert</option>
            </select>
          </div>

          <div className="space-y-3 bg-slate-950/50 p-6 rounded-3xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-1 px-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.predictedWickLife}</label>
              <span className="text-sm font-black text-blue-500">{maxLife} ML</span>
            </div>
            <input 
              type="range" min="2" max="25" step="1" 
              value={maxLife} onChange={e => setMaxLife(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase mt-1 px-1 tracking-tighter">
              <span>{t.shortLife}</span>
              <span>{t.longLife}</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleGetSweetSpot}
            disabled={!coilId || !liquidId || loadingAi}
            className="w-full py-5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-[2rem] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-indigo-600/20 transition-all disabled:opacity-30 active:scale-[0.98]"
          >
            {loadingAi ? <i className="fa-solid fa-compact-disc fa-spin"></i> : <i className="fa-solid fa-bolt-lightning"></i>}
            {t.calculateSweetSpot}
          </button>

          {aiFinding && (
            <div className="p-6 bg-indigo-950/30 border border-indigo-500/20 rounded-[2rem] text-xs text-indigo-100 italic leading-relaxed animate-in fade-in slide-in-from-top-2">
              <div className="text-[9px] font-black text-indigo-400 uppercase mb-3 flex items-center gap-2">
                <i className="fa-solid fa-brain-circuit text-sm"></i> {t.aiRec}
              </div>
              <div className="whitespace-pre-line">{aiFinding}</div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.setupNotes}</label>
            <textarea 
              placeholder="..."
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 placeholder:text-slate-800"
            />
          </div>
        </div>

        <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.25em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-sm mt-4">
          {t.confirmTracking}
        </button>
      </form>
    </div>
  );
};

export default WickingLog;
