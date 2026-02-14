
import React, { useState, useRef } from 'react';
import { UserExperience, WickingHistory } from '../types';
import { analyzeExperience, translateText, summarizeAiComment } from '../services/geminiService';
import { useTranslation } from '../i18n';

const renderMarkdown = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
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
  onDelete?: (id: string) => void;
}

const ExperienceNotes: React.FC<ExperienceNotesProps> = ({ notes, setups, onAdd, onDelete }) => {
  const { t, lang } = useTranslation();
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!topic || !content) return;
    onAdd({ 
      id: Date.now().toString(), 
      topic, 
      content, 
      setupIds: [], 
      aiAnalysis: aiResult || undefined, 
      rating: 5, 
      date: Date.now(), 
      imageUrl: imageUrl || undefined 
    });
    setTopic(''); setContent(''); setImageUrl(''); setAiResult(null); setIsPreview(false);
  };

  const handleAiAnalyze = async () => {
    if (!content) return;
    setAnalyzing(true);
    const result = await analyzeExperience(topic, content);
    setAiResult(result);
    setAnalyzing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-32">
      <div className="glass p-8 rounded-[3rem] border-slate-800/40 shadow-2xl space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-feather-pointed"></i> {t.newEntry}</h3>
          <button onClick={() => setIsPreview(!isPreview)} className="text-[9px] font-black uppercase text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full bg-blue-500/5">{isPreview ? t.editMode : t.previewMarkdown}</button>
        </div>
        
        <input placeholder={t.name} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" value={topic} onChange={e => setTopic(e.target.value)} />

        {isPreview ? (
          <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 min-h-[10rem] text-xs leading-relaxed text-white overflow-y-auto">{renderMarkdown(content) || <span className="opacity-30 italic">...</span>}</div>
        ) : (
          <textarea placeholder="..." className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 h-40 text-xs leading-relaxed text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none" value={content} onChange={e => setContent(e.target.value)} />
        )}

        <div className="flex gap-4">
           <div onClick={() => fileInputRef.current?.click()} className="w-20 h-20 bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0 shadow-inner">
             {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover" alt="" /> : <i className="fa-solid fa-camera text-slate-700"></i>}
           </div>
           <button onClick={handleAiAnalyze} disabled={analyzing || !content} className="flex-1 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-indigo-600/20">
             {analyzing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-brain"></i>} AI Analysis
           </button>
           <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>

        {aiResult && (
           <div className="p-6 bg-slate-950/60 rounded-3xl border border-indigo-500/20 animate-in zoom-in-95">
             <div className="text-xs text-slate-300 mb-4 prose prose-invert prose-sm">{renderMarkdown(aiResult)}</div>
             <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { navigator.clipboard.writeText(aiResult!); alert('Copied!'); }} className="py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-400">Copy</button>
                <button onClick={async () => setAiResult(await summarizeAiComment(aiResult!))} className="py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-400">Summary</button>
                <button onClick={() => setShowLangMenu(!showLangMenu)} className="py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-400">Translate</button>
                <button onClick={() => { setContent(prev => prev + "\n\n" + aiResult); setAiResult(null); }} className="py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-400">Add to Note</button>
             </div>
             {showLangMenu && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                   {['lang_fa', 'lang_fr', 'lang_nl', 'lang_ar'].map(l => <button key={l} onClick={async () => { setAiResult(await translateText(aiResult!, t[l])); setShowLangMenu(false); }} className="py-1.5 bg-slate-900/50 rounded-lg text-[8px] text-slate-500">{t[l]}</button>)}
                </div>
             )}
           </div>
        )}
        
        <button onClick={handleSave} disabled={analyzing || !topic} className="btn-primary w-full py-5 rounded-[2.2rem] font-black uppercase tracking-widest shadow-xl active:scale-95 text-xs text-white">
          Register Journey
        </button>
      </div>

      <div className="space-y-4">
        {notes.sort((a,b) => b.date - a.date).map(note => (
          <div key={note.id} className="glass rounded-[3rem] p-8 border-slate-800 shadow-xl relative group animate-in slide-in-from-bottom-2">
             {onDelete && <button onClick={() => onDelete(note.id)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"><i className="fa-solid fa-trash-can text-[10px]"></i></button>}
             <div className="flex justify-between items-start mb-6 pr-10">
                <h4 className="font-black text-2xl text-white tracking-tighter">{note.topic}</h4>
                <div className="text-[10px] text-slate-600 font-bold uppercase">{new Date(note.date).toLocaleDateString()}</div>
             </div>
             {note.imageUrl && <img src={note.imageUrl} className="w-full h-52 object-cover rounded-[2rem] mb-6 border border-slate-800" alt="" />}
             <div className="text-xs text-slate-400 mb-6 italic leading-relaxed">{renderMarkdown(note.content)}</div>
             {note.aiAnalysis && <div className="bg-blue-600/5 p-5 rounded-[2rem] border border-blue-500/10"><div className="text-[8px] font-black text-blue-500 uppercase mb-3">{t.aiPrediction}</div><div className="text-[10px] text-blue-200/60 italic">{renderMarkdown(note.aiAnalysis)}</div></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceNotes;
