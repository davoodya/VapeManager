
import React, { useState, useRef } from 'react';
import { CoilStats, WireMaterial, WireType, CoilConfig } from '../types';
import { useTranslation } from '../i18n';

interface CoilListProps {
  coils: CoilStats[];
  onAdd: (coil: CoilStats) => void;
  onDelete: (id: string) => void;
}

const CoilList: React.FC<CoilListProps> = ({ coils, onAdd, onDelete }) => {
  const { t, lang } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Initialize with all required properties for CoilStats partial
  const [newCoil, setNewCoil] = useState<Partial<CoilStats>>({
    name: '',
    material: WireMaterial.KANTHAL_A1,
    gauge: 26,
    innerDiameter: 2.5,
    wraps: 6,
    type: 'Contact',
    wireConfig: 'Round',
    coilCount: 'Single',
    resistance: 0.8,
    images: []
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCoil(prev => ({ 
          ...prev, 
          images: [reader.result as string, ...(prev.images || [])] 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!newCoil.name) return;
    // Fix: Ensure all properties of CoilStats (wireConfig, coilCount) are included
    const coil: CoilStats = {
      id: `coil-${Date.now()}`,
      name: newCoil.name || 'New Coil',
      resistance: newCoil.resistance || 0,
      material: newCoil.material || WireMaterial.KANTHAL_A1,
      gauge: newCoil.gauge || 26,
      wraps: newCoil.wraps || 6,
      innerDiameter: newCoil.innerDiameter || 2.5,
      type: (newCoil.type as any) || 'Contact',
      wireConfig: newCoil.wireConfig as WireType || 'Round',
      coilCount: newCoil.coilCount as CoilConfig || 'Single',
      liquidConsumed: 0,
      usageCount: 0,
      images: newCoil.images || [],
      createdAt: Date.now()
    };
    onAdd(coil);
    setShowAdd(false);
    // Reset state with all properties
    setNewCoil({ 
      name: '',
      material: WireMaterial.KANTHAL_A1, 
      gauge: 26, 
      innerDiameter: 2.5, 
      wraps: 6, 
      type: 'Contact', 
      wireConfig: 'Round',
      coilCount: 'Single',
      resistance: 0.8, 
      images: [] 
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-400">{t.coilClasses}</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          className="bg-blue-600 p-2 rounded-full w-12 h-12 flex items-center justify-center transition-transform active:scale-90 shadow-lg"
        >
          <i className={`fa-solid ${showAdd ? 'fa-times' : 'fa-plus'} text-lg`}></i>
        </button>
      </div>

      {showAdd && (
        <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-700 space-y-4 animate-in slide-in-from-top-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-5 mb-4">
             <div 
               className="w-24 h-24 rounded-[2rem] bg-slate-950 border-2 border-dashed border-slate-800 flex items-center justify-center cursor-pointer overflow-hidden relative shadow-inner"
               onClick={() => fileInputRef.current?.click()}
             >
                {newCoil.images && newCoil.images.length > 0 ? (
                  <img src={newCoil.images[0]} className="w-full h-full object-cover opacity-80" alt="Preview" />
                ) : (
                  <i className="fa-solid fa-camera text-slate-800 text-2xl"></i>
                )}
             </div>
             <div className="flex-1">
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Build ID Photo</div>
                <p className="text-[10px] text-slate-500 leading-tight">Visual recognition for your performance builds.</p>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>

          <input 
            placeholder={t.name}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white"
            value={newCoil.name || ''}
            onChange={e => setNewCoil({...newCoil, name: e.target.value})}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-600 font-black ml-1 tracking-widest">{t.material}</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none text-white appearance-none" value={newCoil.material} onChange={e => setNewCoil({...newCoil, material: e.target.value as any})}>
                {Object.values(WireMaterial).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-600 font-black ml-1 tracking-widest">{t.resistance} (Ω)</label>
              <input type="number" step="0.01" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none text-white" value={newCoil.resistance} onChange={e => setNewCoil({...newCoil, resistance: Number(e.target.value)})} />
            </div>
          </div>

          {/* New row for wireConfig and coilCount selects */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-600 font-black ml-1 tracking-widest">{t.wireConfig}</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none text-white appearance-none" value={newCoil.wireConfig} onChange={e => setNewCoil({...newCoil, wireConfig: e.target.value as any})}>
                <option value="Round">Round</option>
                <option value="Parallel">Parallel</option>
                <option value="Twisted">Twisted</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-600 font-black ml-1 tracking-widest">{t.coilCount}</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none text-white appearance-none" value={newCoil.coilCount} onChange={e => setNewCoil({...newCoil, coilCount: e.target.value as any})}>
                <option value="Single">Single</option>
                <option value="Dual">Dual</option>
                <option value="Triple">Triple</option>
                <option value="Quad">Quad</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-600 font-black ml-1 tracking-widest">{t.gauge} (AWG)</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white" value={newCoil.gauge} onChange={e => setNewCoil({...newCoil, gauge: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-600 font-black ml-1 tracking-widest">{t.style}</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none text-white appearance-none" value={newCoil.type} onChange={e => setNewCoil({...newCoil, type: e.target.value as any})}>
                <option value="Contact">{t.contact}</option>
                <option value="Spaced">{t.spaced}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-600 font-black ml-1 tracking-widest">{t.wraps}</label>
              <input type="number" step="0.5" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white" value={newCoil.wraps} onChange={e => setNewCoil({...newCoil, wraps: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-600 font-black ml-1 tracking-widest">{t.id} (mm)</label>
              <input type="number" step="0.1" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white" value={newCoil.innerDiameter} onChange={e => setNewCoil({...newCoil, innerDiameter: Number(e.target.value)})} />
            </div>
          </div>

          <button onClick={handleAdd} className="w-full bg-blue-600 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all text-sm mt-4">
            {t.save}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 pb-24">
        {coils.map(coil => (
          <div key={coil.id} className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[2.5rem] relative overflow-hidden group shadow-xl">
            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-[1.5rem] bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
                  {coil.images && coil.images[0] ? (
                    <img src={coil.images[0]} className="w-full h-full object-cover opacity-80" alt="" />
                  ) : (
                    <i className="fa-solid fa-microchip text-blue-500 text-3xl"></i>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-2xl text-slate-100 tracking-tight leading-none mb-2">{coil.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-blue-500 uppercase bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{coil.material}</span>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{coil.gauge}GA • {coil.type === 'Contact' ? t.contact : t.spaced}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => onDelete(coil.id)} className="text-slate-700 hover:text-red-500 p-3 transition-colors">
                <i className="fa-solid fa-trash-can text-lg"></i>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 relative z-10">
              <div className="bg-slate-950/60 p-4 rounded-3xl border border-slate-800/60 text-center">
                <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">Ohms</div>
                <div className="font-black text-slate-200 text-sm">{coil.resistance}Ω</div>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-3xl border border-slate-800/60 text-center">
                <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">Wraps</div>
                <div className="font-black text-slate-200 text-sm">{coil.wraps}</div>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-3xl border border-slate-800/60 text-center">
                <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">ID</div>
                <div className="font-black text-slate-200 text-sm">{coil.innerDiameter}mm</div>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-3xl border border-slate-800/60 text-center">
                <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">Life</div>
                <div className="font-black text-slate-200 text-sm">{coil.liquidConsumed.toFixed(0)}ml</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoilList;
