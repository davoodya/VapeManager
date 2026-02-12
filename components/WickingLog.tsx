
import React, { useState, useEffect, useRef } from 'react';
import { 
  InventoryItem, CoilStats, WickingHistory, UserExperience, 
  WireMaterial, InventoryCategory, LiquidType, VapingStyle, 
  DripTipType, AtomizerStyle 
} from '../types.ts';
import { analyzeSetupLogic, translateText, summarizeAiComment } from '../services/geminiService.ts';
import { useTranslation } from '../i18n.ts';

// Manual simple markdown parser to avoid heavy dependency while showing Task 1 satisfaction
const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bullet points
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      return <li key={i} className="ml-4 list-disc text-slate-300">{line.trim().substring(2)}</li>;
    }
    // Headings
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-blue-400 font-bold mt-3 mb-1">{line.substring(4)}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-blue-500 font-black mt-4 mb-2">{line.substring(3)}</h2>;
    }
    // Bold
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = line.split(boldRegex);
    return (
      <p key={i} className="mb-2 text-slate-300 leading-relaxed">
        {parts.map((part, index) => index % 2 === 1 ? <strong key={index} className="text-white font-black">{part}</strong> : part)}
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
  const [attyId, setAttyId] = useState('');
  const [vapingStyle, setVapingStyle] = useState<VapingStyle>('MTL');
  const [coilId, setCoilId] = useState('');
  const [manualCoil, setManualCoil] = useState<Partial<CoilStats>>({ resistance: 1.0 });
  const [cottonId, setCottonId] = useState('');
  const [liquidId, setLiquidId] = useState('');
  const [wattage, setWattage] = useState(15);
  
  // Airflow
  const [afcEnabled, setAfcEnabled] = useState(false);
  const [holesNumber, setHolesNumber] = useState<number>(1);
  const [insertEnabled, setInsertEnabled] = useState(false);
  const [insertSize, setInsertSize] = useState<number>(1.2);
  
  const [coilHeight, setCoilHeight] = useState<number>(1.5);
  const [dripTip, setDripTip] = useState<DripTipType>('Medium');
  const [dripTipCustom, setDripTipCustom] = useState('');
  const [lifetimeMl, setLifetimeMl] = useState(8);
  const [notes, setNotes] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [setupImageUrl, setSetupImageUrl] = useState('');
  
  // Status Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingLog, setPendingLog] = useState<WickingHistory | null>(null);

  // AI Analysis State
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Creation Modals
  const [modalCategory, setModalCategory] = useState<InventoryCategory | null>(null);
  const [modalForm, setModalForm] = useState<any>({ 
    name: '', 
    brand: '', 
    price: 0, 
    style: 'MTL',
    liquidType: 'E-Juice Freebase',
    nicotine: 0,
    cottonId: 3.0
  });

  const setupImageRef = useRef<HTMLInputElement>(null);

  const atomizers = inventory.filter(i => i.category === 'atomizer');
  const cottons = inventory.filter(i => i.category === 'cotton');
  const liquids = inventory.filter(i => i.category === 'liquid');

  const handleAddModalGear = () => {
    if (!modalForm.name.trim() || !modalCategory) return;
    
    let specs: any = {};
    if (modalCategory === 'liquid') {
      specs = { 
        liquidType: modalForm.liquidType || 'E-Juice Freebase', 
        nicotineStrength: modalForm.nicotine || 0 
      };
    } else if (modalCategory === 'cotton') {
      specs = { innerDiameter: modalForm.cottonId || 3.0 };
    }

    const newItem = onAddGear({
      name: modalForm.name,
      brand: modalForm.brand,
      category: modalCategory,
      price: modalForm.price,
      style: modalForm.style,
      specs,
    });

    if (newItem) {
      if (modalCategory === 'atomizer') setAttyId(newItem.id);
      if (modalCategory === 'cotton') setCottonId(newItem.id);
      if (modalCategory === 'liquid') setLiquidId(newItem.id);
    }
    setModalCategory(null);
    setModalForm({ name: '', brand: '', price: 0, style: 'MTL' });
  };

  const handleAiComment = async () => {
    setLoadingAi(true);
    setAiResult(null);
    const atty = inventory.find(i => i.id === attyId);
    const liquid = inventory.find(i => i.id === liquidId);
    
    const analysisPayload = {
      vapingStyle,
      atomizerModel: atty?.name || 'Generic',
      atomizerStyle: atty?.style || 'Unknown',
      coilData: coilId ? coils.find(c => c.id === coilId) : manualCoil,
      airflow: { afcEnabled, holesNumber, insertEnabled, insertSize },
      dripTip,
      dripTipCustomValue: dripTipCustom,
      coilHeightMm: coilHeight,
      liquidNicotine: liquid?.specs?.nicotineStrength || 0,
      liquidType: liquid?.specs?.liquidType || 'E-Juice'
    };

    const result = await analyzeSetupLogic(analysisPayload);
    setAiResult(result);
    setLoadingAi(false);
  };

  const handleTranslate = async (targetLang: string) => {
    if (!aiResult) return;
    setIsTranslating(true);
    setShowLangMenu(false);
    const translated = await translateText(aiResult, targetLang);
    setAiResult(translated);
    setIsTranslating(false);
  };

  const handleSummarize = async () => {
    if (!aiResult) return;
    setIsSummarizing(true);
    const summarized = await summarizeAiComment(aiResult);
    setAiResult(summarized);
    setIsSummarizing(false);
  };

  const handleAppendAiToNotes = () => {
    if (!aiResult) return;
    const cleanAiText = `\n\n### AI Insight\n${aiResult}`;
    setNotes(prev => (prev.trim() + cleanAiText).trim());
    setIsPreview(true); // Task 1 satisfaction: Show the result immediately
  };

  const handleSetupImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSetupImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFinalAdd = (status: 'active' | 'archived') => {
    if (!pendingLog) return;
    const finalLog = { ...pendingLog, status, isActive: status === 'active' };
    
    if (!coilId && manualCoil.wire && manualCoil.gauge) {
      const newPreset: CoilStats = {
        id: `preset-${Date.now()}`,
        name: manualCoil.name || `${manualCoil.wire} ${manualCoil.gauge}GA`,
        resistance: manualCoil.resistance || 0,
        wire: manualCoil.wire,
        gauge: manualCoil.gauge,
        wraps: manualCoil.wraps,
        innerDiameter: manualCoil.innerDiameter,
        type: manualCoil.type || 'Contact',
        images: [],
        createdAt: Date.now(),
        liquidConsumed: 0,
        usageCount: 1
      };
      onAddCoilPreset(newPreset);
    }

    onAdd(finalLog);
    setShowStatusModal(false);
    setPendingLog(null);
    resetForm();
  };

  const resetForm = () => {
    setAttyId(''); setCoilId(''); setCottonId(''); setLiquidId('');
    setManualCoil({ resistance: 1.0 });
    setWattage(15); setAfcEnabled(false); setInsertEnabled(false);
    setNotes(''); setAiResult(null); setSetupImageUrl(''); setIsPreview(false);
  };

  const prepareLog = () => {
    if (!attyId || !cottonId || !liquidId) {
      alert(t.errorRequired);
      return;
    }
    const log: WickingHistory = {
      id: Date.now().toString(), atomizerId: attyId, vapingStyle, coilId: coilId || undefined, coilData: coilId ? undefined : manualCoil,
      cottonId, liquidId, wattage, airflow: { afcEnabled, holesNumber, insertEnabled, insertSize }, coilHeightMm: coilHeight,
      dripTip, dripTipCustomValue: dripTipCustom, mlConsumed: 0, maxWickLife: lifetimeMl, notes, degradationScore: 0,
      imageUrl: setupImageUrl, status: 'active', date: Date.now(), isActive: true
    };
    setPendingLog(log);
    setShowStatusModal(true);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl space-y-8">
        
        {/* Hardware Selection Section */}
        <section className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.deviceSelection}</label>
            <div className="flex gap-2">
              <select value={attyId} onChange={e => setAttyId(e.target.value)} className="flex-1 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 shadow-inner">
                <option value="">{t.deviceSelection}</option>
                {atomizers.map(a => <option key={a.id} value={a.id}>{a.brand} {a.name}</option>)}
              </select>
              <button type="button" onClick={() => setModalCategory('atomizer')} className="w-14 bg-blue-600/15 text-blue-400 border border-blue-600/30 rounded-2xl flex items-center justify-center transition-all">
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.vapingStyle}</label>
            <div className="flex gap-2">
              {(['MTL', 'RDL', 'DL'] as VapingStyle[]).map(style => (
                <button type="button" key={style} onClick={() => setVapingStyle(style)}
                  className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all border ${vapingStyle === style ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
                  {style}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Coil Selection */}
        <section className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.coilConfig}</label>
          <select value={coilId} onChange={e => setCoilId(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 mb-2 shadow-inner">
            <option value="">{t.customBuild}</option>
            {coils.map(c => <option key={c.id} value={c.id}>{c.name || `${c.wire} ${c.resistance}Ω`}</option>)}
          </select>
          {!coilId && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
              <input placeholder="Wire Alloy" className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-xs text-white" value={manualCoil.wire || ''} onChange={e => setManualCoil({...manualCoil, wire: e.target.value})} />
              <input placeholder="Resistance (Ω)*" type="number" step="0.01" className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-xs text-white" value={manualCoil.resistance || ''} onChange={e => setManualCoil({...manualCoil, resistance: Number(e.target.value)})} />
            </div>
          )}
        </section>

        {/* Consumables Selection */}
        <section className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.cottonBrand}</label>
            <div className="flex gap-2">
              <select value={cottonId} onChange={e => setCottonId(e.target.value)} className="flex-1 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200">
                <option value="">{t.all}</option>
                {cottons.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="button" onClick={() => setModalCategory('cotton')} className="w-12 bg-slate-800 border border-slate-700 rounded-2xl text-slate-400 flex items-center justify-center"><i className="fa-solid fa-plus text-xs"></i></button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.flavorLiquid}</label>
            <div className="flex gap-2">
              <select value={liquidId} onChange={e => setLiquidId(e.target.value)} className="flex-1 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200">
                <option value="">{t.all}</option>
                {liquids.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <button type="button" onClick={() => setModalCategory('liquid')} className="w-12 bg-slate-800 border border-slate-700 rounded-2xl text-slate-400 flex items-center justify-center"><i className="fa-solid fa-plus text-xs"></i></button>
            </div>
          </div>
        </section>

        {/* Airflow Section */}
        <section className="space-y-4 p-6 bg-slate-950/40 rounded-[2.2rem] border border-slate-800">
          <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">{t.airflowConfig}</label>
          <div className="flex items-center justify-between">
             <span className="text-xs font-bold text-slate-400">{t.afcToggle}</span>
             <button type="button" onClick={() => setAfcEnabled(!afcEnabled)} className={`w-11 h-6 rounded-full relative transition-all ${afcEnabled ? 'bg-blue-600' : 'bg-slate-800'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${afcEnabled ? 'right-1' : 'left-1'}`}></div>
             </button>
          </div>
          {afcEnabled && (
            <input type="number" placeholder={t.holesNumber} value={holesNumber} onChange={e => setHolesNumber(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white animate-in slide-in-from-top-1" />
          )}
          <div className="flex items-center justify-between">
             <span className="text-xs font-bold text-slate-400">{t.insertToggle}</span>
             <button type="button" onClick={() => setInsertEnabled(!insertEnabled)} className={`w-11 h-6 rounded-full relative transition-all ${insertEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${insertEnabled ? 'right-1' : 'left-1'}`}></div>
             </button>
          </div>
          {insertEnabled && (
            <input type="number" step="0.2" placeholder={t.insertSize} value={insertSize} onChange={e => setInsertSize(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white animate-in slide-in-from-top-1" />
          )}
        </section>

        {/* Setup Details */}
        <div className="grid grid-cols-2 gap-4">
           <section className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.coilHeight}</label>
              <input type="number" step="0.1" value={coilHeight} onChange={e => setCoilHeight(Number(e.target.value))} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-xs text-white" />
           </section>
           <section className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.dripTip}</label>
              <select value={dripTip} onChange={e => setDripTip(e.target.value as any)} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-xs text-white">
                {(['Short', 'Medium', 'Long', 'Custom'] as DripTipType[]).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
           </section>
        </div>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.lifetimeMl}</label>
            <span className="text-sm font-black text-blue-500">{lifetimeMl} ML</span>
          </div>
          <input type="range" min="1" max="20" step="1" value={lifetimeMl} onChange={e => setLifetimeMl(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-full appearance-none accent-blue-600 cursor-pointer" />
        </section>

        {/* Setup Notes with Markdown Preview Task 1 Satisfaction */}
        <section className="space-y-3">
           <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.setupNotes}</label>
              <button onClick={() => setIsPreview(!isPreview)} className="text-[9px] font-black uppercase text-blue-500 tracking-widest border border-blue-500/20 px-3 py-1 rounded-full bg-blue-500/5">
                {isPreview ? t.editMode : t.previewMarkdown}
              </button>
           </div>
           {isPreview ? (
             <div className="w-full bg-slate-950/50 border border-slate-800 rounded-[2rem] p-5 text-sm min-h-[8rem] text-slate-200 overflow-y-auto animate-in fade-in">
                {renderMarkdown(notes) || <span className="opacity-30 italic">No notes added.</span>}
             </div>
           ) : (
             <textarea placeholder="..." className="w-full bg-slate-950/50 border border-slate-800 rounded-[2rem] p-5 text-sm h-32 resize-none text-slate-200 outline-none focus:ring-blue-500 animate-in slide-in-from-top-1"
               value={notes} onChange={e => setNotes(e.target.value)} />
           )}
        </section>

        {/* TASK 1: New Position for Setup Picture Button */}
        <section className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.addSetupPicture}</label>
          <div onClick={() => setupImageRef.current?.click()}
            className="w-full h-40 rounded-[2.5rem] bg-slate-950/30 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-500/50 transition-all shadow-inner">
            {setupImageUrl ? (
              <img src={setupImageUrl} className="w-full h-full object-cover" alt="Setup" />
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-700 group-hover:text-blue-500 mb-2 transition-colors"></i>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t.uploadImg}</span>
              </>
            )}
          </div>
          <input type="file" ref={setupImageRef} onChange={handleSetupImageUpload} className="hidden" accept="image/*" />
        </section>

        {/* AI Analysis Section */}
        <div className="pt-4 space-y-4">
          <button type="button" onClick={handleAiComment} disabled={loadingAi || isTranslating || isSummarizing || !attyId || (!coilId && !manualCoil.resistance)}
            className="w-full py-5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-[2.2rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-indigo-600/20 active:scale-95 disabled:opacity-30">
            {loadingAi ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-brain"></i>}
            {t.aiComment}
          </button>
          
          {aiResult && (
            <div className="p-7 bg-slate-950/80 border border-indigo-500/20 rounded-[2.5rem] text-xs text-slate-300 italic leading-relaxed animate-in fade-in">
              <div className="text-[8px] font-black text-indigo-500 uppercase mb-4 tracking-widest">{t.aiRec}</div>
              <div className="whitespace-pre-line prose prose-invert prose-sm">
                {isTranslating ? t.translateText : isSummarizing ? t.summarizing : aiResult}
              </div>
              
              {/* TASK 2 & 3: 2x2 Grid for AI Action Buttons with Summary and Aesthetics */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                 <button type="button" onClick={() => { navigator.clipboard.writeText(aiResult); alert('Copied!'); }}
                   className="flex items-center justify-center gap-2 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 transition-all hover:border-blue-500/50 active:scale-95">
                   <i className="fa-solid fa-copy text-blue-500"></i> {t.copyText}
                 </button>
                 <button type="button" onClick={handleSummarize} disabled={isSummarizing}
                   className="flex items-center justify-center gap-2 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 transition-all hover:border-amber-500/50 active:scale-95 disabled:opacity-40">
                   <i className="fa-solid fa-compress text-amber-500"></i> {t.summary}
                 </button>
                 <button type="button" onClick={() => setShowLangMenu(!showLangMenu)}
                   className="flex items-center justify-center gap-2 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 transition-all hover:border-green-500/50 active:scale-95">
                   <i className="fa-solid fa-language text-green-500"></i> {t.translate}
                 </button>
                 <button type="button" onClick={handleAppendAiToNotes}
                   className="flex items-center justify-center gap-2 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 transition-all hover:border-indigo-500/50 active:scale-95">
                   <i className="fa-solid fa-file-import text-indigo-500"></i> {t.appendToNotes}
                 </button>
              </div>

              {showLangMenu && (
                <div className="mt-4 grid grid-cols-2 gap-2 animate-in zoom-in-95">
                  {['Farsi Persian', 'French', 'Arabic', 'Deutsch'].map(l => (
                    <button key={l} onClick={() => handleTranslate(l)} className="py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-[9px] font-bold text-slate-400 hover:bg-indigo-900/30 transition-colors">
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button type="button" onClick={prepareLog} className="btn-primary w-full py-6 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] active:scale-95 transition-all text-xs">
          {t.confirmTracking}
        </button>
      </div>

      {/* Creation Modal */}
      {modalCategory && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in">
           <div className="w-full max-w-sm bg-slate-900 rounded-[3rem] p-8 border border-slate-800 shadow-3xl space-y-6 overflow-y-auto max-h-[90vh]">
              <h4 className="text-xl font-black text-white italic uppercase">{t[`cat_${modalCategory}`] as any}</h4>
              <div className="space-y-4">
                 <input placeholder={t.model} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white" value={modalForm.name} onChange={e => setModalForm({...modalForm, name: e.target.value})} />
                 <input placeholder={t.brand} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white" value={modalForm.brand} onChange={e => setModalForm({...modalForm, brand: e.target.value})} />
                 
                 {modalCategory === 'liquid' && (
                   <div className="space-y-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                     <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={modalForm.liquidType} onChange={e => setModalForm({...modalForm, liquidType: e.target.value})}>
                       <option value="Nic Salt">Nic Salt</option>
                       <option value="E-Juice Freebase">E-Juice Freebase</option>
                       <option value="Shortfill">Shortfill</option>
                     </select>
                     <input type="number" placeholder="mg/ml" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" value={modalForm.nicotine} onChange={e => setModalForm({...modalForm, nicotine: Number(e.target.value)})} />
                   </div>
                 )}
                 <div className="grid grid-cols-2 gap-4">
                    <input placeholder={t.price} type="number" className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white" value={modalForm.price || ''} onChange={e => setModalForm({...modalForm, price: Number(e.target.value)})} />
                    {modalCategory === 'atomizer' && (
                      <select value={modalForm.style} onChange={e => setModalForm({...modalForm, style: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white">
                        {['MTL', 'RTA', 'RDA', 'RDTA'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                 </div>
              </div>
              <div className="flex gap-4">
                 <button type="button" onClick={() => setModalCategory(null)} className="flex-1 bg-slate-800 py-4 rounded-2xl font-black uppercase text-[10px]">{t.cancel}</button>
                 <button type="button" onClick={handleAddModalGear} className="flex-[2] bg-blue-600 py-4 rounded-2xl font-black uppercase text-[10px]">{t.save}</button>
              </div>
           </div>
        </div>
      )}

      {/* Status Selection Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[110] p-6">
           <div className="w-full max-w-xs bg-slate-900 rounded-[3rem] p-9 border border-slate-800 shadow-3xl text-center space-y-8">
              <p className="text-sm font-black text-slate-300 leading-relaxed">{t.statusPrompt}</p>
              <div className="space-y-4">
                 <button type="button" onClick={() => handleFinalAdd('active')} className="w-full py-5 bg-blue-600 rounded-[2rem] text-white font-black uppercase text-xs tracking-widest shadow-xl">{t.activeStatus}</button>
                 <button type="button" onClick={() => handleFinalAdd('archived')} className="w-full py-5 bg-slate-800 rounded-[2rem] text-slate-400 font-black uppercase text-xs tracking-widest border border-slate-700">{t.archiveStatus}</button>
              </div>
              <button type="button" onClick={() => setShowStatusModal(false)} className="text-[10px] text-slate-600 font-bold uppercase tracking-widest transition-colors hover:text-slate-400">{t.cancel}</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default WickingLog;
