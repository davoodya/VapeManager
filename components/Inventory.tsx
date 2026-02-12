
import React, { useState, useRef } from 'react';
import { InventoryItem, InventoryCategory, LiquidType, FlavorCategory } from '../types.ts';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formState, setFormState] = useState<Omit<InventoryItem, 'id' | 'createdAt'>>({
    name: '',
    brand: '',
    category: 'atomizer',
    description: '',
    price: 0,
    imageUrl: 'https://images.unsplash.com/photo-1550133730-695473e51d90?q=80&w=200&auto=format&fit=crop',
    specs: {
      liquidType: 'E-Juice Freebase',
      nicotineStrength: 0,
      flavorCategory: 'Fruit',
      flavor: '',
      bottleSize: '60'
    }
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

  const FLAVOR_CATEGORIES: FlavorCategory[] = [
    'Fruit', 'Desert', 'Tobacco', 'Desert Tobacco', 'NET-Naturally Extracted Tobacco', 
    'ICE-Menthol Fruits', 'ICE-Menthol Other', 'Custom'
  ];

  const BOTTLE_SIZES = ['10', '30', '60', '100', '120', 'Other'];
  const DRIP_TIP_SIZES = ['Short', 'Medium', 'Long', 'Very Long'];
  const DRIP_TIP_MATERIALS = ['Compressed Plastic', 'Steel', 'Ultem', 'Other'];
  const DRIP_TIP_MATERIALS_FA = ['پلاستیک فشرده', 'استیل', 'Ultem', 'Other'];

  const handleEdit = (item: InventoryItem) => {
    setFormState({
      name: item.name,
      brand: item.brand || '',
      category: item.category,
      description: item.description || '',
      price: item.price || 0,
      imageUrl: item.imageUrl || '',
      specs: item.specs || { 
        liquidType: 'E-Juice Freebase', 
        nicotineStrength: 0, 
        flavorCategory: 'Fruit',
        flavor: '',
        bottleSize: '60'
      }
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setFormState({
      name: '',
      brand: '',
      category: 'atomizer',
      description: '',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1550133730-695473e51d90?q=80&w=200&auto=format&fit=crop',
      specs: { 
        liquidType: 'E-Juice Freebase', 
        nicotineStrength: 0,
        flavorCategory: 'Fruit',
        flavor: '',
        bottleSize: '60'
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormState({...formState, imageUrl: reader.result as string});
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      alert(t.errorRequired);
      return;
    }

    if (editingId) {
      onUpdate(editingId, formState);
      setEditingId(null);
    } else {
      onAdd(formState);
    }

    handleCancel();
  };

  const filteredItems = filter === 'all' ? items : items.filter(i => i.category === filter);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{t.filterByCategory}</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`${showForm ? 'bg-slate-800' : 'bg-blue-600'} w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90`}
        >
          <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'} text-sm`}></i>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 p-7 rounded-[3rem] border border-slate-700 space-y-6 animate-in slide-in-from-top-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer overflow-hidden group"
            >
              {formState.imageUrl ? (
                <img src={formState.imageUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <i className="fa-solid fa-camera text-slate-700 group-hover:text-blue-500"></i>
              )}
            </div>
            <h3 className="text-sm font-black text-blue-500 uppercase italic tracking-tighter">{editingId ? t.edit : t.addNew}</h3>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.standardFields}</label>
              <input 
                required placeholder={t.model}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200"
                value={formState.name}
                onChange={e => setFormState({...formState, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder={t.brand}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200"
                  value={formState.brand}
                  onChange={e => setFormState({...formState, brand: e.target.value})}
                />
                <input 
                  type="number" step="0.01" placeholder={t.price}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200"
                  value={formState.price || ''}
                  onChange={e => setFormState({...formState, price: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.filterByCategory}</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-200 appearance-none"
                value={formState.category}
                onChange={e => setFormState({...formState, category: e.target.value as InventoryCategory})}
              >
                {(Object.keys(CATEGORY_KEYS) as InventoryCategory[]).map(cat => (
                  <option key={cat} value={cat}>{t[CATEGORY_KEYS[cat]] as string}</option>
                ))}
              </select>
            </div>

            {formState.category === 'drip_tip' && (
              <div className="space-y-4 p-5 bg-slate-950 rounded-3xl border border-slate-800 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2">Drip Tip Specs</label>
                <div className="space-y-3">
                   <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-600 uppercase ml-1">{t.size}</span>
                      <select 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                        value={formState.specs?.dripTipSize}
                        onChange={e => setFormState({...formState, specs: {...formState.specs, dripTipSize: e.target.value as any}})}
                      >
                        {DRIP_TIP_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-600 uppercase ml-1">{t.material}</span>
                      <select 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                        value={formState.specs?.material}
                        onChange={e => setFormState({...formState, specs: {...formState.specs, material: e.target.value as any}})}
                      >
                        {(lang === 'fa' ? DRIP_TIP_MATERIALS_FA : DRIP_TIP_MATERIALS).map((m, idx) => (
                           <option key={m} value={DRIP_TIP_MATERIALS[idx]}>{m}</option>
                        ))}
                      </select>
                   </div>
                   {formState.specs?.material === 'Other' && (
                     <input 
                       placeholder={t.customMaterial}
                       className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none animate-in slide-in-from-top-1"
                       value={formState.specs?.customMaterial || ''}
                       onChange={e => setFormState({...formState, specs: {...formState.specs, customMaterial: e.target.value}})}
                     />
                   )}
                   <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-600 uppercase ml-1">{t.innerDiameter}</span>
                      <input 
                        placeholder="e.g. 1.0mm"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                        value={formState.specs?.innerDiameter || ''}
                        onChange={e => setFormState({...formState, specs: {...formState.specs, innerDiameter: e.target.value}})}
                      />
                   </div>
                </div>
              </div>
            )}

            {formState.category === 'liquid' && (
              <div className="space-y-6 p-5 bg-slate-950 rounded-3xl border border-slate-800">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2">{t.liquidSpecs}</label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-600 uppercase ml-1">{t.liquidType}</span>
                    <select 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                      value={formState.specs?.liquidType}
                      onChange={e => setFormState({...formState, specs: {...formState.specs, liquidType: e.target.value as LiquidType}})}
                    >
                      <option value="Nic Salt">Nic Salt</option>
                      <option value="E-Juice Freebase">E-Juice Freebase</option>
                      <option value="Shortfill">Shortfill</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-600 uppercase ml-1">{t.nicotineStrength}</span>
                    <input 
                      type="number" min="0"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                      value={formState.specs?.nicotineStrength || ''}
                      onChange={e => setFormState({...formState, specs: {...formState.specs, nicotineStrength: Number(e.target.value)}})}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-600 uppercase ml-1">{t.flavorCategory}</span>
                    <select 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                      value={formState.specs?.flavorCategory}
                      onChange={e => setFormState({...formState, specs: {...formState.specs, flavorCategory: e.target.value as FlavorCategory}})}
                    >
                      {FLAVOR_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  {formState.specs?.flavorCategory === 'Custom' && (
                    <input 
                      placeholder={t.customCategory}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none animate-in slide-in-from-top-2"
                      value={formState.specs?.customFlavorCategory || ''}
                      onChange={e => setFormState({...formState, specs: {...formState.specs, customFlavorCategory: e.target.value}})}
                    />
                  )}

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-600 uppercase ml-1">{t.flavor}</span>
                    <input 
                      placeholder={t.flavor}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                      value={formState.specs?.flavor || ''}
                      onChange={e => setFormState({...formState, specs: {...formState.specs, flavor: e.target.value}})}
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-600 uppercase ml-1">{t.bottleSize}</span>
                    <select 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none"
                      value={formState.specs?.bottleSize}
                      onChange={e => setFormState({...formState, specs: {...formState.specs, bottleSize: e.target.value}})}
                    >
                      {BOTTLE_SIZES.map(size => <option key={size} value={size}>{size === 'Other' ? size : `${size}ml`}</option>)}
                    </select>
                  </div>
                  {formState.specs?.bottleSize === 'Other' && (
                    <input 
                      placeholder={t.customSize}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none animate-in slide-in-from-top-2"
                      value={formState.specs?.customBottleSize || ''}
                      onChange={e => setFormState({...formState, specs: {...formState.specs, customBottleSize: e.target.value}})}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
             <button type="button" onClick={handleCancel} className="flex-1 bg-slate-800 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
               {t.cancel}
             </button>
             <button type="submit" className="flex-[2] bg-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all text-xs">
               {editingId ? t.update : t.save}
             </button>
          </div>
        </form>
      )}

      <div className="relative">
        <select 
          value={filter} 
          onChange={e => setFilter(e.target.value as any)}
          className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 text-sm text-slate-200 outline-none appearance-none font-black uppercase tracking-widest shadow-lg"
        >
          <option value="all">{t.all}</option>
          {(Object.keys(CATEGORY_KEYS) as InventoryCategory[]).map(cat => (
            <option key={cat} value={cat}>{t[CATEGORY_KEYS[cat]] as string}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-slate-900/50 rounded-[2.5rem] p-6 border border-slate-800/40 flex items-center shadow-xl">
            <img src={item.imageUrl} className="w-16 h-16 rounded-2xl object-cover bg-slate-950 mr-5" alt="" />
            <div className="flex-1">
              <div className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">
                {t[CATEGORY_KEYS[item.category]] as string} {item.specs?.liquidType ? `• ${item.specs.liquidType}` : ''}
              </div>
              <div className="font-black text-slate-100 text-lg leading-tight">{item.name}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                {item.brand} {item.price ? `• $${item.price}` : ''}
                {item.specs?.nicotineStrength ? ` • ${item.specs.nicotineStrength}mg` : ''}
                {item.specs?.flavor ? ` • ${item.specs.flavor}` : ''}
                {item.category === 'drip_tip' && item.specs?.material ? ` • ${item.specs.material}` : ''}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleEdit(item)} className="text-slate-600 hover:text-blue-500 p-2"><i className="fa-solid fa-pen"></i></button>
              <button onClick={() => onDelete(item.id)} className="text-slate-800 hover:text-red-500 p-2"><i className="fa-solid fa-trash"></i></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
