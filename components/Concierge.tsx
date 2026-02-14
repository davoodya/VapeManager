
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { useTranslation } from '../i18n.ts';

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const Concierge: React.FC = () => {
  const { t, lang } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Frequency Visualizer logic
  const drawVisualizer = (analyser: AnalyserNode) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgba(59, 130, 246, ${dataArray[i] / 255 + 0.1})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  const startSession = async () => {
    setStatus('connecting');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    if (!audioContextRef.current) {
      audioContextRef.current = {
        input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
        output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }),
      };
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const analyser = audioContextRef.current.input.createAnalyser();
    analyser.fftSize = 64;
    drawVisualizer(analyser);

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          setIsActive(true);
          setStatus('listening');
          const source = audioContextRef.current!.input.createMediaStreamSource(stream);
          source.connect(analyser);
          
          const scriptProcessor = audioContextRef.current!.input.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            
            sessionPromise.then(session => {
              session.sendRealtimeInput({
                media: {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000'
                }
              });
            });
          };
          scriptProcessor.connect(audioContextRef.current!.input.destination);
          (window as any)._vape_scriptProcessor = scriptProcessor;
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) {
            setTranscription(prev => [...prev.slice(-4), `AI: ${message.serverContent!.outputTranscription!.text}`]);
          }
          
          const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData) {
            setStatus('speaking');
            const buffer = await decodeAudioData(decode(audioData), audioContextRef.current!.output, 24000, 1);
            const source = audioContextRef.current!.output.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current!.output.destination);
            
            const startAt = Math.max(nextStartTimeRef.current, audioContextRef.current!.output.currentTime);
            source.start(startAt);
            nextStartTimeRef.current = startAt + buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setStatus('listening');
            };
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setStatus('listening');
          }
        },
        onclose: () => stopSession(),
        onerror: (e) => { console.error("Live API Error", e); stopSession(); }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        systemInstruction: `You are the Vape Management Pro Concierge. 
        You are an elite mechanical engineer and master mixologist. 
        Your goal is to help vapers with technical troubleshooting, flavor optimization, and build safety. 
        Be professional, technical, yet friendly. Speak in the user's language (${lang === 'fa' ? 'Persian' : 'English'}).`
      }
    });

    sessionRef.current = await sessionPromise;
  };

  const stopSession = () => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if ((window as any)._vape_scriptProcessor) { (window as any)._vape_scriptProcessor.disconnect(); }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsActive(false);
    setStatus('idle');
    setTranscription([]);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in max-w-lg mx-auto pb-32">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
          AI <span className="text-blue-500">CONCIERGE</span>
        </h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
          {lang === 'fa' ? 'عیب‌یابی صوتی هوشمند' : 'VOICE TROUBLESHOOTING'}
        </p>
      </header>

      <div className="glass-card rounded-[4rem] p-10 flex flex-col items-center justify-center space-y-10 relative overflow-hidden shadow-2xl border-white/5 min-h-[450px]">
        {isActive ? (
          <>
            <canvas ref={canvasRef} width={300} height={100} className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" />
            <div className="relative">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 bg-blue-600/10 border-2 border-blue-500/20 ${status === 'speaking' ? 'scale-110 shadow-[0_0_50px_rgba(59,130,246,0.5)]' : ''}`}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${status === 'speaking' ? 'bg-blue-500 animate-pulse' : 'bg-slate-800 animate-bounce shadow-inner'}`}>
                  <i className={`fa-solid ${status === 'speaking' ? 'fa-volume-high' : 'fa-microphone'} text-3xl text-white`}></i>
                </div>
              </div>
              {status === 'speaking' && (
                <div className="absolute -inset-4 border border-blue-500/30 rounded-full animate-ping"></div>
              )}
            </div>

            <div className="w-full space-y-3 z-10">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Live Transcript</div>
              <div className="bg-slate-950/50 p-6 rounded-[2.5rem] min-h-[100px] border border-slate-800 text-xs text-slate-300 leading-relaxed italic text-center backdrop-blur-md">
                {transcription.length > 0 ? transcription[transcription.length - 1] : (lang === 'fa' ? 'در حال شنیدن...' : 'Listening...')}
              </div>
            </div>

            <button onClick={stopSession} className="bg-red-600 px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-900/30 active:scale-95 transition-all text-white z-10">
              {lang === 'fa' ? 'قطع اتصال' : 'END SESSION'}
            </button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner">
               <i className="fa-solid fa-headset text-4xl text-slate-700"></i>
            </div>
            <p className="text-center text-sm text-slate-400 font-medium px-4 leading-relaxed italic">
              {lang === 'fa' 
                ? 'با متخصص ویپینگ ما به صورت زنده صحبت کنید. برای شروع روی دکمه زیر ضربه بزنید.' 
                : 'Speak live with our master mixologist and build expert for real-time help.'}
            </p>
            <button 
              onClick={startSession} 
              disabled={status === 'connecting'}
              className="btn-primary px-12 py-6 rounded-full font-black uppercase text-[11px] tracking-widest transition-all text-white flex items-center gap-3"
            >
              {status === 'connecting' ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
              {lang === 'fa' ? 'شروع مشاوره زنده' : 'START LIVE EXPERT'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Concierge;
