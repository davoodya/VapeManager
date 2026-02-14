
import React from 'react';
import { useTranslation } from '../i18n.ts';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t, lang } = useTranslation();
  
  const tabs = [
    { id: 'dashboard', icon: 'fa-house', label: t.home },
    { id: 'inventory', icon: 'fa-boxes-stacked', label: t.inventory },
    { id: 'concierge', icon: 'fa-headset', label: lang === 'fa' ? 'مشاوره' : 'Concierge', primary: true },
    { id: 'lab', icon: 'fa-flask-vial', label: t.lab },
    { id: 'settings', icon: 'fa-gear', label: t.settingsTitle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 flex justify-around items-end safe-bottom z-50 h-20 px-2 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center justify-center transition-all duration-300 ${
            tab.primary 
              ? `w-14 h-14 bg-blue-600 -translate-y-4 rounded-full shadow-[0_10px_30px_-5px_rgba(37,99,235,0.6)] ${activeTab === tab.id ? 'bg-blue-500 scale-110 shadow-[0_10px_40px_rgba(59,130,246,0.8)] rotate-6' : ''}`
              : `w-full h-16 ${activeTab === tab.id ? 'text-blue-500 scale-105' : 'text-slate-500 opacity-60'}`
          }`}
        >
          <i className={`fa-solid ${tab.icon} ${tab.primary ? 'text-white text-2xl' : 'text-xl'}`}></i>
          {!tab.primary && <span className="text-[8px] mt-1 font-black uppercase tracking-tighter">{tab.label}</span>}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
