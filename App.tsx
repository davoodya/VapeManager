
import React, { useState, useEffect, useMemo } from 'react';
import NavDrawer from './components/NavDrawer.tsx';
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
import { InventoryItem, WickingHistory, CoilStats, UserExperience, InventoryCategory, WireMaterial } from './types.ts';
import { requestNotificationPermission, sendWickAlert } from './services/notificationService.ts';
import { Language, translations, LanguageContext } from './i18n.ts';

// Premium Global Seed Data
const SEED_INVENTORY: InventoryItem[] = [
  // Existing Data
  { id: 'inv-1', name: 'Kayfun X', brand: 'SvoëMesto', category: 'atomizer', style: 'MTL', price: 119.95, imageUrl: 'https://images.unsplash.com/photo-1550133730-695473e51d90?q=80&w=400&auto=format&fit=crop', createdAt: Date.now() - 86400000 * 10 },
  { id: 'inv-2', name: 'Centaurus M200', brand: 'Lost Vape', category: 'mod', price: 64.99, imageUrl: 'https://images.unsplash.com/photo-1574044536226-f56740f6312d?q=80&w=400&auto=format&fit=crop', createdAt: Date.now() - 86400000 * 10 },
  { id: 'inv-3', name: 'Castle Long', brand: 'Five Pawns', category: 'liquid', price: 24.50, specs: { liquidType: 'Nic Salt', nicotineStrength: 12, flavorCategory: 'Tobacco', flavor: 'Bourbon & Coconut', bottleSize: '30' }, imageUrl: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=400&auto=format&fit=crop', createdAt: Date.now() - 86400000 * 10 },
  { id: 'inv-4', name: 'Cotton Bacon Prime', brand: 'Wick \'N\' Vape', category: 'cotton', price: 6.00, specs: { innerDiameter: 3.0 }, imageUrl: 'https://images.unsplash.com/photo-1589112945239-2d174665a3d7?q=80&w=400&auto=format&fit=crop', createdAt: Date.now() - 86400000 * 10 },
  
  // New Premium Gears (Triple Data Task)
  { id: 'inv-6', name: 'Dani SBS', brand: 'Dicodes', category: 'mod', price: 299.00, imageUrl: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=400&auto=format&fit=crop', createdAt: Date.now() - 86400000 * 5 },
  { id: 'inv-7', name: 'Pioneer V1.5', brand: 'BP Mods', category: 'atomizer', style: 'MTL', price: 54.99, imageUrl: 'https://images.unsplash.com/photo-1550133730-695473e51d90?q=80&w=400&auto=format&fit=crop', createdAt: Date.now() - 86400000 * 4 },
  { id: 'inv-8', name: 'Stubby AIO', brand: 'Suicide Mods', category: 'mod', price: 159.00, imageUrl: 'https://images.unsplash.com/photo-1574044536226-f56740f6312d?q=80&w=400&auto=format&fit=crop', createdAt: Date.now() - 86400000 * 3 },
  { id: 'inv-9', name: 'Fat Rabbit V2', brand: 'Hellvape', category: 'atomizer', style: 'RTA', price: 34.99, imageUrl: 'https://images.unsplash.com/photo-1550133730-695473e51d90?q=80&w=400&auto=format&fit=crop', createdAt: Date.now() - 86400000 * 2 },
  { id: 'inv-10', name: 'Slow Blow', brand: 'Nasty Juice', category: 'liquid', price: 18.00, specs: { liquidType: 'E-Juice Freebase', nicotineStrength: 3, flavorCategory: 'ICE-Menthol Fruits', flavor: 'Pineapple Lemonade', bottleSize: '60' }, imageUrl: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=400&auto=format&fit=crop', createdAt: Date.now() - 86400000 * 8 },
  { id: 'inv-11', name: 'Lemon Tart', brand: 'Dinner Lady', category: 'liquid', price: 19.50, specs: { liquidType: 'E-Juice Freebase', nicotineStrength: 6, flavorCategory: 'Desert', flavor: 'Zesty Lemon Curd', bottleSize: '60' }, imageUrl: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=400&auto=format&fit=crop', createdAt: Date.now() - 86400000 * 7 },
  { id: 'inv-12', name: 'Tribeca', brand: 'Halo', category: 'liquid', price: 15.00, specs: { liquidType: 'E-Juice Freebase', nicotineStrength: 12, flavorCategory: 'Tobacco', flavor: 'Smooth RY4', bottleSize: '30' }, imageUrl: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=400&auto=format&fit=crop', createdAt: Date.now() - 86400000 * 6 },
  { id: 'inv-13', name: 'Super Mesh Coils', brand: 'GeekVape', category: 'prebuilt_coil', price: 12.00, createdAt: Date.now() - 86400000 * 1 },
  { id: 'inv-14', name: '18650 P28A', brand: 'Molicel', category: 'battery', price: 9.00, createdAt: Date.now() - 86400000 * 12 },
];

const SEED_COILS: CoilStats[] = [
  { id: 'preset-1', name: 'MTL Fused Clapton', resistance: 0.75, material: WireMaterial.NICHROME_80, gauge: '2x30/40ga', wraps: 6, innerDiameter: 2.5, type: 'Contact', images: [], createdAt: Date.now() - 86400000 * 10, liquidConsumed: 12.5, usageCount: 5 },
  { id: 'preset-2', name: 'Alien V2 (DL)', resistance: 0.15, material: WireMaterial.SS316L, gauge: '3x28/36ga', wraps: 5, innerDiameter: 3.0, type: 'Contact', images: [], createdAt: Date.now() - 86400000 * 5, liquidConsumed: 45, usageCount: 8 },
  { id: 'preset-3', name: 'Ni80 Round MTL', resistance: 1.15, material: WireMaterial.NICHROME_80, gauge: 28, wraps: 7, innerDiameter: 2.5, type: 'Spaced', images: [], createdAt: Date.now() - 86400000 * 3, liquidConsumed: 5, usageCount: 2 },
];

const SEED_SETUPS: WickingHistory[] = [
  { id: 'setup-1', atomizerId: 'inv-1', vapingStyle: 'MTL', coilId: 'preset-1', cottonId: 'inv-4', liquidId: 'inv-3', wattage: 14.5, airflow: { afcEnabled: true, holesNumber: 1, insertEnabled: false }, coilHeightMm: 1.5, dripTip: 'Medium', mlConsumed: 4.2, maxWickLife: 10, notes: 'Kayfun X setup with Five Pawns. Exceptional throat hit.', degradationScore: 0, status: 'active', date: Date.now() - 86400000 * 2, isActive: true },
  { id: 'setup-2', atomizerId: 'inv-7', vapingStyle: 'MTL', coilId: 'preset-3', cottonId: 'inv-4', liquidId: 'inv-11', wattage: 12.0, airflow: { afcEnabled: false, insertEnabled: true, insertSize: 1.0 }, coilHeightMm: 1.2, dripTip: 'Long', mlConsumed: 1.5, maxWickLife: 8, notes: 'Pioneer V1.5 testing Dinner Lady.', degradationScore: 0, status: 'active', date: Date.now() - 86400000 * 1, isActive: true },
];

const SEED_EXPERIENCES: UserExperience[] = [
  { id: 'exp-1', topic: 'Kayfun X Feedback', content: 'Precise airflow. Liquid saturation on Nic Salts is perfect.', setupIds: ['setup-1'], rating: 9, imageUrl: 'https://images.unsplash.com/photo-1550133730-695473e51d90?q=80&w=400&auto=format&fit=crop', aiAnalysis: 'VG/PG ratio ensures efficient wicking.', date: Date.now() - 86400000 * 1 },
];

const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return (item && item !== '[]') ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error parsing ${key} from localStorage`, e);
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
  
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const data = safeParse('vape_inventory', []);
    return data.length === 0 ? SEED_INVENTORY : data;
  });

  const [wickingHistory, setWickingHistory] = useState<WickingHistory[]>(() => {
    const data = safeParse('vape_wicking_history', []);
    return data.length === 0 ? SEED_SETUPS : data;
  });

  const [coils, setCoils] = useState<CoilStats[]>(() => {
    const data = safeParse('vape_coils', []);
    return data.length === 0 ? SEED_COILS : data;
  });

  const [experiences, setExperiences] = useState<UserExperience[]>(() => {
    const data = safeParse('vape_experiences', []);
    return data.length === 0 ? SEED_EXPERIENCES : data;
  });

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

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    const newItem = { ...item, id: `inv-${Date.now()}`, createdAt: Date.now() };
    setInventory(prev => [...prev, newItem]);
    return newItem;
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item));
  };

  const addCoilClass = (coil: CoilStats) => {
    setCoils(prev => [...prev, coil]);
  };

  const addWickingSession = (session: WickingHistory) => {
    setWickingHistory(prev => {
      const updated = prev.map(h => 
        h.atomizerId === session.atomizerId ? { ...h, isActive: false, status: 'archived' } : h
      );
      return [...updated, session];
    });
    setActiveRoute('dashboard');
  };

  const updateMl = (id: string, delta: number) => {
    setWickingHistory(prevHistory => prevHistory.map(h => {
      if (h.id === id) {
        const newMl = Math.max(0, h.mlConsumed + delta);
        if (newMl >= h.maxWickLife && h.mlConsumed < h.maxWickLife) {
          const atty = inventory.find(i => i.id === h.atomizerId);
          sendWickAlert(atty?.name || 'Device');
        }
        return { ...h, mlConsumed: newMl };
      }
      return h;
    }));
  };

  const renderContent = () => {
    const commonHeader = (title: string) => (
      <header className="flex items-center gap-4 px-6 pt-8 pb-4 sticky top-0 bg-slate-950 z-40">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="w-12 h-12 glass rounded-2xl flex items-center justify-center border border-slate-800 text-slate-400 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-bars-staggered text-lg"></i>
        </button>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{title}</h2>
      </header>
    );

    switch (activeRoute) {
      case 'dashboard':
        return (
          <>
            {commonHeader(t.dashboard)}
            <Dashboard 
              inventory={inventory} 
              wickingHistory={wickingHistory} 
              coils={coils} 
              updateMl={updateMl} 
              onRewick={() => setActiveRoute('setup')}
              onOpenSettings={() => setActiveRoute('settings')}
            />
          </>
        );
      case 'inventory':
        return (
          <>
            {commonHeader(t.inventory)}
            <Inventory 
              items={inventory} 
              onAdd={addInventoryItem} 
              onUpdate={updateInventoryItem}
              onDelete={(id) => setInventory(prev => prev.filter(i => i.id !== id))} 
            />
          </>
        );
      case 'setup':
        return (
          <>
            {commonHeader(t.setup)}
            <div className="p-4">
              <WickingLog 
                inventory={inventory} 
                coils={coils} 
                history={wickingHistory} 
                experiences={experiences} 
                onAdd={addWickingSession}
                onAddGear={(item) => addInventoryItem(item)}
                onAddCoilPreset={addCoilClass}
              />
            </div>
          </>
        );
      case 'lab':
        return (
          <>
            {commonHeader(t.lab)}
            <div className="space-y-4 pb-20">
              <CoilCalculator onSaveToClasses={addCoilClass} />
              <CoilList coils={coils} onAdd={addCoilClass} onDelete={(id) => setCoils(prev => prev.filter(c => c.id !== id))} />
            </div>
          </>
        );
      case 'stats':
        return (
          <>
            {commonHeader(t.stats)}
            <Stats history={wickingHistory} coils={coils} inventory={inventory} />
          </>
        );
      case 'journey':
        return (
          <>
            {commonHeader(t.journey)}
            <div className="p-4 pb-20">
              <ExperienceNotes 
                notes={experiences} 
                setups={wickingHistory.filter(h => h.isActive)}
                onAdd={(n) => setExperiences(prev => [...prev, n])} 
              />
            </div>
          </>
        );
      case 'gallery':
        return (
          <>
            {commonHeader(t.gallery)}
            <Gallery experiences={experiences} history={wickingHistory} inventory={inventory} />
          </>
        );
      case 'archive':
        return (
          <>
            {commonHeader(t.archive)}
            <div className="p-4 pb-20">
              <History history={wickingHistory} inventory={inventory} coils={coils} />
            </div>
          </>
        );
      case 'settings':
        return (
           <>
            {commonHeader(t.settings)}
            <Settings lang={lang} setLang={setLang} />
           </>
        );
      default:
        return null;
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="min-h-screen bg-slate-950 text-slate-200 transition-all duration-300">
        <NavDrawer 
          activeRoute={activeRoute} 
          setActiveRoute={setActiveRoute} 
          isOpen={isDrawerOpen} 
          setIsOpen={setIsDrawerOpen} 
        />
        <main className="max-w-2xl mx-auto min-h-screen overflow-x-hidden pt-safe pb-10">
          {renderContent()}
        </main>
      </div>
    </LanguageContext.Provider>
  );
};

export default App;
