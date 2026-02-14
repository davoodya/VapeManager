
import React, { useState, useMemo } from 'react';
import { UserExperience, WickingHistory, InventoryItem, CoilStats } from '../types';
import { useTranslation } from '../i18n';

interface GalleryProps {
  experiences: UserExperience[];
  history: WickingHistory[];
  inventory: InventoryItem[];
  coils: CoilStats[];
}

interface ImageItem {
  url: string;
  label: string;
  date: number;
  tags: string[];
}

const Gallery: React.FC<GalleryProps> = ({ experiences, history, inventory, coils }) => {
  const { t, lang } = useTranslation();
  const [activeTag, setActiveTag] = useState('all');

  const allImages = useMemo(() => {
    const journeyImages: ImageItem[] = experiences
      .filter(e => !!e.imageUrl)
      .map(e => ({ url: e.imageUrl!, label: e.topic, date: e.date, tags: ['#journey'] }));

    const setupImages: ImageItem[] = history
      .filter(h => !!h.imageUrl)
      .map(h => {
        const atty = inventory.find(i => i.id === h.atomizerId);
        return { url: h.imageUrl!, label: atty?.name || 'Setup', date: h.date, tags: ['#setup', '#atomizer'] };
      });

    const gearImages: ImageItem[] = inventory
      .filter(i => !!i.imageUrl && !i.imageUrl.includes('unsplash.com'))
      .map(i => ({ 
        url: i.imageUrl!, 
        label: i.name, 
        date: i.createdAt, 
        tags: [`#${i.category.replace(/_/g, '')}`, '#gear'] 
      }));

    const coilImages: ImageItem[] = coils
      .flatMap(c => (c.images || []).map(img => ({ 
        url: img, 
        label: c.name || 'Coil', 
        date: c.createdAt, 
        tags: ['#coil'] 
      })));

    return [...journeyImages, ...setupImages, ...gearImages, ...coilImages].sort((a, b) => b.date - a.date);
  }, [experiences, history, inventory, coils]);

  const uniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allImages.forEach(img => img.tags.forEach(tag => tagsSet.add(tag)));
    return ['all', ...Array.from(tagsSet)];
  }, [allImages]);

  const filteredImages = activeTag === 'all' ? allImages : allImages.filter(img => img.tags.includes(activeTag));

  return (
    <div className="p-4 space-y-6 pb-32 animate-in fade-in">
      <header className="px-2 mt-4">
        <h2 className="text-3xl font-black text-blue-500 uppercase tracking-tighter italic">GALLERY</h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-70">Visual Memory Record</p>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
        {uniqueTags.map(tag => (
          <button key={tag} onClick={() => setActiveTag(tag)} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap border ${activeTag === tag ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200'}`}>
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {filteredImages.map((img, idx) => (
          <div key={idx} className="glass rounded-[2.5rem] overflow-hidden border-slate-800 shadow-2xl group relative active:scale-95 transition-transform duration-500">
             <img src={img.url} className="w-full h-60 object-cover" alt="" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
             <div className="absolute bottom-5 left-5 right-5">
                <div className="flex flex-wrap gap-1.5 mb-2">
                   {img.tags.map(t => <span key={t} className="text-[7px] font-black text-blue-400 uppercase bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20">{t}</span>)}
                </div>
                <div className="text-[11px] font-black text-white truncate drop-shadow-lg">{img.label}</div>
                <div className="text-[8px] text-slate-500 font-bold uppercase mt-1">{new Date(img.date).toLocaleDateString()}</div>
             </div>
          </div>
        ))}
      </div>
      {filteredImages.length === 0 && <div className="text-center py-40 glass rounded-[4rem] border-dashed border-2 border-slate-800/50"><i className="fa-solid fa-images text-slate-800 text-5xl mb-4"></i><p className="text-slate-600 font-black uppercase text-[11px] tracking-widest">{t.noHistory}</p></div>}
    </div>
  );
};

export default Gallery;
