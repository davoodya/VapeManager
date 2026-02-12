
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
  type: string;
  tags: string[];
}

const Gallery: React.FC<GalleryProps> = ({ experiences, history, inventory, coils }) => {
  const { t, lang } = useTranslation();
  const [activeTag, setActiveTag] = useState('all');
  const isRtl = lang === 'fa';

  // Aggregate all images from the system
  const allImages = useMemo(() => {
    const expImages: ImageItem[] = experiences
      .filter(e => !!e.imageUrl)
      .map(e => ({ url: e.imageUrl!, label: e.topic, date: e.date, type: 'Journey', tags: ['#journey'] }));

    const setupImages: ImageItem[] = history
      .filter(h => !!h.imageUrl)
      .map(h => {
        const atty = inventory.find(i => i.id === h.atomizerId);
        return { url: h.imageUrl!, label: atty?.name || 'Setup', date: h.date, type: 'Setup', tags: ['#setup', '#atomizer'] };
      });

    const coilImages: ImageItem[] = coils
      .flatMap(c => (c.images || []).map(img => ({ 
        url: img, 
        label: c.name || 'Coil', 
        date: c.createdAt, 
        type: 'Coil', 
        tags: ['#coil'] 
      })));

    const gearImages: ImageItem[] = inventory
      .filter(i => !!i.imageUrl && !i.imageUrl.includes('unsplash.com')) // Only user uploaded images
      .map(i => ({ 
        url: i.imageUrl!, 
        label: `${i.brand} ${i.name}`, 
        date: i.createdAt, 
        type: 'Gear', 
        tags: [`#${i.category}`, '#gear'] 
      }));

    return [...expImages, ...setupImages, ...coilImages, ...gearImages].sort((a, b) => b.date - a.date);
  }, [experiences, history, inventory, coils]);

  const uniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allImages.forEach(img => img.tags.forEach(tag => tagsSet.add(tag)));
    return ['all', ...Array.from(tagsSet)];
  }, [allImages]);

  const filteredImages = activeTag === 'all' 
    ? allImages 
    : allImages.filter(img => img.tags.includes(activeTag));

  return (
    <div className="p-4 space-y-6 pb-32">
      <header className="px-2">
        <h2 className="text-2xl font-black text-blue-500 uppercase tracking-tighter italic">{t.gallery}</h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-70">
          Visual record of your builds, gears, and journey
        </p>
      </header>

      {/* Task 3 Filter UI */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
        {uniqueTags.map(tag => (
          <button 
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap border ${activeTag === tag ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredImages.map((img, idx) => (
            <div key={`${img.url}-${idx}`} className="glass rounded-[2rem] overflow-hidden border-slate-800 shadow-xl group relative active:scale-95 transition-transform animate-in fade-in">
               <img src={img.url} className="w-full h-56 object-cover" alt={img.label} />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
               <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {img.tags.map(t => (
                       <span key={t} className="text-[7px] font-black text-blue-500 uppercase tracking-tighter bg-blue-500/10 px-1 rounded">{t}</span>
                    ))}
                  </div>
                  <div className="text-[10px] font-black text-white truncate drop-shadow-md">{img.label}</div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{new Date(img.date).toLocaleDateString(isRtl ? 'fa-IR' : 'en-US')}</div>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-40 glass rounded-[3rem] border-dashed border-2 border-slate-800/50">
           <i className="fa-solid fa-images text-slate-800 text-6xl mb-6"></i>
           <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{t.noHistory}</p>
        </div>
      )}
    </div>
  );
};

export default Gallery;
