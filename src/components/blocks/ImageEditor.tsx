import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Plus, X } from 'lucide-react';
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
             >
               <X size={12} />
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
    </div>
  );
}
