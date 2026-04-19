import React, { useRef, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import { DialogueBlock } from '../../types';
import { cn, fileToDataUrl } from '../../lib/utils';

interface Props {
  block: DialogueBlock;
  onChange: (updates: Partial<DialogueBlock>) => void;
  onClick?: () => void;
}

export default function DialogueEditor({ block, onChange, onClick }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [block.text]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      onChange({ avatarUrl: url });
    } catch (err) {
      console.error(err);
    }
  };

  const isRtl = block.direction === 'rtl';

  return (
    <div className="relative group/dialogue py-4 flex flex-col" onClick={onClick}>
       {/* Layout */}
       <div className={cn(
         "flex items-start gap-4",
         isRtl ? "flex-row" : "flex-row-reverse" // FIX: Visual alignment for RTL layout handling
       )}>
          {/* Avatar Area */}
          <div 
            className="flex-shrink-0"
            style={{ 
              width: block.avatarSize ? `${block.avatarSize}px` : '128px',
              height: block.avatarSize ? `${block.avatarSize}px` : '128px'
            }}
          >
             {block.avatarUrl ? (
               <div 
                 className="w-full h-full rounded-md shadow-md border-2 border-black overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                 onClick={() => fileInputRef.current?.click()}
                 title="تغيير الشخصية"
               >
                 <img src={block.avatarUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover pointer-events-none" style={{ imageRendering: 'high-quality' }} alt="Avatar" />
               </div>
             ) : (
                <div 
                  className="w-full h-full rounded-md border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] bg-[rgba(255,255,255,0.05)] flex flex-col items-center justify-center cursor-pointer text-[var(--text-dim)] hover:text-white transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  title="اختر صورة من الجانب أو اضغط للرفع"
                >
                  <UploadCloud size={24} className="mb-1"/>
                  <span className="text-[10px] text-center w-full px-1">رفع/أو من الجانب</span>
                </div>
             )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />
          </div>

          {/* Bubble Area */}
          <div className={cn(
            "flex-grow flex flex-col relative",
            isRtl ? "items-start mt-2" : "items-end mt-2"
          )}>
            <div 
              className={cn(
                "relative bg-white p-4 sm:p-6 shadow-sm border-2 border-black min-h-[80px]",
                block.bubbleType === 'speech' && "rounded-3xl",
                block.bubbleType === 'thought' && "rounded-[2rem] border-dashed border-2",
                block.bubbleType === 'shout' && "rounded-none",
                block.bubbleType === 'whisper' && "rounded-2xl opacity-75 scale-95 origin-bottom",
                block.bubbleType === 'electronic' && "rounded-sm",
                block.bubbleType === 'scared' && "rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%]",
                block.bubbleType === 'narrator' && "rounded-none border-t-4 border-b-4 border-l-0 border-r-0 !bg-transparent !shadow-none !border-black",
                block.bubbleType === 'system' && "rounded-sm border border-slate-500 !bg-slate-900 !text-green-400 font-mono shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]",
                // Dynamic border radius to suggest speech direction
                block.bubbleType === 'speech' && (isRtl ? "rounded-tr-sm" : "rounded-tl-sm")
              )} 
              style={{ 
                backgroundColor: (block.bubbleType === 'narrator' || block.bubbleType === 'system') ? undefined : (block.bubbleColor || '#ffffff'),
                resize: 'both',
                overflow: 'auto',
                borderStyle: block.bubbleType === 'whisper' ? 'dotted' : block.bubbleType === 'thought' ? 'dashed' : 'solid',
                borderWidth: block.bubbleType === 'electronic' ? '4px' : (block.bubbleType === 'narrator' ? undefined : '2px'),
                minWidth: '200px',
                minHeight: '80px',
                width: block.bubbleWidth || 'auto',
                height: block.bubbleHeight || 'auto',
                maxWidth: '100%',
                direction: isRtl ? 'rtl' : 'ltr'
              }}
               onMouseUp={(e) => {
                 const el = e.currentTarget;
                 if (el.offsetWidth && el.offsetHeight) {
                   onChange({ bubbleWidth: el.offsetWidth, bubbleHeight: el.offsetHeight });
                 }
               }}
             >
                {/* SVG Tail for speech bubbles */}
                {block.bubbleType === 'speech' && (
                  <svg 
                    className={cn(
                      "absolute top-6 w-6 h-6 z-10 pointer-events-none",
                      isRtl ? "-right-[14px] rotate-180" : "-left-[14px]"
                    )}
                    style={{ filter: "drop-shadow(-2px 0px 0px rgba(0,0,0,1))", color: block.bubbleColor || '#ffffff' }}
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    preserveAspectRatio="none"
                  >
                    <path d="M24 4L0 12L24 20V4Z" />
                  </svg>
                )}

                <textarea
                  ref={textareaRef}
                  value={block.text}
                  onChange={(e) => onChange({ text: e.target.value })}
                  placeholder="حوار..."
                  className={cn(
                    "w-full h-full bg-transparent resize-none outline-none font-medium text-lg leading-relaxed text-slate-800",
                    block.bubbleType === 'shout' && "font-bold text-xl",
                    block.bubbleType === 'thought' && "italic text-slate-500",
                    block.bubbleType === 'whisper' && "italic text-sm text-slate-400",
                    block.bubbleType === 'electronic' && "font-mono text-sm tracking-tighter"
                  )}
                  style={{ 
                    fontFamily: block.fontFamily ? `var(--font-${block.fontFamily})` : undefined
                  }}
                />
             </div>
          </div>
       </div>
    </div>
  );
}
