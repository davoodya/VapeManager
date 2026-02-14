
import React, { useState } from 'react';
import { CLOUD_STORAGE_PROVIDERS } from '../constants';
import { Language, useTranslation } from '../i18n';
import { Currency } from '../types.ts';

interface SettingsProps {
  lang: Language;
  setLang: (l: Language) => void;
  onOpenKeySelect: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

const Settings: React.FC<SettingsProps> = ({ lang, setLang, onOpenKeySelect, currency, setCurrency }) => {
  const { t } = useTranslation();

  const handleExport = () => {
    const data = {
      inventory: JSON.parse(localStorage.getItem('vape_inventory') || '[]'),
      wickingHistory: JSON.parse(localStorage.getItem('vape_wicking_history') || '[]'),
      coils: JSON.parse(localStorage.getItem('vape_coils') || '[]'),
      experiences: JSON.parse(localStorage.getItem('vape_experiences') || '[]'),
      preferences: { lang, currency },
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vape_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 pb-32 animate-in slide-in-from-right-4">
      <header className="mt-4 px-2">
        <h2 className="text-3xl font-black text-blue-400 uppercase tracking-tight italic">PREFERENCES</h2>
      </header>
      
      <div className="bg-slate-800/80 rounded-[3rem] p-8 border border-slate-700 shadow-3xl space-y-8 backdrop-blur-xl">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-1">App Configuration</h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center bg-slate-950/40 p-6 rounded-[2rem] border border-slate-800">
                <span className="text-sm font-bold text-slate-300">{t.language}</span>
                <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="bg-transparent text-sm text-blue-500 font-black uppercase outline-none cursor-pointer">
                  <option value="en">English</option>
                  <option value="fa">Farsi (فارسی)</option>
                </select>
             </div>
             <div className="flex justify-between items-center bg-slate-950/40 p-6 rounded-[2rem] border border-slate-800">
                <span className="text-sm font-bold text-slate-300">{t.currency}</span>
                <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="bg-transparent text-sm text-blue-500 font-black uppercase outline-none cursor-pointer">
                  <option value="USD">USD ($)</option>
                  <option value="IRR">Toman (IRR)</option>
                </select>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-1">Storage & Backup</h3>
          <div className="grid grid-cols-2 gap-4">
             <button onClick={handleExport} className="bg-blue-600/10 border border-blue-500/20 text-blue-400 p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95">
               <i className="fa-solid fa-file-export block text-xl mb-3"></i>{t.exportDb}
             </button>
             <button className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95">
               <i className="fa-solid fa-file-import block text-xl mb-3"></i>{t.importDb}
             </button>
          </div>
        </div>

        <button onClick={() => { if(confirm('Factory reset will erase all local databases. Proceed?')) { localStorage.clear(); window.location.reload(); }}} className="w-full bg-red-500/10 text-red-500 p-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest border border-red-500/20 transition-all hover:bg-red-500 hover:text-white active:scale-95">
          {t.factoryReset}
        </button>
      </div>
      
      <div className="text-center opacity-30 mt-10">
        <div className="text-[10px] font-black text-slate-600 uppercase">Pro Release v2.2.0</div>
        <div className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.3em]">Clean Architecture Engine</div>
      </div>
    </div>
  );
};

export default Settings;
