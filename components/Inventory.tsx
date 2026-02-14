
import React, { useState, useRef, useMemo } from 'react';
import { InventoryItem, InventoryCategory, LiquidType, FlavorCategory, AtomizerStyle } from '../types.ts';
import { useTranslation } from '../i18n.ts';

interface InventoryProps {
  items: InventoryItem[];
  onAdd: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<InventoryItem>) => void;
  onDelete: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onAdd, onUpdate, onDelete }) => {
  const { t, lang } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<InventoryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formState, setFormState] = useState<Omit<InventoryItem, 'id' | 'createdAt'>>({
    name: '',
    brand: '',
    category: 'atomizer',
    description: '',
    price: 0,
    imageUrl: '',
    specs: {}
  });

  const CATEGORY_KEYS: Record<InventoryCategory, keyof typeof t> = {
    atomizer: 'cat_atomizer',
    wire: 'cat_wire',
    prebuilt_coil: 'cat_prebuilt_coil',
    liquid: 'cat_liquid',
    cotton: 'cat_cotton',
    tool: 'cat_tool',
    battery: 'cat_battery',
    mod: 'cat_mod',
    pod_system: 'cat_pod_system',
    pod_cartridge: 'cat_pod_cartridge',
    drip_tip: 'cat_drip_tip'
  };

  const handleEdit = (item: InventoryItem) => {
    setFormState({
      name: item.name, brand: item.brand || '', category: item.category, description: item.description || '', price: item.price || 0, imageUrl: item.imageUrl || '', specs: item.specs || {}
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormState({...formState, imageUrl: reader.result as string});
      reader.readAsDataURL(file);
    }
  };

  const updateSpec = (key: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      specs: { ...prev.specs, [key]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) { alert(t.errorRequired); return; }
    if (editingId) onUpdate(editingId, formState); else onAdd(formState);
    setEditingId(null); setShowForm(false);
    setFormState({ name: '', brand: '', category: 'atomizer', description: '', price: 0, imageUrl: '', specs: {} });
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = filter === 'all' || item.category === filter;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, filter, searchQuery]);

  return (
    <div className="p-4 space-y-6 animate-in fade-in">
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{t.inventory}</h3>
          <button onClick={() => { setShowForm(!showForm); if (!showForm) setEditingId(null); }} className={`${showForm ? 'bg-slate-800' : 'bg-blue-600'} w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90`}>
            <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'} text-lg text-white`}></i>
          </button>
        </div>
        
        <div className="relative group">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors"></i>
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchGear as string} 
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 pl-12 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200 shadow-inner" 
          />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-[3rem] border border-slate-700 space-y-6 animate-in slide-in-from-top-4 shadow-3xl relative z-20">
          <div className="flex items-center gap-4">
            <div onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer overflow-hidden group shadow-inner">
              {formState.imageUrl ? <img src={formState.imageUrl} className="w-full h-full object-cover" alt="" /> : <i className="fa-solid fa-camera text-slate-700 group-hover:text-blue-500 text-xl transition-colors"></i>}
            </div>
            <div>
              <h3 className="text-sm font-black text-blue-500 uppercase italic tracking-tighter">{editingId ? t.edit : t.addNew}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.standardFields}</p>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          
          <div className="space-y-4">
            <input required placeholder={t.model} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-4">
              <input placeholder={t.brand} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200" value={formState.brand} onChange={e => setFormState({...formState, brand: e.target.value})} />
              <input type="number" step="0.01" placeholder={t.price} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200" value={formState.price || ''} onChange={e => setFormState({...formState, price: Number(e.target.value)})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.categoryLabel}</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200 appearance-none" value={formState.category} onChange={e => setFormState({...formState, category: e.target.value as InventoryCategory})}>
                {(Object.keys(CATEGORY_KEYS) as InventoryCategory[]).map(cat => <option key={cat} value={cat}>{t[CATEGORY_KEYS[cat]] as string}</option>)}
              </select>
            </div>

            {/* Category Specific Fields */}
            <div className="bg-slate-950/40 p-5 rounded-[2.5rem] border border-slate-800/60 space-y-4">
              {formState.category === 'atomizer' && (
                <div className="grid grid-cols-2 gap-4">
                  <select className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none" value={formState.style} onChange={e => setFormState({...formState, style: e.target.value as AtomizerStyle})}>
                    <option value="MTL">MTL</option>
                    <option value="RTA">RTA</option>
                    <option value="RDA">RDA</option>
                    <option value="RDTA">RDTA</option>
                  </select>
                  <input type="number" step="0.1" placeholder={t.capacity} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none" value={formState.specs?.capacity || ''} onChange={e => updateSpec('capacity', Number(e.target.value))} />
                </div>
              )}

              {formState.category === 'liquid' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <select className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none" value={formState.specs?.liquidType} onChange={e => updateSpec('liquidType', e.target.value)}>
                      <option value="E-Juice Freebase">Freebase</option>
                      <option value="Nic Salt">Nic Salt</option>
                    </select>
                    <input type="number" placeholder={t.nicotineStrength} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none" value={formState.specs?.nicotineStrength || ''} onChange={e => updateSpec('nicotineStrength', Number(e.target.value))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder={t.flavor} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none" value={formState.specs?.flavor || ''} onChange={e => updateSpec('flavor', e.target.value)} />
                    <input placeholder={t.vg_pg} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none" value={formState.specs?.vg_pg || ''} onChange={e => updateSpec('vg_pg', e.target.value)} />
                  </div>
                </div>
              )}

              {formState.category === 'battery' && (
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder={t.cdr} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none" value={formState.specs?.cdr || ''} onChange={e => updateSpec('cdr', Number(e.target.value))} />
                  <input type="number" step="0.1" placeholder={t.capacity} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none" value={formState.specs?.capacity || ''} onChange={e => updateSpec('capacity', Number(e.target.value))} />
                </div>
              )}
              
              {formState.category === 'mod' && (
                <div className="grid grid-cols-2 gap-4">
                   <input type="number" placeholder="Max Watts" className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none" value={formState.specs?.capacity || ''} onChange={e => updateSpec('capacity', Number(e.target.value))} />
                   <select className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none" value={formState.style} onChange={e => setFormState({...formState, style: e.target.value as any})}>
                      <option value="Regulated">Regulated</option>
                      <option value="Mechanical">Mechanical</option>
                   </select>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
             <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-800 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all text-slate-300">{t.cancel}</button>
             <button type="submit" className="flex-[2] bg-blue-600 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all text-white">{editingId ? t.update : t.save}</button>
          </div>
        </form>
      )}

      <div className="relative z-10">
        <select value={filter} onChange={e => setFilter(e.target.value as any)} className="w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 text-sm text-slate-200 outline-none appearance-none font-black uppercase tracking-widest shadow-2xl transition-all hover:border-blue-500/30">
          <option value="all">{t.all}</option>
          {(Object.keys(CATEGORY_KEYS) as InventoryCategory[]).map(cat => <option key={cat} value={cat}>{t[CATEGORY_KEYS[cat]] as string}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-5 pb-32">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-slate-900/60 rounded-[3rem] p-6 border border-slate-800/40 flex items-center shadow-2xl relative overflow-hidden group hover:border-blue-500/20 transition-all">
            <div className="w-20 h-20 rounded-[1.5rem] bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner mr-6 shrink-0 group-hover:border-blue-500/30 transition-colors">
              {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" alt="" /> : <i className="fa-solid fa-box text-slate-800 text-2xl"></i>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1.5 opacity-80">{t[CATEGORY_KEYS[item.category]] as string}</div>
              <div className="font-black text-slate-100 text-xl leading-tight truncate">{item.name}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-2">
                <span className="truncate">{item.brand}</span>
                {item.price ? <span className="text-blue-500/60">• ${item.price}</span> : null}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => handleEdit(item)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-500 hover:bg-blue-500/10 transition-all"><i className="fa-solid fa-pen-to-square text-sm"></i></button>
              <button onClick={() => onDelete(item.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:text-red-500 hover:bg-red-500/10 transition-all"><i className="fa-solid fa-trash text-sm"></i></button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-32 glass rounded-[4rem] border-dashed border-2 border-slate-800/50">
            <i className="fa-solid fa-boxes-stacked text-slate-800 text-6xl mb-6 opacity-20"></i>
            <p className="text-[11px] text-slate-600 font-black uppercase tracking-[0.3em]">{t.noHistory}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
