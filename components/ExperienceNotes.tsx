
import React, { useState } from 'react';
import { UserExperience, WickingHistory } from '../types';
import { analyzeExperience } from '../services/geminiService';
import { useTranslation } from '../i18n';

// Simple Markdown Parser Task 1
const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      return <li key={i} className="ml-4 list-disc text-slate-300">{line.trim().substring(2)}</li>;
    }
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-blue-400 font-bold mt-3 mb-1">{line.substring(4)}</h3>;
    }
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = line.split(boldRegex);
    return (
      <p key={i} className="mb-2 text-slate-300 leading-relaxed">
        {parts.map((part, index) => index % 2 === 1 ? <strong key={index} className="text-white font-black">{part}</strong> : part)}
      </p>
    );
  });
};

interface ExperienceNotesProps {
  notes: UserExperience[];
  setups: WickingHistory[];
  onAdd: (note: UserExperience) => void;
}

const ExperienceNotes: React.FC<ExperienceNotesProps> = ({ notes, setups, onAdd }) => {
  const { t, lang } = useTranslation();
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [selectedSetups, setSelectedSetups] = useState<string[]>([]);
  const [rating, setRating] = useState(5);
  const [analyzing, setAnalyzing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const toggleSetup = (id: string) => {
    setSelectedSetups(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!topic || !content) return;
    setAnalyzing(true);
    const analysis = await analyzeExperience(topic, content);
    
    onAdd({
      id: Date.now().toString(),
      topic,
      content,
      setupIds: selectedSetups,
      aiAnalysis: analysis,
      rating,
      date: Date.now()
    });
    
    setTopic(''); setContent(''); setSelectedSetups([]); setRating(5); setAnalyzing(false); setIsPreview(false);
  };

  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-[3rem] border-slate-800/40 shadow-2xl space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
             <i className="fa-solid fa-feather-pointed"></i> {t.newEntry}
          </h3>
          <button onClick={() => setIsPreview(!isPreview)} className="text-[9px] font-black uppercase text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full bg-blue-500/5">
             {isPreview ? t.editMode : t.previewMarkdown}
          </button>
        </div>
        
        <input 
          placeholder={t.name}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
          value={topic} onChange={e => setTopic(e.target.value)}
        />

        <div className="space-y-3">
          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Link Setups</label>
          <div className="flex flex-wrap gap-2">
            {setups.map(s => (
              <button 
                key={s.id} 
                onClick={() => toggleSetup(s.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${selectedSetups.includes(s.id) ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
              >
                {s.atomizerId.slice(-4)}
              </button>
            ))}
          </div>
        </div>

        {isPreview ? (
          <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 min-h-[8rem] text-xs leading-relaxed text-white animate-in fade-in overflow-y-auto">
             {renderMarkdown(content) || <span className="opacity-30 italic">No content yet...</span>}
          </div>
        ) : (
          <textarea 
            placeholder="..."
            className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 h-32 text-xs leading-relaxed text-white outline-none focus:ring-1 focus:ring-blue-500 animate-in slide-in-from-top-1"
            value={content} onChange={e => setContent(e.target.value)}
          />
        )}
        
        <button onClick={handleSave} disabled={analyzing || !topic} className="w-full bg-blue-600 py-5 rounded-[2.2rem] font-black uppercase tracking-widest shadow-xl active:scale-95 text-xs">
          {analyzing ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : null}
          {analyzing ? t.analyzing : t.analyze}
        </button>
      </div>

      <div className="space-y-4">
        {notes.sort((a,b) => b.date - a.date).map(note => (
          <div key={note.id} className="glass rounded-[2.5rem] p-7 border-slate-800/40 shadow-xl relative animate-in slide-in-from-bottom-2">
             <div className="flex justify-between items-start mb-4">
                <h4 className="font-black text-xl text-white tracking-tighter">{note.topic}</h4>
                <div className="text-[10px] text-slate-600 font-bold uppercase">{new Date(note.date).toLocaleDateString()}</div>
             </div>
             <div className="text-xs text-slate-400 mb-6 italic leading-relaxed">
               {renderMarkdown(note.content)}
             </div>
             {note.aiAnalysis && (
                <div className="bg-blue-600/5 p-4 rounded-2xl border border-blue-500/10">
                   <div className="text-[8px] font-black text-blue-500 uppercase mb-2">{t.aiPrediction}</div>
                   <div className="text-[10px] text-blue-200/60 leading-relaxed italic">
                     {renderMarkdown(note.aiAnalysis)}
                   </div>
                </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceNotes;
