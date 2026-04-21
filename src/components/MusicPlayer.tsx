import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Music, X, Play, Pause, SkipForward, SkipBack, Volume2, Upload, Youtube, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState<string>('');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [inputUrl, setInputUrl] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  
  const handleUrlSubmit = () => {
    if (inputUrl) {
      setUrl(inputUrl);
      setPlaying(true);
      if (!history.includes(inputUrl)) {
        setHistory(prev => [inputUrl, ...prev].slice(0, 5));
      }
      setInputUrl('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setUrl(fileUrl);
      setPlaying(true);
    }
  };

  return (
    <div className={cn(
      "fixed top-20 left-6 z-[100] w-80 bg-[var(--panel)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden no-print transition-all duration-300",
      isOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 -translate-x-12 pointer-events-none"
    )}>
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-black/10">
        <div className="flex items-center gap-2">
          <Music size={18} className="text-[var(--accent)]" />
          <h3 className="font-bold text-sm">مشغل الموسيقى للمؤلف</h3>
        </div>
        <button onClick={onClose} className="text-[var(--text-dim)] hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* URL Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-[var(--text-dim)]">رابط يوتيوب أو صوتي</label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="https://youtu.be/..."
              className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--accent)] transition-colors"
            />
            <button 
              onClick={handleUrlSubmit}
              className="bg-[var(--accent)] text-white p-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Youtube size={16} />
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-[var(--text-dim)]">تحميل من الجهاز</label>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[var(--border)] rounded-lg p-3 cursor-pointer hover:bg-white/5 transition-colors group">
            <Upload size={16} className="text-[var(--text-dim)] group-hover:text-[var(--accent)]" />
            <span className="text-xs text-[var(--text-dim)]">اختر ملف صوتي</span>
            <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* History / Recent */}
        {history.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider font-bold">مؤخراً</label>
            <div className="flex flex-col gap-1">
              {history.map((h, i) => (
                <button 
                  key={i} 
                  onClick={() => { setUrl(h); setPlaying(true); }}
                  className="text-[10px] text-left truncate px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <ExternalLink size={10} />
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Player Controls (Hidden Video) */}
        {url && (
          <div className="mt-2 bg-black/20 p-3 rounded-xl flex flex-col gap-3">
            <div className="hidden">
              <ReactPlayer 
                url={url} 
                playing={playing} 
                volume={volume}
                width="0"
                height="0"
              />
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setPlaying(!playing)} className="w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                {playing ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Volume2 size={14} className="text-[var(--text-dim)]" />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="flex-1 accent-[var(--accent)] h-1 rounded-full cursor-pointer"
              />
            </div>
          </div>
        )}

        {!url && (
          <div className="py-6 flex flex-col items-center justify-center opacity-30 gap-2">
            <Music size={40} />
            <p className="text-[10px] text-center">قم بتشغيل مقاطع ملهمة أثناء الكتابة</p>
          </div>
        )}
      </div>
    </div>
  );
};
