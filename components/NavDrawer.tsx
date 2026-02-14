
import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../i18n.ts';

interface NavDrawerProps {
  activeRoute: string;
  setActiveRoute: (route: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const NavDrawer: React.FC<NavDrawerProps> = ({ activeRoute, setActiveRoute, isOpen, setIsOpen }) => {
  const { t, lang } = useTranslation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'fa';

  const menuItems = [
    { id: 'dashboard', icon: 'fa-house', label: t.dashboard },
    { id: 'inventory', icon: 'fa-boxes-stacked', label: t.inventory },
    { id: 'setup', icon: 'fa-screwdriver-wrench', label: t.setup },
    { id: 'lab', icon: 'fa-flask-vial', label: t.lab },
    { id: 'stats', icon: 'fa-chart-line', label: t.stats },
    { id: 'journey', icon: 'fa-book-open', label: t.journey },
    { id: 'gallery', icon: 'fa-images', label: t.gallery },
    { id: 'archive', icon: 'fa-box-archive', label: t.archive },
    { id: 'settings', icon: 'fa-gear', label: t.settings },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  return (
    <>
      <div className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />

      <div ref={drawerRef} className={`fixed top-0 bottom-0 w-72 bg-slate-900 border-slate-800 z-[70] shadow-2xl transition-transform duration-300 ease-out overflow-hidden flex flex-col ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} ${isOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}`}>
        <div className="p-8 pb-4 flex-shrink-0">
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">VAPE <span className="text-blue-500">PRO</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] opacity-80">Refined Vaping System</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1 py-4 no-scrollbar">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveRoute(item.id); setIsOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeRoute === item.id ? 'bg-blue-600 text-white shadow-lg font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <i className={`fa-solid ${item.icon} w-6 text-center text-lg`}></i>
              <span className="text-sm tracking-tight">{item.label}</span>
              {activeRoute === item.id && <div className={`ml-auto w-1.5 h-1.5 bg-white rounded-full ${isRtl ? 'mr-auto ml-0' : 'ml-auto mr-0'}`}></div>}
            </button>
          ))}
          {/* Bottom padding to prevent overlap with footer */}
          <div className="h-10"></div>
        </nav>

        <div className="p-6 flex-shrink-0 bg-slate-950/40 border-t border-slate-800/60 h-24 flex items-center justify-center">
           <div className="text-center">
              <div className="text-[10px] font-black text-slate-600 uppercase mb-1">PRO RELEASE v2.2.0</div>
              <div className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Clean Architecture Engine</div>
           </div>
        </div>
      </div>
    </>
  );
};

export default NavDrawer;
