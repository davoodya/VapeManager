
import React, { useState } from 'react';
import { useTranslation } from '../i18n.ts';
import { findNearbyShops } from '../services/geminiService.ts';

const ShopFinder: React.FC = () => {
  const { t, lang } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [shopsText, setShopsText] = useState<string | null>(null);
  const [shopsLinks, setShopsLinks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFindShops = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your device.");
      return;
    }

    setLoading(true);
    setError(null);
    setShopsText(null);
    setShopsLinks([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Prompt explicitly asks for bilingual search
          const aiPrompt = lang === 'fa' 
            ? "Vape Shop و فروشگاه ویپ در اطراف من را پیدا کن." 
            : "Find Vape Shops and electronic cigarette stores around me.";
          
          const response = await findNearbyShops(latitude, longitude);
          
          setShopsText(response.text || "");
          
          // Extract links from grounding chunks
          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          const links = chunks
            .filter((chunk: any) => chunk.maps)
            .map((chunk: any) => ({
              title: chunk.maps.title,
              uri: chunk.maps.uri
            }));
          
          setShopsLinks(links);
          setLoading(false);
        } catch (err) {
          setError("AI Search failed. Please check your API key or connection.");
          setLoading(false);
        }
      },
      (err) => {
        setError("Location access denied. Please enable GPS.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="p-6 space-y-6 pb-32 animate-in fade-in">
      <header className="px-2 mt-4 text-center">
        <h2 className="text-3xl font-black text-blue-500 uppercase tracking-tighter italic">SHOP FINDER</h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">
          Discover Premium Local Stores
        </p>
      </header>

      <div className="glass-card p-10 rounded-[4rem] shadow-2xl text-center space-y-8">
        <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20 shadow-inner">
          <i className="fa-solid fa-map-location-dot text-blue-500 text-4xl"></i>
        </div>
        
        <p className="text-sm text-slate-400 font-medium px-4 leading-relaxed italic">
          {lang === 'fa' 
            ? 'با استفاده از هوش مصنوعی، بهترین فروشگاه‌های ویپ اطراف خود را با جستجوی دو زبانه پیدا کنید.' 
            : 'Locate top-rated vape stores nearby using our AI-powered bilingual search engine.'}
        </p>

        <button 
          onClick={handleFindShops}
          disabled={loading}
          className="btn-primary w-full py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all text-white flex items-center justify-center gap-4"
        >
          {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-location-crosshairs"></i>}
          {loading ? 'Searching...' : (lang === 'fa' ? 'جستجوی اطراف من' : 'SEARCH NEARBY')}
        </button>
      </div>

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-[11px] font-black uppercase text-red-500 text-center animate-in zoom-in-95">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
        </div>
      )}

      {(shopsText || shopsLinks.length > 0) && (
        <div className="space-y-5 animate-in slide-in-from-top-4">
          {shopsText && (
            <div className="glass p-8 rounded-[3rem] border-slate-800 shadow-xl">
               <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-3">
                  <i className="fa-solid fa-robot"></i> AI RECOMMENDATIONS
               </div>
               <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line italic">
                 {shopsText}
               </div>
            </div>
          )}

          {shopsLinks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Verified Map Locations</h3>
              <div className="grid grid-cols-1 gap-3">
                {shopsLinks.map((shop, idx) => (
                  <a key={idx} href={shop.uri} target="_blank" rel="noopener noreferrer" className="glass p-5 rounded-[2rem] border-slate-800 flex items-center justify-between group hover:border-blue-500/50 transition-all active:scale-95 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <i className="fa-solid fa-store"></i>
                      </div>
                      <span className="text-sm font-black text-slate-200 group-hover:text-white">{shop.title}</span>
                    </div>
                    <i className="fa-solid fa-arrow-up-right-from-square text-slate-700 group-hover:text-blue-500 transition-colors"></i>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopFinder;
