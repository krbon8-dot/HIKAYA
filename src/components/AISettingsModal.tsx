import React, { useState, useEffect } from 'react';
import { X, KeyRound, Bot, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { AISettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AISettings) => void;
}

export default function AISettingsModal({ isOpen, onClose, onSave }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [modelType, setModelType] = useState('flash');
  const [modelName, setModelName] = useState('gemini-2.5-flash');

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('hikaya_ai_settings');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setApiKey(parsed.apiKey || '');
          setModelType(parsed.modelType || 'flash');
          setModelName(parsed.modelName || 'gemini-2.5-flash');
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const settings: AISettings = { apiKey, modelType: modelType as any, modelName };
    localStorage.setItem('hikaya_ai_settings', JSON.stringify(settings));
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" dir="rtl">
      <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[#1a1a1a]">
          <h2 className="text-[var(--text)] font-bold text-lg flex items-center gap-2">
            <Zap className="text-[var(--accent)]" size={20} /> اعدادات الذكاء الاصطناعي (Gemini)
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--text-dim)] hover:text-white rounded-full transition-colors hover:bg-black/20">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
           <p className="text-xs text-[var(--text-dim)] leading-relaxed bg-[rgba(168,85,247,0.1)] p-3 rounded border border-[var(--accent)]">
             يرجى إدخال مفتاح API الخاص بـ Gemini لتتمكن من استخدام ميزات التدقيق، الإكمال التلقائي، وتوسيع النصوص. لن تعمل هذه الميزات بدون المفتاح. المفتاح يُحفظ محلياً في متصفحك فقط.
           </p>

           <div className="flex flex-col gap-2">
             <label className="text-sm text-[var(--text)] font-bold flex items-center gap-2">
               <KeyRound size={16} className="text-orange-400"/> مفتاح API (API Key)
             </label>
             <input 
               type="password"
               value={apiKey}
               onChange={e => setApiKey(e.target.value)}
               placeholder="AIzaSy..."
               className="bg-[#0f0f0f] border border-[var(--border)] p-3 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] w-full font-mono text-left"
               dir="ltr"
             />
             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-[var(--accent)] hover:underline self-end">
               الحصول على المفتاح مجاناً من Google AI Studio
             </a>
           </div>

           <div className="flex flex-col gap-2">
             <label className="text-sm text-[var(--text)] font-bold flex items-center gap-2">
               <Bot size={16} className="text-blue-400"/> نوع النموذج السريع (Model)
             </label>
             <div className="flex gap-2">
               <button 
                 onClick={() => { setModelType('flash'); setModelName('gemini-2.5-flash'); }} 
                 className={cn("flex-1 py-2 border rounded text-xs transition-colors font-bold", modelType === 'flash' ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "bg-transparent border-[var(--border)] text-[var(--text-dim)]")}
               >
                 Gemini Flash (أسرع)
               </button>
               <button 
                 onClick={() => { setModelType('pro'); setModelName('gemini-2.5-pro'); }} 
                 className={cn("flex-1 py-2 border rounded text-xs transition-colors font-bold", modelType === 'pro' ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "bg-transparent border-[var(--border)] text-[var(--text-dim)]")}
               >
                 Gemini Pro (أذكى)
               </button>
             </div>
           </div>

           <div className="flex flex-col gap-2">
             <label className="text-sm text-[var(--text)] font-bold">معرف النموذج (Model Name)</label>
             <input 
               type="text"
               value={modelName}
               onChange={e => setModelName(e.target.value)}
               className="bg-[#0f0f0f] border border-[var(--border)] p-2 rounded text-xs text-[var(--text-dim)] outline-none focus:border-[var(--accent)] w-full font-mono text-left"
               dir="ltr"
             />
           </div>
        </div>

        <div className="p-4 border-t border-[var(--border)] bg-[#1a1a1a] flex justify-end gap-3 rounded-b-2xl">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm text-[var(--text-dim)] hover:text-white transition-colors font-bold"
          >
            إلغاء
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2 bg-[var(--accent)] hover:bg-purple-600 text-white text-sm font-bold rounded shadow-lg transition-colors"
          >
            حفظ الإعدادات
          </button>
        </div>

      </div>
    </div>
  );
}
