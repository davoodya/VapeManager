
import React, { useState, useRef } from 'react';
import { UserExperience } from '../types';
import { analyzeExperience } from '../services/geminiService';
import { useTranslation } from '../i18n';

interface ExperienceNotesProps {
  notes: UserExperience[];
  onAdd: (note: UserExperience) => void;
}

const ExperienceNotes: React.FC<ExperienceNotesProps> = ({ notes, onAdd }) => {
  const { t, lang } = useTranslation();
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!topic || !content) return;
    setAnalyzing(true);
    
    const analysis = await analyzeExperience(topic, content);
    
    const newNote: UserExperience = {
      id: Date.now().toString(),
      topic,
      content,
      imageUrl,
      aiAnalysis: analysis,
      rating,
      date: Date.now()
    };
    
    onAdd(newNote);
    setTopic('');
    setContent('');
    setImageUrl(undefined);
    setRating(5);
    setAnalyzing(false);
  };

  return (
    <div className="p-4 space-y-6 pb-32">
      <h2 className="text-2xl font-black text-blue-500 uppercase tracking-tighter italic px-2">{t.journal}</h2>
      
      <div className="glass p-7 rounded-[3rem] shadow-2xl space-y-5 border-slate-800/40">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.newEntry}</h3>
        
        <div className="flex gap-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-[1.8rem] bg-slate-950 border border-slate-800 flex items-center justify-center cursor-pointer overflow-hidden relative shadow-inner group"
          >
            {imageUrl ? (
              <img src={imageUrl} className="w-full h-full object-cover opacity-80" alt="" />
            ) : (
              <i className="fa-solid fa-camera text-slate-700 text-2xl group-hover:text-blue-500 transition-colors"></i>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
          <div className="flex-1 space-y-3">
            <input 
              placeholder={t.name}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-100"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="flex items-center justify-between px-1">
               <span className="text-[9px] font-black text-slate-600 uppercase">Rating</span>
               <div className="flex gap-1">
                 {[1,2,3,4,5].map(v => (
                   <i key={v} onClick={() => setRating(v*2)} className={`fa-solid fa-star text-[10px] cursor-pointer ${rating >= v*2 ? 'text-yellow-500' : 'text-slate-800'}`}></i>
                 ))}
               </div>
            </div>
          </div>
        </div>

        <textarea 
          placeholder="..."
          className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 h-32 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-slate-100 text-xs leading-relaxed"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        <button 
          onClick={handleSave}
          disabled={analyzing || !topic || !content}
          className="w-full bg-blue-600 text-white disabled:opacity-50 py-5 rounded-[2.2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all text-xs"
        >
          {analyzing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
          {analyzing ? t.analyzing : t.analyze}
        </button>
      </div>

      <div className="space-y-6">
        {notes.sort((a, b) => b.date - a.date).map(note => (
          <div key={note.id} className="glass rounded-[2.5rem] p-7 border-slate-800/40 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 relative">
            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="flex-1">
                <h4 className="font-black text-xl text-slate-100 tracking-tighter">{note.topic}</h4>
                <div className="text-[10px] text-slate-600 font-black uppercase mt-1">
                  {new Date(note.date).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800">
                <i className="fa-solid fa-star text-[8px] text-yellow-500"></i>
                <span className="text-[10px] font-black text-slate-300">{note.rating}/10</span>
              </div>
            </div>

            {note.imageUrl && (
              <div className="w-full h-48 rounded-[2rem] overflow-hidden mb-6 border border-slate-800 shadow-inner">
                <img src={note.imageUrl} className="w-full h-full object-cover" alt="" />
              </div>
            )}

            <p className="text-xs text-slate-400 mb-6 leading-relaxed italic">{note.content}</p>
            
            {note.aiAnalysis && (
              <div className="bg-blue-600/5 border border-blue-500/10 rounded-[2rem] p-5 mt-4 relative">
                <div className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-2 mb-2 tracking-[0.2em]">
                  <i className="fa-solid fa-robot text-xs"></i> {t.aiPrediction}
                </div>
                <p className="text-[11px] text-blue-200/70 leading-relaxed italic">
                  {note.aiAnalysis}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceNotes;
