
import React, { useState } from 'react';
import { CLOUD_STORAGE_PROVIDERS } from '../constants';
import { Language, useTranslation } from '../i18n';

interface SettingsProps {
  lang: Language;
  setLang: (l: Language) => void;
}

const Settings: React.FC<SettingsProps> = ({ lang, setLang }) => {
  const { t } = useTranslation();
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleExport = () => {
    const data = {
      inventory: JSON.parse(localStorage.getItem('vape_inventory') || '[]'),
      wickingHistory: JSON.parse(localStorage.getItem('vape_wicking_history') || '[]'),
      coils: JSON.parse(localStorage.getItem('vape_coils') || '[]'),
      experiences: JSON.parse(localStorage.getItem('vape_experiences') || '[]'),
      exportDate: new Date().toISOString(),
      version: "1.2.0"
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vape_mgmt_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCloudConnect = (name: string) => {
    setSyncing(name);
    setTimeout(() => {
      setSyncing(null);
      alert(`${name} Sync logic initialized. Manual backup is currently recommended.`);
    }, 2000);
  };

  return (
    <div className="p-4 space-y-6 pb-32 animate-in slide-in-from-right-4">
      <header className="mt-4 px-2">
        <h2 className="text-2xl font-black text-blue-400 uppercase tracking-tight">{t.settingsTitle}</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Architecture & Localization</p>
      </header>
      
      <div className="bg-slate-800/80 rounded-[2.5rem] p-6 border border-slate-700 shadow-2xl space-y-8 backdrop-blur-sm">
        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex justify-between px-1">
            <span>Cloud Integrations</span>
            <span className="text-blue-500">API READY</span>
          </h3>
          <div className="space-y-3">
            {CLOUD_STORAGE_PROVIDERS.map(p => (
              <button 
                key={p.name} 
                onClick={() => handleCloudConnect(p.name)}
                disabled={syncing !== null}
                className="w-full bg-slate-900/50 p-4 rounded-2xl flex items-center justify-between border border-slate-800 group hover:border-blue-500/50 transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <i className={`fa-brands ${p.icon} text-xl text-slate-400 group-hover:text-blue-500`}></i>
                  <span className="font-bold text-slate-300">{p.name}</span>
                </div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  {syncing === p.name ? 'Connecting...' : 'Link Account'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Data Management</h3>
          <div className="grid grid-cols-2 gap-4">
             <button 
                onClick={handleExport}
                className="bg-blue-600/10 border border-blue-500/20 text-blue-400 p-5 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex flex-col items-center group shadow-lg"
             >
                <i className="fa-solid fa-file-export block text-2xl mb-3 group-hover:animate-bounce"></i>
                {t.exportDb}
             </button>
             <button 
                className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 p-5 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex flex-col items-center group shadow-lg"
             >
                <i className="fa-solid fa-file-import block text-2xl mb-3 group-hover:animate-bounce"></i>
                {t.importDb}
             </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-700/50">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Localization</h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center bg-slate-950/40 p-5 rounded-3xl border border-slate-800">
                <span className="text-sm font-bold text-slate-300">{t.language}</span>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value as Language)}
                  className="bg-transparent text-sm text-blue-500 font-black uppercase outline-none text-right cursor-pointer"
                >
                  <option value="en" className="bg-slate-900">English</option>
                  <option value="fa" className="bg-slate-900">Farsi (فارسی)</option>
                </select>
             </div>
             <div className="flex justify-between items-center bg-slate-950/40 p-5 rounded-3xl border border-slate-800">
                <span className="text-sm font-bold text-slate-300">Measurements</span>
                <span className="text-xs text-blue-500 font-black uppercase tracking-tighter">ML / AWG / OHM / MM</span>
             </div>
          </div>
        </div>

        <button 
          onClick={() => { if(confirm('Factory reset will erase all local databases. Proceed?')) { localStorage.clear(); window.location.reload(); }}}
          className="w-full bg-red-500/10 text-red-500 p-5 rounded-3xl font-black uppercase text-xs tracking-widest border border-red-500/20 active:scale-95 transition-transform mt-4 shadow-lg shadow-red-900/10"
        >
          {t.factoryReset}
        </button>
      </div>

      <div className="text-center space-y-1 py-4">
        <div className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.4em]">
          Vape Management Pro v1.2.5 • Final Release
        </div>
        <div className="text-[9px] text-slate-800 font-medium uppercase tracking-widest">Built for Vapers, by Vapers</div>
      </div>
    </div>
  );
};

export default Settings;
