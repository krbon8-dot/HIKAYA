import React from 'react';
import { X, ZoomIn, ZoomOut, Type, Monitor } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  uiScale: number;
  setUiScale: (val: number) => void;
  a11yMode: boolean;
  setA11yMode: (val: boolean) => void;
  editorZoom: number;
  setEditorZoom: (val: number) => void;
}

export function AccessibilityModal({ isOpen, onClose, uiScale, setUiScale, a11yMode, setA11yMode, editorZoom, setEditorZoom }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex justify-center items-center no-print" dir="rtl">
      <div className="bg-[#121212] border border-[#333] w-[450px] max-w-[90vw] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#1a1a1a]">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Monitor size={18} className="text-blue-400" />
            إعدادات سهولة الوصول والرؤية
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white relative group">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-6 text-white text-sm">
           
           {/* Global Scale */}
           <div className="flex flex-col gap-2">
             <label className="font-bold flex items-center justify-between text-blue-300">
               تكبير الواجهة بالكامل (Global UI)
               <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">يوصى به</span>
             </label>
             <p className="text-xs text-slate-400 mb-1">يُكبر كل شيء في التطبيق: القوائم، الأزرار، والنصوص بنسبة متناسقة.</p>
             <div className="flex gap-4 items-center">
                <button onClick={() => setUiScale(Math.max(12, uiScale - 2))} className="p-2 border border-[#444] rounded bg-[#222] hover:bg-[#333]">
                   <ZoomOut size={16} />
                </button>
                <div className="flex-1 flex flex-col items-center">
                    <span className="font-mono text-lg font-bold">{Math.round((uiScale / 16) * 100)}%</span>
                </div>
                <button onClick={() => setUiScale(Math.min(24, uiScale + 2))} className="p-2 border border-[#444] rounded bg-[#222] hover:bg-[#333]">
                   <ZoomIn size={16} />
                </button>
             </div>
             <button onClick={() => setUiScale(16)} className="text-xs text-slate-500 hover:text-white mt-1 underline">إعادة للوضع الافتراضي (100%)</button>
           </div>

           <div className="h-px bg-[#333] w-full my-1"></div>

           {/* Readability Mode */}
           <div className="flex flex-col gap-2">
             <label className="font-bold flex items-center justify-between text-yellow-300">
                وضع הקراءة المُحسّن (التباين العالي)
             </label>
             <p className="text-xs text-slate-400 mb-3">يزيد من وضوح وسماكة الخطوط (Bold) ويحسن التباين لراحة العين.</p>
             
             <button 
               onClick={() => setA11yMode(!a11yMode)}
               className={cn("w-full py-3 rounded-lg border font-bold flex items-center justify-center gap-2 transition-all", 
                 a11yMode ? "bg-yellow-500 text-black border-yellow-400" : "bg-[#222] text-white border-[#444] hover:border-yellow-500/50"
               )}
             >
                <Type size={18} />
                {a11yMode ? "إيقاف وضع القراءة المحسن" : "تفعيل وضع القراءة المحسن"}
             </button>
           </div>

           <div className="h-px bg-[#333] w-full my-1"></div>

           {/* Content Zoom ONLY */}
           <div className="flex flex-col gap-2">
             <label className="font-bold flex items-center justify-between text-emerald-300">
               تكبير مسودة الكتابة فقط (Content Zoom)
             </label>
             <p className="text-xs text-slate-400 mb-1">يُكبر منطقة المحتوى وصفحة الكتابة فقط دون التأثير على حجم القوائم الجانبية.</p>
             <div className="flex gap-4 items-center">
                <button onClick={() => setEditorZoom(Math.max(0.5, editorZoom - 0.1))} className="p-2 border border-[#444] rounded bg-[#222] hover:bg-[#333]">
                   <ZoomOut size={16} />
                </button>
                <div className="flex-1 flex flex-col items-center">
                    <span className="font-mono text-lg font-bold">{Math.round(editorZoom * 100)}%</span>
                </div>
                <button onClick={() => setEditorZoom(Math.min(3, editorZoom + 0.1))} className="p-2 border border-[#444] rounded bg-[#222] hover:bg-[#333]">
                   <ZoomIn size={16} />
                </button>
             </div>
             <button onClick={() => setEditorZoom(1)} className="text-xs text-slate-500 hover:text-white mt-1 underline">إعادة للوضع الافتراضي (100%)</button>
           </div>

        </div>
      </div>
    </div>
  );
}
