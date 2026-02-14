
import React, { useState, useEffect, useRef } from 'react';
import { 
  InventoryItem, CoilStats, WickingHistory, UserExperience, 
  InventoryCategory, LiquidType, VapingStyle, 
  DripTipType, AtomizerStyle, FlavorCategory 
} from '../types.ts';
import { analyzeSetupLogic, translateText, summarizeAiComment } from '../services/geminiService.ts';
import { useTranslation } from '../i18n.ts';

const renderMarkdown = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    // Headers
    if (line.startsWith('### ')) return <h3 key={i} className="text-blue-400 font-bold mt-4 mb-2 text-lg">{line.substring(4)}</h3>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-blue-500 font-black mt-5 mb-3 text-xl uppercase tracking-tighter">{line.substring(3)}</h2>;
    
    // Lists
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      return <li key={i} className="ml-5 list-disc text-slate-300 mb-1">{line.trim().substring(2)}</li>;
    }

    // Bold & Inline Code
    let content: any = line;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const codeRegex = /`(.*?)`/g;
    
    const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
    return (
      <p key={i} className="mb-2 text-slate-300 leading-relaxed">
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="text-white font-black">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index} className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[11px] border border-white/5">{part.slice(1, -1)}</code>;
          }
          return part;
        })}
      </p>
    );
  });
};

interface WickingLogProps {
  inventory: InventoryItem[];
  coils: CoilStats[];
  history: WickingHistory[];
  experiences: UserExperience[];
  onAdd: (log: WickingHistory) => void;
  onAddGear: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => InventoryItem | null;
  onAddCoilPreset: (coil: CoilStats) => void;
}

