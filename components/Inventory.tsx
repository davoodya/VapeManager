
import React, { useState, useRef } from 'react';
import { InventoryItem, InventoryCategory } from '../types.ts';
import { useTranslation } from '../i18n.ts';

interface InventoryProps {
  items: InventoryItem[];
  onAdd: (item: Omit<InventoryItem, 'id'>) => void;
  onDelete: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onAdd, onDelete }) => {
  const { t, lang } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<InventoryCategory | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    brand: '',
    category: 'atomizer',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1550133730-695473e51d90?q=80&w=200&auto=format&fit=crop'
  });

  const CATEGORY_KEYS: Record<InventoryCategory, keyof typeof t> = {
    atomizer: 'cat_atomizer',
    wire: 'cat_wire',
    prebuilt_coil: 'cat_prebuilt_coil',
    liquid_salt: 'cat_liquid_salt',
    liquid_ejuice: 'cat_liquid_ejuice',
    cotton: 'cat_cotton',
    tool: 'cat_tool',
    battery: 'cat_battery',
    mod: 'cat_mod',
    pod_system: 'cat_pod_system',
    pod_cartridge: 'cat_pod_cartridge'
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem({ ...newItem, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;
    onAdd(newItem);
    setNewItem({ ...newItem, name: '', brand: '', description: '', imageUrl: 'https://images.unsplash.com/photo-1550133730-695473e51d90?q=80&w=200&auto=format&fit=crop' });
    setShowForm(false);
  };

  const filteredItems = filter === 'all' ? items : items.filter(i => i.category === filter);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold text-blue-400">{t.inventory}</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
        >
          <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'} text-lg`}></i>
        </button>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar px-1">
        <button 
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${filter === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}`}
        >
          {t.all}
        </button>
        {(Object.keys(CATEGORY_KEYS) as InventoryCategory[]).map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${filter === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'}`}
          >
            {t[CATEGORY_KEYS[cat]] as string}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/90 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-700 space-y-4 animate-in slide-in-from-top-4 shadow-2xl">
          <div className="flex flex-col items-center mb-4">
            <div 
              className="w-28 h-28 rounded-[2rem] bg-slate-950 border-2 border-dashed border-slate-800 flex items-center justify-center cursor-pointer overflow-hidden relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {newItem.imageUrl ? (
                <img src={newItem.imageUrl} className="w-full h-full object-cover opacity-80" alt="Preview" />
              ) : (
                <i className="fa-solid fa-camera text-3xl text-slate-800"></i>
              )}
              <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <i className="fa-solid fa-upload text-white text-xl"></i>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            <span className="text-[10px] text-slate-600 font-black uppercase mt-3 tracking-widest">{t.name}</span>
          </div>

          <div className="space-y-4">
            <input 
              required
              placeholder={t.name}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
              value={newItem.name}
              onChange={e => setNewItem({...newItem, name: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <input 
                placeholder={t.brand}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                value={newItem.brand}
                onChange={e => setNewItem({...newItem, brand: e.target.value})}
              />
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                value={newItem.category}
                onChange={e => setNewItem({...newItem, category: e.target.value as InventoryCategory})}
              >
                {(Object.keys(CATEGORY_KEYS) as InventoryCategory[]).map(cat => (
                  <option key={cat} value={cat}>{t[CATEGORY_KEYS[cat]] as string}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl active:scale-95 text-sm">
            {t.save}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-slate-900/40 backdrop-blur-sm rounded-[2.5rem] p-5 border border-slate-800/60 flex items-center group hover:border-slate-700 transition-all shadow-lg overflow-hidden relative">
            <img src={item.imageUrl} className="w-20 h-20 rounded-[1.5rem] object-cover bg-slate-950 mr-5 shadow-2xl relative z-10" alt="" />
            <div className="flex-1 relative z-10">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                {t[CATEGORY_KEYS[item.category]] as string}
              </div>
              <div className="font-black text-slate-100 text-lg leading-tight tracking-tight">{item.name}</div>
              <div className="text-xs text-slate-600 font-bold uppercase mt-1 tracking-tighter">{item.brand || 'Universal'}</div>
            </div>
            <button onClick={() => onDelete(item.id)} className="text-slate-700 hover:text-red-500 p-3 transition-colors relative z-10">
              <i className="fa-solid fa-trash-can text-lg"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
