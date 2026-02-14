
import React, { useState, useEffect, useMemo } from 'react';
import NavDrawer from './components/NavDrawer.tsx';
import Dashboard from './components/Dashboard.tsx';
import Inventory from './components/Inventory.tsx';
import CoilCalculator from './components/CoilCalculator.tsx';
import LiquidCalculator from './components/LiquidCalculator.tsx';
import ExperienceNotes from './components/ExperienceNotes.tsx';
import Settings from './components/Settings.tsx';
import WickingLog from './components/WickingLog.tsx';
import CoilList from './components/CoilList.tsx';
import History from './components/History.tsx';
import Stats from './components/Stats.tsx';
import Gallery from './components/Gallery.tsx';
import BottomNav from './components/BottomNav.tsx';
import ShopFinder from './components/ShopFinder.tsx';
import { InventoryItem, WickingHistory, CoilStats, UserExperience, Currency } from './types.ts';
import { requestNotificationPermission } from './services/notificationService.ts';
import { Language, translations, LanguageContext } from './i18n.ts';

// World Class Vaping Gear Initial Data
const INITIAL_DATA: InventoryItem[] = [
  { id: 'seed-1', name: 'Kayfun X', brand: 'SvoëMesto', category: 'atomizer', style: 'MTL', price: 110, specs: { capacity: 4 }, createdAt: Date.now() },
  { id: 'seed-2', name: 'Dani Box Mini', brand: 'Dicodes', category: 'mod', price: 290, createdAt: Date.now() },
  { id: 'seed-3', name: 'Castle Long', brand: 'Five Pawns', category: 'liquid', price: 28, specs: { liquidType: 'Nic Salt', nicotineStrength: 12, flavor: 'Bourbon/Coconut' }, createdAt: Date.now() },
  { id: 'seed-4', name: 'Lemon Tart', brand: 'Dinner Lady', category: 'liquid', price: 18, specs: { liquidType: 'E-Juice Freebase', nicotineStrength: 3, flavor: 'Lemon Meringue' }, createdAt: Date.now() },
  { id: 'seed-5', name: 'Cotton Bacon Prime', brand: 'Wick N Vape', category: 'cotton', price: 6, createdAt: Date.now() }
];

