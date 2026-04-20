import React, { useState, useEffect } from 'react';
import { X, KeyRound, Bot, Zap, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { AISettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AISettings) => void;
}

export default function AISettingsModal({ isOpen, onClose, onSave }: Props) {
  const [apiKeys, setApiKeys] = useState<string[]>(['']);
  const [imageApiKeys, setImageApiKeys] = useState<string[]>(['']);
  const [modelType, setModelType] = useState('flash');
  const [modelName, setModelName] = useState('gemini-2.5-flash');

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('hikaya_ai_settings');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.apiKeys && parsed.apiKeys.length > 0) {
             setApiKeys(parsed.apiKeys);
          } else if (parsed.apiKey) {
             setApiKeys([parsed.apiKey]);
          }
          if (parsed.imageApiKeys && parsed.imageApiKeys.length > 0) {
             setImageApiKeys(parsed.imageApiKeys);
          }
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
    const settings: AISettings = { 
      apiKeys: apiKeys.filter(k => k.trim()), 
      imageApiKeys: imageApiKeys.filter(k => k.trim()),
      modelType: modelType as any, 
      modelName 
    };
    localStorage.setItem('hikaya_ai_settings', JSON.stringify(settings));
    onSave(settings);
    onClose();
  };

  const updateApiKey = (index: number, val: string) => {
    const arr = [...apiKeys];
    arr[index] = val;
    setApiKeys(arr);
  };
  const removeApiKey = (index: number) => {
    setApiKeys(apiKeys.filter((_, i) => i !== index));
  };
  const addApiKey = () => {
    if (apiKeys.length < 7) setApiKeys([...apiKeys, '']);
  };

  const updateImageApiKey = (index: number, val: string) => {
    const arr = [...imageApiKeys];
    arr[index] = val;
    setImageApiKeys(arr);
  };
  const removeImageApiKey = (index: number) => {
    setImageApiKeys(imageApiKeys.filter((_, i) => i !== index));
  };
  const addImageApiKey = () => {
    if (imageApiKeys.length < 3) setImageApiKeys([...imageApiKeys, '']);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" dir="rtl">
      <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[#1a1a1a]">
          <h2 className="text-[var(--text)] font-bold text-lg flex items-center gap-2">
            <Zap className="text-[var(--accent)]" size={20} /> اعدادات الذكاء الاصطناعي (Gemini)
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--text-dim)] hover:text-white rounded-full transition-colors hover:bg-black/20">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
           <p className="text-xs text-[var(--text-dim)] leading-relaxed bg-[rgba(168,85,247,0.1)] p-3 rounded border border-[var(--accent)]">
             يرجى إدخال مفاتيح API الخاصة لتتمكن من استخدام ميزات التدقيق، الإكمال التلقائي، وتعديل الصور. إذا نفذت حصة المفتاح الأول سننتقل للثاني تلقائياً. تحفظ المفاتيح محلياً فقط.
           </p>

           {/* Text API Keys */}
           <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between">
               <label className="text-sm text-[var(--text)] font-bold flex items-center gap-2">
                 <KeyRound size={16} className="text-orange-400"/> مفاتيح API للنصوص (Gemini)
               </label>
               {apiKeys.length < 7 && (
                 <button onClick={addApiKey} className="text-[10px] text-[var(--accent)] flex items-center gap-1 hover:underline">
                   <Plus size={12}/> إضافة مفتاح
                 </button>
               )}
             </div>
             
             {apiKeys.map((key, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-dim)] font-mono w-4">{idx + 1}.</span>
                  <input 
                    type="password"
                    value={key}
                    onChange={e => updateApiKey(idx, e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 bg-[#0f0f0f] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] font-mono text-left"
                    dir="ltr"
                  />
                  {apiKeys.length > 1 && (
                    <button onClick={() => removeApiKey(idx)} className="text-red-500 hover:text-red-400 p-1">
                       <Trash2 size={14}/>
                    </button>
                  )}
                </div>
             ))}
             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-[var(--accent)] hover:underline mr-6">
                الحصول على المفتاح مجاناً من Google AI Studio
             </a>
           </div>

           <div className="h-px bg-[var(--border)] w-full" />

           {/* Image API Keys */}
           <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between">
               <label className="text-sm text-[var(--text)] font-bold flex items-center gap-2">
                 <ImageIcon size={16} className="text-pink-400"/> مفاتيح تعديل الصور (Nano Banana / Gemini Image)
               </label>
               {imageApiKeys.length < 3 && (
                 <button onClick={addImageApiKey} className="text-[10px] text-[var(--accent)] flex items-center gap-1 hover:underline">
                   <Plus size={12}/> إضافة مفتاح
                 </button>
               )}
             </div>
             
             {imageApiKeys.map((key, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-dim)] font-mono w-4">{idx + 1}.</span>
                  <input 
                    type="password"
                    value={key}
                    onChange={e => updateImageApiKey(idx, e.target.value)}
                    placeholder="مفتاح API الخاص بالصور..."
                    className="flex-1 bg-[#0f0f0f] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-pink-500 font-mono text-left"
                    dir="ltr"
                  />
                  {imageApiKeys.length > 1 && (
                    <button onClick={() => removeImageApiKey(idx)} className="text-red-500 hover:text-red-400 p-1">
                       <Trash2 size={14}/>
                    </button>
                  )}
                </div>
             ))}
           </div>

           <div className="h-px bg-[var(--border)] w-full" />

           <div className="flex flex-col gap-2">
             <label className="text-sm text-[var(--text)] font-bold flex items-center gap-2">
               <Bot size={16} className="text-blue-400"/> نوع النموذج السريع (Model) للنصوص
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
             <label className="text-sm text-[var(--text)] font-bold">معرف النموذج المخصص (اختياري)</label>
             <input 
               type="text"
               value={modelName}
               onChange={e => setModelName(e.target.value)}
               className="bg-[#0f0f0f] border border-[var(--border)] p-2 rounded text-xs text-[var(--text-dim)] outline-none focus:border-[var(--accent)] w-full font-mono text-left"
               dir="ltr"
             />
           </div>
        </div>

        <div className="p-4 border-t border-[var(--border)] bg-[#1a1a1a] flex justify-end gap-3 rounded-b-2xl shrink-0">
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
