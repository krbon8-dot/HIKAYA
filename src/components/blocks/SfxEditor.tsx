import React from 'react';
import { SfxBlock } from '../../types';
import { Trash2, MessageSquare, Volume2, Shapes } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  block: SfxBlock;
  onChange: (updates: Partial<SfxBlock>) => void;
  onClick: () => void;
}

export default function SfxEditor({ block, onChange, onClick }: Props) {
  const arabicWords = ["صراخ!", "بكاء...", "صدمة!", "ترقب...", "خفقان", "صمت...", "ارتجاف", "ابتسامة خبيثة"];
  const symbols = ["❓", "❗️", "⁉️", "💢", "💦", "💨", "💬", "💭", "✨", "🔥"];
  const colors = [
    { value: 'red', label: 'أحمر غامض', cls: 'text-red-500' },
    { value: 'blue', label: 'أزرق بارد', cls: 'text-blue-500' },
    { value: 'purple', label: 'بنفسجي سحري', cls: 'text-purple-500' },
    { value: 'black', label: 'أسود مظلم', cls: 'text-slate-800 dark:text-slate-200' },
  ];

  return (
    <div className="relative group my-6 focus-within:z-10" onClick={onClick} dir="rtl">
      {/* Editor Controls */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-[#222] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-1 gap-1 items-center z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex">
         <select 
            value={block.sfxType}
            onChange={e => onChange({ sfxType: e.target.value as any, text: e.target.value === 'word' ? arabicWords[0] : symbols[0] })}
            className="bg-transparent border-none outline-none text-xs text-slate-600 dark:text-slate-300 px-2 cursor-pointer"
         >
            <option value="word">كلمة / تأثير</option>
            <option value="symbol">رمز هندسي / تعبير</option>
         </select>
         <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
         <select 
            value={block.colorStyle}
            onChange={e => onChange({ colorStyle: e.target.value })}
            className="bg-transparent border-none outline-none text-xs text-slate-600 dark:text-slate-300 px-2 cursor-pointer"
         >
            {colors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
         </select>
         <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
         <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded px-1">
            <button onClick={() => onChange({ align: 'right' })} className={cn("p-1 rounded", block.align === 'right' ? "bg-white dark:bg-[#333] shadow-sm" : "")}>R</button>
            <button onClick={() => onChange({ align: 'center' })} className={cn("p-1 rounded", block.align === 'center' ? "bg-white dark:bg-[#333] shadow-sm" : "")}>C</button>
            <button onClick={() => onChange({ align: 'left' })} className={cn("p-1 rounded", block.align === 'left' ? "bg-white dark:bg-[#333] shadow-sm" : "")}>L</button>
         </div>
      </div>

      <div className={cn("w-full flex", block.align === 'left' ? "justify-end text-left" : block.align === 'right' ? "justify-start text-right" : "justify-center text-center")}>
         {block.sfxType === 'word' ? (
            <div className="flex flex-col items-center">
               <input 
                  value={block.text}
                  onChange={e => onChange({ text: e.target.value })}
                  className={cn("bg-transparent border-none outline-none text-4xl font-black tracking-widest placeholder:text-slate-300 text-center", colors.find(c => c.value === block.colorStyle)?.cls)}
                  style={{ fontFamily: "'Aref Ruqaa', serif", textShadow: block.colorStyle === 'black' ? 'none' : '0px 4px 15px currentColor' }}
                  placeholder="مؤثر صوتي..."
               />
               <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {arabicWords.map(w => (
                     <button key={w} onClick={() => onChange({ text: w })} className="px-2 py-1 text-[10px] bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 text-slate-600 dark:text-slate-300">{w}</button>
                  ))}
               </div>
            </div>
         ) : (
            <div className="flex flex-col items-center">
               <input 
                  value={block.text}
                  onChange={e => onChange({ text: e.target.value })}
                  className={cn("bg-transparent border-none outline-none text-6xl text-center", colors.find(c => c.value === block.colorStyle)?.cls)}
                  placeholder="❓"
               />
               <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {symbols.map(s => (
                     <button key={s} onClick={() => onChange({ text: s })} className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200">{s}</button>
                  ))}
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