const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return (item && item !== '[]') ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const App: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('vape_lang');
    return (saved === 'en' || saved === 'fa') ? saved : 'en';
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('vape_currency');
    return (saved === 'USD' || saved === 'IRR') ? saved : 'USD';
  });
  
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const data = safeParse('vape_inventory', []);
    return data.length === 0 ? INITIAL_DATA : data;
  });

  const [wickingHistory, setWickingHistory] = useState<WickingHistory[]>(() => safeParse('vape_wicking_history', []));
  const [coils, setCoils] = useState<CoilStats[]>(() => safeParse('vape_coils', []));
  const [experiences, setExperiences] = useState<UserExperience[]>(() => safeParse('vape_experiences', []));

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    localStorage.setItem('vape_lang', lang);
    localStorage.setItem('vape_currency', currency);
    localStorage.setItem('vape_inventory', JSON.stringify(inventory));
    localStorage.setItem('vape_wicking_history', JSON.stringify(wickingHistory));
    localStorage.setItem('vape_coils', JSON.stringify(coils));
    localStorage.setItem('vape_experiences', JSON.stringify(experiences));
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, currency, inventory, wickingHistory, coils, experiences]);

  const t = useMemo(() => translations[lang] || translations.en, [lang]);

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    const newItem = { ...item, id: `inv-${Date.now()}`, createdAt: Date.now() };
    setInventory(prev => [...prev, newItem]);
    return newItem;
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item));
  };

  const archiveSetup = (id: string) => {
    setWickingHistory(prev => prev.map(h => h.id === id ? { ...h, isActive: false, status: 'archived' } : h));
  };

  const updateMl = (id: string, delta: number) => {
    setWickingHistory(prevHistory => prevHistory.map(h => {
      if (h.id === id) {
        return { ...h, mlConsumed: Math.max(0, h.mlConsumed + delta) };
      }
      return h;
    }));
  };

  const renderContent = () => {
    const commonHeader = (title: string) => (
      <header className="flex items-center gap-4 px-6 pt-8 pb-4 sticky top-0 bg-slate-950 z-40">
        <button onClick={() => setIsDrawerOpen(true)} className="w-12 h-12 glass rounded-2xl flex items-center justify-center border border-slate-800 text-slate-400 active:scale-90 transition-all"><i className="fa-solid fa-bars-staggered text-lg"></i></button>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{title}</h2>
      </header>
    );

    switch (activeRoute) {
      case 'dashboard':
        return (
          <>
            {commonHeader(t.dashboard)}
            <Dashboard 
              inventory={inventory} wickingHistory={wickingHistory} coils={coils} experiences={experiences}
              updateMl={updateMl} onRewick={() => setActiveRoute('setup')} 
              onOpenSettings={() => setActiveRoute('settings')} onNavigate={setActiveRoute} onArchive={archiveSetup}
            />
          </>
        );
      case 'inventory':
        return (
          <>
            {commonHeader(t.inventory)}
            <Inventory items={inventory} onAdd={addInventoryItem} onUpdate={updateInventoryItem} onDelete={(id) => setInventory(prev => prev.filter(i => i.id !== id))} />
          </>
        );
      case 'setup':
        return (
          <>
            {commonHeader(t.setup)}
            <div className="p-4">
              <WickingLog 
                inventory={inventory} coils={coils} history={wickingHistory} experiences={experiences} 
                onAdd={(s) => { setWickingHistory(p => [...p, s]); setActiveRoute('dashboard'); }} 
                onAddGear={addInventoryItem} onAddCoilPreset={c => setCoils(p => [...p, c])} 
              />
            </div>
          </>
        );
      case 'lab':
        return (
          <>
            {commonHeader(t.lab)}
            <div className="space-y-4 pb-24 px-4">
              <CoilCalculator onSaveToClasses={c => setCoils(prev => [...prev, c])} />
              <CoilList coils={coils} onAdd={c => setCoils(prev => [...prev, c])} onDelete={id => setCoils(prev => prev.filter(c => c.id !== id))} />
            </div>
          </>
        );
      case 'liquidLab':
        return (
          <>
            {commonHeader(t.liquidLab)}
            <LiquidCalculator onSaveToGear={addInventoryItem} />
          </>
        );
      case 'journey':
        return (
          <>
            {commonHeader(t.journey)}
            <div className="p-4"><ExperienceNotes notes={experiences} setups={wickingHistory.filter(h => h.isActive)} onAdd={n => setExperiences(prev => [...prev, n])} onDelete={id => setExperiences(prev => prev.filter(e => e.id !== id))} /></div>
          </>
        );
      case 'gallery':
        return (
          <>
            {commonHeader(t.gallery)}
            <Gallery experiences={experiences} history={wickingHistory} inventory={inventory} coils={coils} />
          </>
        );
      case 'archive':
        return (
          <>
            {commonHeader(t.archive)}
            <div className="p-4"><History history={wickingHistory} inventory={inventory} coils={coils} onDelete={id => setWickingHistory(prev => prev.filter(h => h.id !== id))} /></div>
          </>
        );
      case 'stats':
        return (
          <>
            {commonHeader(t.stats)}
            <Stats history={wickingHistory} inventory={inventory} />
          </>
        );
      case 'shopFinder':
        return (
          <>
            {commonHeader(t.shopFinder)}
            <ShopFinder />
          </>
        );
      case 'settings':
        return (
           <>
            {commonHeader(t.settings)}
            <Settings lang={lang} setLang={setLang} currency={currency} setCurrency={setCurrency} onOpenKeySelect={() => (window as any).aistudio.openSelectKey()} />
           </>
        );
      default:
        return null;
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="min-h-screen bg-slate-950 text-slate-200 transition-all duration-300">
        <NavDrawer activeRoute={activeRoute} setActiveRoute={setActiveRoute} isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />
        <main className="max-w-2xl mx-auto min-h-screen overflow-x-hidden pt-safe pb-24">{renderContent()}</main>
        <BottomNav activeTab={activeRoute} setActiveTab={setActiveRoute} />
      </div>
    </LanguageContext.Provider>
  );
};

export default App;
