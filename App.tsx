
import React, { useState, useEffect, useMemo } from 'react';
import BottomNav from './components/BottomNav.tsx';
import Dashboard from './components/Dashboard.tsx';
import Inventory from './components/Inventory.tsx';
import CoilCalculator from './components/CoilCalculator.tsx';
import ExperienceNotes from './components/ExperienceNotes.tsx';
import Settings from './components/Settings.tsx';
import WickingLog from './components/WickingLog.tsx';
import CoilList from './components/CoilList.tsx';
import History from './components/History.tsx';
import Stats from './components/Stats.tsx';
import Gallery from './components/Gallery.tsx';
import { InventoryItem, WickingHistory, CoilStats, UserExperience } from './types.ts';
import { requestNotificationPermission, sendWickAlert } from './services/notificationService.ts';
import { Language, translations, LanguageContext } from './i18n.ts';

const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error parsing ${key} from localStorage`, e);
    return fallback;
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('vape_lang');
    return (saved === 'en' || saved === 'fa') ? saved : 'en';
  });
  
  const [inventory, setInventory] = useState<InventoryItem[]>(() => safeParse('vape_inventory', []));
  const [wickingHistory, setWickingHistory] = useState<WickingHistory[]>(() => safeParse('vape_wicking_history', []));
  const [coils, setCoils] = useState<CoilStats[]>(() => safeParse('vape_coils', []));
  const [experiences, setExperiences] = useState<UserExperience[]>(() => safeParse('vape_experiences', []));

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    localStorage.setItem('vape_lang', lang);
    localStorage.setItem('vape_inventory', JSON.stringify(inventory));
    localStorage.setItem('vape_wicking_history', JSON.stringify(wickingHistory));
    localStorage.setItem('vape_coils', JSON.stringify(coils));
    localStorage.setItem('vape_experiences', JSON.stringify(experiences));
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, inventory, wickingHistory, coils, experiences]);

  const t = useMemo(() => translations[lang] || translations.en, [lang]);

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    setInventory(prev => [...prev, { ...item, id: `inv-${Date.now()}` }]);
  };

  const addCoilClass = (coil: CoilStats) => {
    setCoils(prev => [...prev, coil]);
  };

  const addWickingSession = (session: WickingHistory) => {
    setWickingHistory(prev => {
      const updated = prev.map(h => 
        h.atomizerId === session.atomizerId ? { ...h, isActive: false } : h
      );
      return [...updated, session];
    });
    
    if (session.coilId) {
        setCoils(prev => prev.map(c => 
            c.id === session.coilId ? { ...c, usageCount: (c.usageCount || 0) + 1 } : c
        ));
    }
    setActiveTab('dashboard');
  };

  const updateMl = (id: string, delta: number) => {
    setWickingHistory(prevHistory => {
      return prevHistory.map(h => {
        if (h.id === id) {
          const newMl = Math.max(0, h.mlConsumed + delta);
          if (newMl >= h.maxWickLife && h.mlConsumed < h.maxWickLife) {
            const atty = inventory.find(i => i.id === h.atomizerId);
            sendWickAlert(atty?.name || 'Device');
          }
          return { ...h, mlConsumed: newMl };
        }
        return h;
      });
    });
  };

  const onRewick = (historyId: string) => {
    setActiveTab('wicking');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          inventory={inventory} 
          wickingHistory={wickingHistory} 
          coils={coils} 
          updateMl={updateMl} 
          onRewick={onRewick}
          onOpenSettings={() => setActiveTab('settings')}
        />;
      case 'inventory':
        return (
          <div className="space-y-8 pb-32">
            <Inventory items={inventory} onAdd={addInventoryItem} onDelete={(id) => setInventory(prev => prev.filter(i => i.id !== id))} />
            <CoilList coils={coils} onAdd={addCoilClass} onDelete={(id) => setCoils(prev => prev.filter(c => c.id !== id))} />
            <div className="p-4"><CoilCalculator onSaveToClasses={addCoilClass} /></div>
          </div>
        );
      case 'stats':
        return <Stats history={wickingHistory} coils={coils} inventory={inventory} />;
      case 'gallery':
        return <Gallery experiences={experiences} />;
      case 'wicking':
        return <WickingLog inventory={inventory} coils={coils} history={wickingHistory} experiences={experiences} onAdd={addWickingSession} />;
      case 'experience':
        return <ExperienceNotes notes={experiences} onAdd={(n) => setExperiences(prev => [...prev, n])} />;
      case 'history':
        return <History history={wickingHistory} inventory={inventory} coils={coils} />;
      case 'settings':
        return <Settings lang={lang} setLang={setLang} />;
      default:
        return <Dashboard inventory={inventory} wickingHistory={wickingHistory} coils={coils} updateMl={updateMl} onRewick={onRewick} onOpenSettings={() => setActiveTab('settings')} />;
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className={`min-h-screen bg-slate-950 text-slate-200 transition-all duration-300 font-sans`}>
        <main className="max-w-2xl mx-auto min-h-screen overflow-x-hidden pt-safe">
          {renderContent()}
        </main>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </LanguageContext.Provider>
  );
};

export default App;
