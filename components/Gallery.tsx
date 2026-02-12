
import React from 'react';
import { UserExperience } from '../types';
import { useTranslation } from '../i18n';

interface GalleryProps {
  experiences: UserExperience[];
}

const Gallery: React.FC<GalleryProps> = ({ experiences }) => {
  const { t, lang } = useTranslation();
  const images = experiences.filter(e => !!e.imageUrl);

  return (
    <div className="p-4 space-y-6 pb-32">
      <header className="px-2">
        <h2 className="text-2xl font-black text-blue-500 uppercase tracking-tighter italic">{t.gallery}</h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-70">
          Visual record of your builds and clouds
        </p>
      </header>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {images.map(img => (
            <div key={img.id} className="glass rounded-[2rem] overflow-hidden border-slate-800 shadow-xl group relative active:scale-95 transition-transform">
               <img src={img.imageUrl} className="w-full h-56 object-cover" alt={img.topic} />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
               <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-[10px] font-black text-white truncate drop-shadow-md">{img.topic}</div>
                  <div className="text-[8px] text-blue-400 font-bold uppercase mt-0.5">{new Date(img.date).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}</div>
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