const WickingLog: React.FC<WickingLogProps> = ({ inventory, coils, history, experiences, onAdd, onAddGear, onAddCoilPreset }) => {
  const { t, lang } = useTranslation();
  
  // Selection States
  const [attyId, setAttyId] = useState('');
  const [vapingStyle, setVapingStyle] = useState<VapingStyle>('MTL');
  const [coilId, setCoilId] = useState('');
  const [cottonId, setCottonId] = useState('');
  const [liquidId, setLiquidId] = useState('');
  const [wattage, setWattage] = useState(15);
  const [coilHeight, setCoilHeight] = useState<number>(1.5);
  const [lifetimeMl, setLifetimeMl] = useState(8);
  const [notes, setNotes] = useState('');
  const [setupImageUrl, setSetupImageUrl] = useState('');
  const [afcEnabled, setAfcEnabled] = useState(true);
  const [holesNumber, setHolesNumber] = useState<number>(1);
  const [insertEnabled, setInsertEnabled] = useState(false);
  const [insertSize, setInsertSize] = useState<number>(1.2);
  const [dripTip, setDripTip] = useState<DripTipType>('Medium');
  const [dripTipCustom, setDripTipCustom] = useState('');

  // Creation Toggles
  const [isAddingAtty, setIsAddingAtty] = useState(false);
  const [newAtty, setNewAtty] = useState({ brand: '', model: '', type: 'MTL' as AtomizerStyle, price: 0, capacity: 2 });

  const [isAddingCoil, setIsAddingCoil] = useState(false);
  const [newCoil, setNewCoil] = useState({ material: 'Ni80', resistance: 0.8, id: 2.5, wraps: 6, type: 'Contact' as 'Contact'|'Spaced', gauge: '28ga', coilType: 'Round', coilTypeOther: '' });

  const [isAddingCotton, setIsAddingCotton] = useState(false);
  const [newCotton, setNewCotton] = useState({ brand: '', name: '' });

  const [isAddingLiquid, setIsAddingLiquid] = useState(false);
  const [newLiquid, setNewLiquid] = useState({ brand: '', flavor: '', type: 'Nic Salt' as LiquidType, nicotine: 12, price: 0 });

  // AI & UI
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const setupImageRef = useRef<HTMLInputElement>(null);

  // Fix: Added missing image upload handler
  const handleSetupImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSetupImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFinalAdd = (status: 'active' | 'archived') => {
    let finalAttyId = attyId;
    let finalCoilId = coilId;
    let finalCottonId = cottonId;
    let finalLiquidId = liquidId;

    if (isAddingAtty) {
      const g = onAddGear({ brand: newAtty.brand, name: newAtty.model, category: 'atomizer', style: newAtty.type, price: newAtty.price, specs: { capacity: newAtty.capacity } });
      if (g) finalAttyId = g.id;
    }
    if (isAddingCoil) {
      const c: CoilStats = { 
        id: `coil-${Date.now()}`, 
        name: `${newCoil.material} ${newCoil.coilType === 'Other' ? newCoil.coilTypeOther : newCoil.coilType} ${newCoil.resistance}Ω`,
        resistance: newCoil.resistance, material: newCoil.material, innerDiameter: newCoil.id, wraps: newCoil.wraps, type: newCoil.type, images: [], createdAt: Date.now(), gauge: newCoil.gauge 
      };
      onAddCoilPreset(c);
      finalCoilId = c.id;
    }
    if (isAddingCotton) {
      const g = onAddGear({ brand: newCotton.brand, name: newCotton.name, category: 'cotton' });
      if (g) finalCottonId = g.id;
    }
    if (isAddingLiquid) {
      const g = onAddGear({ brand: newLiquid.brand, name: newLiquid.flavor, category: 'liquid', price: newLiquid.price, specs: { liquidType: newLiquid.type, nicotineStrength: newLiquid.nicotine, flavor: newLiquid.flavor } });
      if (g) finalLiquidId = g.id;
    }

    if (!finalAttyId || !finalCottonId || !finalLiquidId) {
      alert(t.errorRequired);
      return;
    }

    onAdd({
      id: Date.now().toString(), atomizerId: finalAttyId, vapingStyle, coilId: finalCoilId, cottonId: finalCottonId, liquidId: finalLiquidId,
      wattage, airflow: { afcEnabled, holesNumber, insertEnabled, insertSize }, coilHeightMm: coilHeight, dripTip, dripTipCustomValue: dripTip === 'Custom' ? dripTipCustom : undefined,
      mlConsumed: 0, maxWickLife: lifetimeMl, notes, degradationScore: 0, imageUrl: setupImageUrl, status, date: Date.now(), isActive: status === 'active'
    });
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl space-y-8">
        
        {/* ATOMIZER */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.deviceSelection}</label>
            <button onClick={() => setIsAddingAtty(!isAddingAtty)} className="text-[9px] font-black uppercase text-blue-500">{isAddingAtty ? t.cancel : t.addNew}</button>
          </div>
          {isAddingAtty ? (
            <div className="p-5 bg-slate-950/40 rounded-[2rem] border border-slate-800 space-y-4 animate-in zoom-in-95">
              <input placeholder="Brand (e.g. SvoëMesto)" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newAtty.brand} onChange={e => setNewAtty({...newAtty, brand: e.target.value})} />
              <input placeholder="Model (e.g. Kayfun X)" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newAtty.model} onChange={e => setNewAtty({...newAtty, model: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <select className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newAtty.type} onChange={e => setNewAtty({...newAtty, type: e.target.value as any})}>
                  <option value="MTL">MTL</option><option value="RTA">RTA</option><option value="RDA">RDA</option><option value="RDTA">RDTA</option>
                </select>
                <input type="number" placeholder="Price ($)" className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newAtty.price || ''} onChange={e => setNewAtty({...newAtty, price: Number(e.target.value)})} />
              </div>
              <input type="number" placeholder="Capacity (ml)" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newAtty.capacity || ''} onChange={e => setNewAtty({...newAtty, capacity: Number(e.target.value)})} />
            </div>
          ) : (
            <select value={attyId} onChange={e => setAttyId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200">
              <option value="">{t.deviceSelection}</option>
              {inventory.filter(i => i.category === 'atomizer').map(a => <option key={a.id} value={a.id}>{a.brand} {a.name}</option>)}
            </select>
          )}
          <select value={vapingStyle} onChange={e => setVapingStyle(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 mt-2">
            <option value="MTL">MTL</option><option value="RDL">RDL</option><option value="DL">DL</option>
          </select>
        </section>

        {/* COIL */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.coilConfig}</label>
            <button onClick={() => setIsAddingCoil(!isAddingCoil)} className="text-[9px] font-black uppercase text-blue-500">{isAddingCoil ? t.cancel : t.customBuild}</button>
          </div>
          {isAddingCoil ? (
            <div className="p-5 bg-slate-950/40 rounded-[2rem] border border-slate-800 space-y-4 animate-in zoom-in-95">
              <div className="grid grid-cols-2 gap-3">
                <select className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newCoil.material} onChange={e => setNewCoil({...newCoil, material: e.target.value})}>
                  {['Kanthal A1', 'Ni80', 'SS316L', 'Ni200', 'Titanium'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input placeholder="Gauge (e.g. 28ga)" className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newCoil.gauge} onChange={e => setNewCoil({...newCoil, gauge: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newCoil.coilType} onChange={e => setNewCoil({...newCoil, coilType: e.target.value})}>
                  {['Round', 'Parallel', 'Twisted', 'Clapton', 'Fused Clapton', 'Alien', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {newCoil.coilType === 'Other' && <input placeholder="Custom Coil Type" className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newCoil.coilTypeOther} onChange={e => setNewCoil({...newCoil, coilTypeOther: e.target.value})} />}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Ohms (Ω)" className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newCoil.resistance || ''} onChange={e => setNewCoil({...newCoil, resistance: Number(e.target.value)})} />
                <input type="number" placeholder="ID (mm)" className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newCoil.id || ''} onChange={e => setNewCoil({...newCoil, id: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Wraps" className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newCoil.wraps || ''} onChange={e => setNewCoil({...newCoil, wraps: Number(e.target.value)})} />
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button onClick={() => setNewCoil({...newCoil, type: 'Contact'})} className={`flex-1 py-1 rounded-lg text-[8px] uppercase font-black ${newCoil.type === 'Contact' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>Contact</button>
                  <button onClick={() => setNewCoil({...newCoil, type: 'Spaced'})} className={`flex-1 py-1 rounded-lg text-[8px] uppercase font-black ${newCoil.type === 'Spaced' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>Spaced</button>
                </div>
              </div>
            </div>
          ) : (
            <select value={coilId} onChange={e => setCoilId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200">
              <option value="">{t.coilConfig}</option>
              {coils.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </section>

        {/* COTTON */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.cottonBrand}</label>
            <button onClick={() => setIsAddingCotton(!isAddingCotton)} className="text-[9px] font-black uppercase text-blue-500">{isAddingCotton ? t.cancel : t.addNew}</button>
          </div>
          {isAddingCotton ? (
            <div className="p-5 bg-slate-950/40 rounded-[2rem] border border-slate-800 space-y-4 animate-in zoom-in-95">
              <input placeholder="Brand (e.g. Wick N Vape)" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newCotton.brand} onChange={e => setNewCotton({...newCotton, brand: e.target.value})} />
              <input placeholder="Product Name (e.g. Cotton Bacon)" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newCotton.name} onChange={e => setNewCotton({...newCotton, name: e.target.value})} />
            </div>
          ) : (
            <select value={cottonId} onChange={e => setCottonId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200">
              <option value="">{t.cottonBrand}</option>
              {inventory.filter(i => i.category === 'cotton').map(c => <option key={c.id} value={c.id}>{c.brand} {c.name}</option>)}
            </select>
          )}
        </section>

        {/* LIQUID */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.flavorLiquid}</label>
            <button onClick={() => setIsAddingLiquid(!isAddingLiquid)} className="text-[9px] font-black uppercase text-blue-500">{isAddingLiquid ? t.cancel : t.addNew}</button>
          </div>
          {isAddingLiquid ? (
            <div className="p-5 bg-slate-950/40 rounded-[2rem] border border-slate-800 space-y-4 animate-in zoom-in-95">
              <input placeholder="Brand" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newLiquid.brand} onChange={e => setNewLiquid({...newLiquid, brand: e.target.value})} />
              <input placeholder="Flavor Name" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newLiquid.flavor} onChange={e => setNewLiquid({...newLiquid, flavor: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <select className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newLiquid.type} onChange={e => setNewLiquid({...newLiquid, type: e.target.value as any})}>
                  <option value="Nic Salt">Nic Salt</option><option value="E-Juice Freebase">Freebase</option><option value="Shortfill">Shortfill</option>
                </select>
                <input type="number" placeholder="Nicotine (mg)" className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newLiquid.nicotine || ''} onChange={e => setNewLiquid({...newLiquid, nicotine: Number(e.target.value)})} />
              </div>
              <input type="number" placeholder="Price" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={newLiquid.price || ''} onChange={e => setNewLiquid({...newLiquid, price: Number(e.target.value)})} />
            </div>
          ) : (
            <select value={liquidId} onChange={e => setLiquidId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200">
              <option value="">{t.flavorLiquid}</option>
              {inventory.filter(i => i.category === 'liquid').map(l => <option key={l.id} value={l.id}>{l.brand} {l.name}</option>)}
            </select>
          )}
        </section>

        {/* WATTAGE & HEIGHT */}
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.coilHeight}</label>
              <input type="number" step="0.1" value={coilHeight} placeholder="1.5 mm" onChange={e => setCoilHeight(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Wattage (W)</label>
              <input type="number" value={wattage} placeholder="15 W" onChange={e => setWattage(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none" />
           </div>
        </div>

        {/* AIRFLOW */}
        <section className="space-y-4 p-5 bg-slate-950/20 rounded-[2rem] border border-slate-800/40">
           <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.airflowConfig}</span>
           </div>
           <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
               <div className="flex items-center gap-2 mb-1">
                 <input type="checkbox" checked={afcEnabled} onChange={e => setAfcEnabled(e.target.checked)} id="afc_toggle" />
                 <label htmlFor="afc_toggle" className="text-[9px] text-slate-400 uppercase font-black">{t.afcToggle}</label>
               </div>
               {afcEnabled && <input type="number" placeholder={t.holesNumber} value={holesNumber} onChange={e => setHolesNumber(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none" />}
             </div>
             <div className="space-y-2">
               <div className="flex items-center gap-2 mb-1">
                 <input type="checkbox" checked={insertEnabled} onChange={e => setInsertEnabled(e.target.checked)} id="insert_toggle" />
                 <label htmlFor="insert_toggle" className="text-[9px] text-slate-400 uppercase font-black">{t.insertToggle}</label>
               </div>
               {insertEnabled && <input type="number" step="0.1" placeholder={t.insertSize} value={insertSize} onChange={e => setInsertSize(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none" />}
             </div>
           </div>
        </section>

        {/* DRIP TIP */}
        <section className="space-y-3">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.dripTip}</label>
           <select value={dripTip} onChange={e => setDripTip(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200">
              <option value="Short">Short</option><option value="Medium">Medium</option><option value="Long">Long</option><option value="Custom">Custom</option>
           </select>
           {dripTip === 'Custom' && <input placeholder="Enter Custom Drip Tip Style" value={dripTipCustom} onChange={e => setDripTipCustom(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white mt-2 outline-none" />}
        </section>

        {/* LIFETIME */}
        <section className="space-y-4">
           <div className="flex justify-between px-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.lifetimeMl}</label>
              <span className="text-sm font-black text-blue-500">{lifetimeMl} ML</span>
           </div>
           <input type="range" min="1" max="20" step="1" value={lifetimeMl} onChange={e => setLifetimeMl(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-full appearance-none accent-blue-600" />
        </section>

        {/* NOTES */}
        <section className="space-y-3">
           <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.setupNotes}</label>
              <button onClick={() => setIsPreview(!isPreview)} className="text-[9px] font-black uppercase text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full bg-blue-500/5 transition-all">{isPreview ? t.editMode : t.previewMarkdown}</button>
           </div>
           {isPreview ? (
             <div className="w-full bg-slate-950/50 border border-slate-800 rounded-[2rem] p-5 text-sm min-h-[10rem] text-slate-200 overflow-y-auto animate-in fade-in">
                {renderMarkdown(notes) || <span className="opacity-30 italic">No notes. Try using **bold** or `code` tags.</span>}
             </div>
           ) : (
             <textarea placeholder="Write technical notes here... (Supports Markdown like ### Titles, **Bold**, `Code`)" className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-5 text-sm h-40 resize-none text-slate-200 outline-none focus:ring-blue-500" value={notes} onChange={e => setNotes(e.target.value)} />
           )}
        </section>

        <section className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.addSetupPicture}</label>
          <div onClick={() => setupImageRef.current?.click()} className="w-full h-40 rounded-[2.5rem] bg-slate-950/30 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-500/50 transition-all shadow-inner">
            {setupImageUrl ? <img src={setupImageUrl} className="w-full h-full object-cover" alt="" /> : <><i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-700 group-hover:text-blue-500 mb-2 transition-colors"></i><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t.uploadImg}</span></>}
          </div>
          <input type="file" ref={setupImageRef} onChange={handleSetupImageUpload} className="hidden" accept="image/*" />
        </section>

        <button type="button" onClick={() => setShowStatusModal(true)} className="btn-primary w-full py-6 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] active:scale-95 transition-all text-xs shadow-2xl">
          {t.confirmTracking}
        </button>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[110] p-6 animate-in fade-in">
           <div className="w-full max-w-xs bg-slate-900 rounded-[3rem] p-9 border border-slate-800 shadow-3xl text-center space-y-8">
              <p className="text-sm font-black text-slate-300 leading-relaxed">{t.statusPrompt}</p>
              <div className="space-y-4">
                 <button onClick={() => { handleFinalAdd('active'); setShowStatusModal(false); }} className="w-full py-5 bg-blue-600 rounded-[2rem] text-white font-black uppercase text-xs tracking-widest shadow-xl">{t.activeStatus}</button>
                 <button onClick={() => { handleFinalAdd('archived'); setShowStatusModal(false); }} className="w-full py-5 bg-slate-800 rounded-[2rem] text-slate-400 font-black uppercase text-xs tracking-widest border border-slate-700">{t.archiveStatus}</button>
              </div>
              <button onClick={() => setShowStatusModal(false)} className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{t.cancel}</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default WickingLog;
