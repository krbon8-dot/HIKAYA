import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Plus, X, Sparkles, Wand2 } from 'lucide-react';
import { ImageBlock, ImageData } from '../../types';
import { cn, fileToDataUrl, generateId } from '../../lib/utils';

interface Props {
  block: ImageBlock;
  onChange: (updates: Partial<ImageBlock>) => void;
  onClick?: () => void;
}

export default function ImageEditor({ block, onChange, onClick }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track resizing state
  const [resizingImgId, setResizingImgId] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // AI Editing Modal state
  const [aiEditState, setAiEditState] = useState<{ id: string, url: string } | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    
    try {
      const newImages = [...(block.images || [])];
      for (const file of files) {
        const url = await fileToDataUrl(file);
        // Default size is slightly small to allow placing side-by-side easily
        newImages.push({ id: generateId(), url, width: 200, height: 200 });
      }
      onChange({ images: newImages });
    } catch (err) {
      console.error("Failed to read file", err);
    }
  };

  const removeImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ images: (block.images || []).filter(img => img.id !== id) });
  };

  // --- Resize Logic ---
  const handlePointerDown = (e: React.PointerEvent, img: ImageData) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setResizingImgId(img.id);
    setStartPos({
      x: e.clientX,
      y: e.clientY,
      w: img.width || 200,
      h: img.height || 200
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!resizingImgId) return;
    e.stopPropagation();
    e.preventDefault();

    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    
    // Determine new dimensions, allow them to stretch freely
    const newWidth = Math.max(50, startPos.w + dx); // min width 50
    const newHeight = Math.max(50, startPos.h + dy); // min height 50

    const updatedImages = (block.images || []).map(img => 
      img.id === resizingImgId 
        ? { ...img, width: newWidth, height: newHeight }
        : img
    );

    onChange({ images: updatedImages });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!resizingImgId) return;
    e.stopPropagation();
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch { }
    setResizingImgId(null);
  };

  const images = block.images || [];

  if (images.length === 0) {
    return (
      <div 
        className="w-full h-48 border-2 border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50/50 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors text-slate-500"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud size={32} />
        <span>انقر لرفع صور (يمكنك اختيار أكثر من صورة)</span>
        <input 
          type="file" 
          accept="image/*" 
          multiple
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImageUpload}
        />
      </div>
    );
  }

  return (
    <div className="relative group/imageblock py-4 hover:ring-2 hover:ring-purple-200" onClick={onClick} ref={containerRef}>
       <input 
        type="file" 
        accept="image/*" 
        multiple
        className="hidden" 
        id={`img-upload-${block.id}`}
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

       {/* Add Image Button (Visible on hover) */}
       <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/imageblock:opacity-100 transition-opacity z-10 no-print">
         <button 
           onClick={() => fileInputRef.current?.click()}
           className="bg-purple-500 hover:bg-purple-600 text-white p-1.5 rounded-full shadow-lg"
           title="إضافة صورة بجانبها"
         >
           <Plus size={16} />
         </button>
       </div>

       {/* Image Display */}
       <div className={cn(
         "flex w-full flex-wrap gap-4 relative",
         block.align === 'center' ? 'justify-center' : block.align === 'left' ? 'justify-end' : 'justify-start'
       )}>
         {images.map(img => (
           <div 
             key={img.id} 
             className="relative group/singleimg"
             style={{ 
               width: img.width ? `${img.width}px` : '100%', 
               height: img.height ? `${img.height}px` : 'auto' 
             }}
           >
             <button 
               onClick={(e) => removeImage(img.id, e)}
               className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/singleimg:opacity-100 transition-opacity z-10 no-print"
               title="حذف الصورة"
             >
               <X size={12} />
             </button>

             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setAiEditState({ id: img.id, url: img.url });
                  setAiPrompt('');
                }}
                className="absolute top-8 right-1 bg-blue-500/80 hover:bg-blue-600 text-white rounded-full p-2 opacity-0 group-hover/singleimg:opacity-100 transition-opacity z-10 no-print flex items-center justify-center shadow-lg"
                title="تعديل بـ Nano Banana (AI)"
             >
               <Wand2 size={14} />
             </button>

             <img 
                src={img.url} 
                alt="Story illustration" 
                referrerPolicy="no-referrer"
                className="w-full h-full shadow-sm hover:shadow-md transition-shadow select-none block"
                style={{ 
                  borderRadius: block.borderRadius !== undefined ? `${block.borderRadius}px` : '8px',
                  objectFit: 'fill' // to allow free stretching stretching as requested
                }}
                draggable={false}
             />
             
             {/* Resize Handle (Bottom-Right, but RTL usually places it bottom-left. We'll put it bottom-left for ltr drag feel or bottom-left depending on dir ) */}
             <div 
               className="absolute bottom-0 left-0 w-6 h-6 cursor-nwse-resize opacity-0 group-hover/singleimg:opacity-100 bg-purple-500/80 rounded-tr-md flex items-center justify-center pointer-events-auto no-print"
               onPointerDown={(e) => handlePointerDown(e, img)}
               onPointerMove={handlePointerMove}
               onPointerUp={handlePointerUp}
               onPointerCancel={handlePointerUp}
             >
                <div className="w-2 h-2 shrink-0 bg-white rounded-full pointer-events-none" />
             </div>
           </div>
         ))}
       </div>

       {/* AI Edit Modal */}
       {aiEditState && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex justify-center items-center no-print" onClick={(e) => { e.stopPropagation(); setAiEditState(null); }}>
            <div className="bg-[var(--panel)] border border-[var(--border)] w-[450px] max-w-[95vw] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
               <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[#111]">
                 <h3 className="font-bold text-white flex items-center gap-2"><Sparkles className="text-blue-500" size={18}/> تعديل الصورة (Nano Banana)</h3>
                 <button onClick={() => setAiEditState(null)} className="text-[var(--text-dim)] hover:text-white"><X size={20}/></button>
               </div>
               
               <div className="p-6 flex flex-col gap-4">
                  <div className="w-full h-40 bg-black/20 rounded-xl overflow-hidden flex items-center justify-center border border-[var(--border)] relative">
                    <img src={aiEditState.url} alt="Target" className="h-full w-auto object-contain" />
                    {isGeneratingImg && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                         <div className="flex flex-col items-center gap-2 text-white">
                           <Wand2 className="animate-spin text-blue-500" size={24} />
                           <span className="text-sm font-medium">جاري المعالجة...</span>
                         </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-[var(--text-dim)]">ما هو التعديل أو الوصف الجديد للصورة؟</label>
                    <textarea 
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      placeholder="مثال: اجعل الفتاة تبتسم، حول النمط إلى رسم ألوان مائية..."
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-blue-500 resize-none text-[var(--text)]"
                      dir="rtl"
                      readOnly={isGeneratingImg}
                    />
                  </div>
               </div>

               <div className="p-4 bg-[var(--bg)] border-t border-[var(--border)] flex justify-end gap-3 rounded-b-2xl">
                  <button 
                    onClick={() => setAiEditState(null)}
                    disabled={isGeneratingImg}
                    className="px-4 py-2 rounded text-[var(--text)] hover:bg-[#333] transition-colors font-medium border border-[var(--border)]"
                  >
                    إلغاء
                  </button>
                  <button 
                    disabled={!aiPrompt.trim() || isGeneratingImg}
                    onClick={async () => {
                      if(!aiPrompt.trim()) return;
                      setIsGeneratingImg(true);
                      try {
                        const { editImageWithAI } = await import('../../lib/aiService');
                        const newUrl = await editImageWithAI(aiEditState.url, aiPrompt);
                        if (newUrl) {
                           const updatedImages = images.map(i => i.id === aiEditState.id ? { ...i, url: newUrl } : i);
                           onChange({ images: updatedImages });
                           setAiEditState(null);
                        }
                      } finally {
                        setIsGeneratingImg(false);
                      }
                    }}
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold transition-all shadow-lg flex items-center gap-2"
                  >
                     <Wand2 size={16} /> تطبيق التعديل
                  </button>
               </div>
            </div>
          </div>
       )}
    </div>
  );
}
