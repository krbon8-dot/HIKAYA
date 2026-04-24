import React from 'react';
import { DocumentBlock } from '../../types';
import { Book, FileText, FolderLock, Quote, Eye, Timer, Trash2, Smartphone, Plus, AlignLeft, AlignRight, Terminal, Brain, MessageCircle, Sparkles } from 'lucide-react';
import { cn, generateId } from '../../lib/utils';

interface Props {
  block: DocumentBlock;
  updateBlock: (updates: Partial<DocumentBlock>) => void;
  deleteBlock: () => void;
}

export default function DocumentEditor({ block, updateBlock, deleteBlock }: Props) {
  
  const options = [
    { value: 'journal', label: 'مذكرات / وثيقة قديمة', icon: Book },
    { value: 'newspaper', label: 'قصاصة إخبارية', icon: FileText },
    { value: 'dossier', label: 'ملف سري', icon: FolderLock },
    { value: 'epigraph', label: 'اقتباس افتتاحي', icon: Quote },
    { value: 'vision', label: 'رؤية / فلاش باك', icon: Eye },
    { value: 'timer', label: 'عد تنازلي / طابع زمني', icon: Timer },
    { value: 'chat', label: 'محادثة هاتف', icon: Smartphone },
    { value: 'subtext', label: 'الظاهر والباطن', icon: Brain },
    { value: 'terminal', label: 'سجل الاختراق', icon: Terminal },
    { value: 'rumor', label: 'طاحونة الشائعات', icon: MessageCircle },
    { value: 'prophecy', label: 'نبوءة مشفرة', icon: Sparkles },
  ];

  const CurrentIcon = options.find(o => o.value === block.docType)?.icon || FileText;

  const addMessage = () => {
    const newMessage = {
      id: generateId(),
      sender: 'المتصل',
      content: 'رسالة جديدة...',
      isSelf: false,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };
    updateBlock({ messages: [...(block.messages || []), newMessage] });
  };

  const updateMessage = (id: string, updates: any) => {
    updateBlock({
      messages: (block.messages || []).map(m => m.id === id ? { ...m, ...updates } : m)
    });
  };

  const deleteMessage = (id: string) => {
    updateBlock({
      messages: (block.messages || []).filter(m => m.id !== id)
    });
  };

  const addDocItem = (defaultVal: any) => {
    updateBlock({ items: [...(block.items || []), { id: generateId(), ...defaultVal }] });
  };

  const updateDocItem = (id: string, updates: any) => {
    updateBlock({ items: (block.items || []).map(i => i.id === id ? { ...i, ...updates } : i) });
  };

  const deleteDocItem = (id: string) => {
    updateBlock({ items: (block.items || []).filter(i => i.id !== id) });
  };

  return (
    <div className="relative group my-8 max-w-3xl mx-auto focus-within:z-10" dir="rtl">

      {/* Top Controls */}
      <div className="absolute -top-10 right-0 bg-white dark:bg-[#222] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-1 gap-1 items-center z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex">
         <div className="flex items-center gap-1.5 px-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
            <CurrentIcon size={14} />
            <select
               value={block.docType}
               onChange={e => updateBlock({ docType: e.target.value as any })}
               className="bg-transparent border-none outline-none text-xs font-bold py-1.5 cursor-pointer"
            >
               {options.map(o => (
                  <option key={o.value} value={o.value} className="bg-white dark:bg-[#222] text-black dark:text-white">
                     {o.label}
                  </option>
               ))}
            </select>
         </div>
         <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
         <button onClick={deleteBlock} className="p-1.5 hover:bg-red-500/10 text-red-500 rounded transition-colors text-xs flex items-center gap-1">
            <Trash2 size={14} />
         </button>
      </div>

      {/* Render Document Type */}
      <div className="relative transition-all duration-500">
        
        {/* JOURNAL / PARCHMENT */}
        {block.docType === 'journal' && (
           <div className="bg-[#fdf6e3] text-[#5c4a3d] p-8 md:p-12 shadow-[0_4px_15px_rgba(0,0,0,0.05)] rounded-sm border border-[#eaddc5] relative" 
                style={{ 
                   backgroundImage: 'radial-gradient(#eaddc5 1px, transparent 1px)', 
                   backgroundSize: '20px 20px',
                   boxShadow: 'inset 0 0 50px rgba(139,115,85,0.1), 0 5px 15px rgba(0,0,0,0.05)'
                }}>
             <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/40 to-transparent pointer-events-none" />
             <input 
                value={block.metadata || ''} 
                onChange={e => updateBlock({ metadata: e.target.value })}
                placeholder="التاريخ / المكان..."
                className="bg-transparent border-none outline-none font-mono text-sm text-[#8b7355] mb-6 block w-full placeholder:text-[#c4b69c]"
             />
             <textarea 
                value={block.content}
                onChange={e => {
                   updateBlock({ content: e.target.value });
                   e.target.style.height = 'auto';
                   e.target.style.height = e.target.scrollHeight + 'px';
                }}
                placeholder="نص المذكرات..."
                className="w-full bg-transparent border-none outline-none resize-none text-lg md:text-xl leading-relaxed italic placeholder:text-[#c4b69c]"
                style={{ fontFamily: "Georgia, serif" }}
                rows={3}
             />
           </div>
        )}

        {/* NEWSPAPER CLIPPING */}
        {block.docType === 'newspaper' && (
           <div className="bg-[#f4f4f4] text-[#111] p-6 shadow-md border-y-4 border-[#333] max-w-2xl mx-auto" style={{ fontFamily: "Times New Roman, serif" }}>
              <div className="border-b-2 border-[#333] pb-4 mb-4 text-center flex flex-col gap-2">
                 <input 
                    value={block.metadata || ''}
                    onChange={e => updateBlock({ metadata: e.target.value })}
                    placeholder="اسم الصحيفة - التاريخ"
                    className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest text-center w-full text-slate-500 placeholder:text-slate-400"
                 />
                 <input 
                    value={block.title || ''}
                    onChange={e => updateBlock({ title: e.target.value })}
                    placeholder="عنوان الخبر الرئيسي"
                    className="bg-transparent border-none outline-none text-3xl md:text-5xl font-bold uppercase text-center w-full font-serif leading-tight placeholder:text-slate-300"
                 />
              </div>
              <textarea 
                 value={block.content}
                 onChange={e => {
                    updateBlock({ content: e.target.value });
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                 }}
                 placeholder="محتوى الخبر الإخباري..."
                 className="w-full bg-transparent border-none outline-none resize-none text-justify text-sm leading-snug columns-1 sm:columns-2 gap-6 placeholder:text-slate-400"
                 rows={4}
              />
           </div>
        )}

        {/* CLASSIFIED DOSSIER */}
        {block.docType === 'dossier' && (
           <div className="bg-[#fdfdfd] border-2 border-red-800 p-8 shadow-lg max-w-xl mx-auto relative overflow-hidden font-mono text-[#222]">
              <div className="absolute top-4 left-4 border-4 border-red-600 rounded text-red-600 font-bold text-2xl px-2 py-1 rotate-12 opacity-80 select-none pointer-events-none">
                 TOP SECRET
              </div>
              <div className="border-b border-black/30 pb-4 mb-4 flex items-end gap-4 relative z-10">
                 <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">File No.</span>
                    <input 
                       value={block.metadata || ''}
                       onChange={e => updateBlock({ metadata: e.target.value })}
                       className="bg-transparent border-none outline-none text-lg font-bold w-full uppercase placeholder:text-slate-300"
                       placeholder="XX-990-A"
                    />
                 </div>
                 <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Subject</span>
                    <input 
                       value={block.title || ''}
                       onChange={e => updateBlock({ title: e.target.value })}
                       className="bg-transparent border-none outline-none text-lg font-bold w-full uppercase placeholder:text-slate-300 border-b border-black border-dashed"
                       placeholder="SUBJECT NAME"
                    />
                 </div>
              </div>
              <textarea 
                 value={block.content}
                 onChange={e => {
                    updateBlock({ content: e.target.value });
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                 }}
                 placeholder="التفاصيل السرية..."
                 className="w-full bg-transparent border-none outline-none resize-none text-sm leading-loose placeholder:text-slate-300"
                 rows={4}
              />
           </div>
        )}

        {/* EPIGRAPH */}
        {block.docType === 'epigraph' && (
           <div className="max-w-md mx-auto my-12 text-center text-slate-600 dark:text-slate-400">
              <Quote className="mx-auto mb-4 opacity-20" size={32} />
              <textarea 
                 value={block.content}
                 onChange={e => {
                    updateBlock({ content: e.target.value });
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                 }}
                 placeholder="اقتباس فلسفي أو قصيدة صغيرة..."
                 className="w-full bg-transparent border-none outline-none resize-none text-lg leading-relaxed italic text-center placeholder:text-slate-300 dark:placeholder:text-slate-700"
                 rows={3}
                 style={{ fontFamily: "Georgia, serif" }}
              />
              <input 
                 value={block.title || ''}
                 onChange={e => updateBlock({ title: e.target.value })}
                 placeholder="- قائل الاقتباس"
                 className="bg-transparent border-none outline-none font-bold text-sm text-center w-full mt-4 uppercase tracking-widest"
              />
           </div>
        )}

        {/* VISION / MEMORY */}
        {block.docType === 'vision' && (
           <div className="my-8 p-8 rounded-full border border-purple-500/30 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent relative blur-[0.5px] hover:blur-none transition-all duration-700">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-screen" />
              <textarea 
                 value={block.content}
                 onChange={e => {
                    updateBlock({ content: e.target.value });
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                 }}
                 placeholder="رؤية ضبابية تتدفق في عقل الشخصية..."
                 className="w-full bg-transparent border-none outline-none resize-none text-xl leading-relaxed text-center text-purple-600 dark:text-purple-300 italic placeholder:text-purple-300 dark:placeholder:text-purple-900 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                 rows={2}
                 style={{ letterSpacing: '0.05em' }}
              />
           </div>
        )}

        {/* COUNTDOWN TIMER */}
        {block.docType === 'timer' && (
           <div className="my-8 bg-black border border-slate-800 p-6 rounded-2xl max-w-sm mx-auto shadow-2xl relative overflow-hidden flex flex-col items-center justify-center font-mono">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
              <input 
                 value={block.title || ''}
                 onChange={e => updateBlock({ title: e.target.value })}
                 placeholder="الوقت المتبقي..."
                 className="bg-transparent border-none outline-none text-red-500 text-4xl font-bold tracking-[0.2em] text-center w-full placeholder:text-red-900/50"
                 style={{ textShadow: '0 0 10px rgba(239,68,68,0.5)' }}
              />
              <input 
                 value={block.metadata || ''}
                 onChange={e => updateBlock({ metadata: e.target.value })}
                 placeholder="قبل الانفجار"
                 className="bg-transparent border-none outline-none text-slate-500 text-sm tracking-widest text-center w-full mt-2 uppercase placeholder:text-slate-800"
              />
           </div>
        )}

        {/* CYBER TERMINAL */}
        {block.docType === 'terminal' && (
           <div className="bg-black border border-green-500/30 p-6 rounded-lg max-w-2xl mx-auto shadow-[0_0_20px_rgba(34,197,94,0.15)] font-mono text-green-500 relative overflow-hidden" dir="ltr">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20 animate-pulse" />
              <div className="flex items-center gap-2 mb-4 border-b border-green-500/30 pb-2 text-xs opacity-70">
                 <Terminal size={14} />
                 <span>SYS.TERMINAL // SECURE_LINK // USER_ROOT</span>
              </div>
              <textarea 
                 value={block.content}
                 onChange={e => {
                    updateBlock({ content: e.target.value });
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                 }}
                 placeholder="> init_hack_sequence...&#10;> fetching_logs..."
                 className="w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed placeholder:text-green-900/50"
                 rows={6}
                 style={{ textShadow: "0 0 5px rgba(34,197,94,0.5)" }}
              />
           </div>
        )}

        {/* SUBTEXT / INTERNAL MONOLOGUE */}
        {block.docType === 'subtext' && (
           <div className="max-w-2xl mx-auto my-8 flex flex-col gap-4 relative">
              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg mb-2">
                 <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                    <Brain size={16} /> <span>الظاهر والباطن</span>
                 </div>
                 <button onClick={() => addDocItem({ spoken: 'ما يقال...', thought: 'ما يفكر به...' })} className="text-blue-500 hover:text-blue-600 text-xs font-bold">+ إضافة عبارة</button>
              </div>
              {(block.items || []).map((item, idx) => (
                 <div key={item.id} className="relative group/subtext grid grid-cols-2 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col relative">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest absolute -top-2 bg-white dark:bg-slate-900 px-1 -mt-2">Spoken (الظاهر)</span>
                       <textarea 
                          value={item.spoken}
                          onChange={e => updateDocItem(item.id, { spoken: e.target.value })}
                          className="bg-transparent border-none outline-none resize-none text-sm text-slate-800 dark:text-slate-200 mt-2"
                          rows={2}
                       />
                    </div>
                    <div className="flex flex-col relative border-r border-dashed border-slate-300 dark:border-slate-700 pr-4">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest absolute -top-2 bg-white dark:bg-slate-900 px-1 -mt-2 text-purple-500">Thought (الباطن)</span>
                       <textarea 
                          value={item.thought}
                          onChange={e => updateDocItem(item.id, { thought: e.target.value })}
                          className="bg-transparent border-none outline-none resize-none text-sm text-purple-600 dark:text-purple-400 italic mt-2"
                          rows={2}
                       />
                    </div>
                    <button onClick={() => deleteDocItem(item.id)} className="absolute -left-3 -top-3 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/subtext:opacity-100 shadow-sm border border-red-200"><Trash2 size={12} /></button>
                 </div>
              ))}
           </div>
        )}

        {/* THE RUMOR MILL */}
        {block.docType === 'rumor' && (
           <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl max-w-2xl mx-auto border border-slate-200 dark:border-slate-700/50 shadow-inner">
              <div className="flex justify-between items-center mb-6">
                 <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <MessageCircle className="text-amber-500" /> طاحونة الشائعات
                 </h4>
                 <button onClick={() => addDocItem({ text: 'شائعة جديدة...', status: 'unverified' })} className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded text-sm hover:bg-amber-500/20 transition-colors">+ شائعة</button>
              </div>
              <div className="flex flex-col gap-3">
                 {(block.items || []).map(item => (
                    <div key={item.id} className="flex gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 relative group/rumor items-start">
                       <div className="flex flex-col gap-1 w-24 shrink-0">
                          <select 
                             value={item.status}
                             onChange={e => updateDocItem(item.id, { status: e.target.value })}
                             className={cn("text-xs font-bold p-1 rounded outline-none border-none", 
                                item.status === 'true' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                item.status === 'false' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                             )}
                          >
                             <option value="unverified">غير مؤكدة</option>
                             <option value="true">حقيقة</option>
                             <option value="false">كذبة</option>
                          </select>
                       </div>
                       <textarea 
                          value={item.text}
                          onChange={e => {
                             updateDocItem(item.id, { text: e.target.value });
                             e.target.style.height = 'auto';
                             e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          className="bg-transparent border-none outline-none resize-none text-sm text-slate-700 dark:text-slate-300 w-full"
                          rows={1}
                       />
                       <button onClick={() => deleteDocItem(item.id)} className="opacity-0 group-hover/rumor:opacity-100 text-red-500 px-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={14} /></button>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* CRYPTIC PROPHECY */}
        {block.docType === 'prophecy' && (
           <div className="bg-[#0f172a] text-cyan-400 p-8 border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.15)] max-w-2xl mx-auto text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%2306b6d4\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
              <div className="text-2xl font-bold tracking-[0.5em] mb-6 opacity-30 select-none text-cyan-500" style={{fontFamily: "monospace"}}>
                 <input 
                    value={block.title || '⍙☿▲⎍⍙'}
                    onChange={e => updateBlock({ title: e.target.value })}
                    className="bg-transparent border-none outline-none text-center w-full"
                    placeholder="الرموز السرية..."
                 />
              </div>
              <textarea 
                 value={block.content}
                 onChange={e => {
                    updateBlock({ content: e.target.value });
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                 }}
                 placeholder="نص النبوءة المشفرة..."
                 className="w-full bg-transparent border-none outline-none resize-none text-lg text-cyan-100 placeholder:text-cyan-900/50 leading-loose text-center relative z-10"
                 rows={4}
                 style={{ textShadow: "0 0 10px rgba(6,182,212,0.5)" }}
              />
              <input 
                 value={block.metadata || ''}
                 onChange={e => updateBlock({ metadata: e.target.value })}
                 placeholder="- المصدر أو التفسير..."
                 className="mt-6 bg-transparent border-none outline-none text-center w-full text-xs text-cyan-700/70 relative z-10 uppercase tracking-widest"
              />
           </div>
        )}

        {/* CHAT / SMARTPHONE */}
        {block.docType === 'chat' && (
           <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden my-4 max-w-sm mx-auto font-sans" dir="rtl">
              {/* Header */}
              <div className="bg-slate-100 dark:bg-[#222] border-b border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-slate-500" />
                  <input 
                    type="text" 
                    value={block.title || ''} 
                    onChange={e => updateBlock({ title: e.target.value })}
                    placeholder="اسم جهة الاتصال..."
                    className="bg-transparent border-none outline-none font-bold text-sm w-32 placeholder:text-slate-400 text-black dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={addMessage} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors" title="إضافة رسالة">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 flex flex-col gap-3 min-h-[100px] max-h-[400px] overflow-y-auto custom-scrollbar" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '100% 20px' }}>
                {(block.messages || []).map((msg, index) => (
                  <div key={msg.id} className={cn("flex flex-col relative group/msg", msg.isSelf ? "items-end" : "items-start")}>
                    {/* Controls specific to message */}
                    <div className={cn("absolute top-0 -mt-5 hidden group-hover/msg:flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-full px-1 py-0.5 z-10", msg.isSelf ? "left-0" : "right-0")}>
                       <button onClick={() => updateMessage(msg.id, { isSelf: !msg.isSelf })} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500" title="تغيير المرسل">
                          {msg.isSelf ? <AlignRight size={12} /> : <AlignLeft size={12} />}
                       </button>
                       <button onClick={() => deleteMessage(msg.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded">
                          <Trash2 size={12} />
                       </button>
                    </div>

                    {/* Sender Name (only if not self) */}
                    {!msg.isSelf && (
                      <input 
                         value={msg.sender}
                         onChange={e => updateMessage(msg.id, { sender: e.target.value })}
                         className="text-[10px] text-slate-500 bg-transparent border-none outline-none mb-1 px-1 w-24"
                         placeholder="المرسل..."
                      />
                    )}

                    {/* Bubble */}
                    <div className={cn(
                       "px-3 py-2 rounded-2xl max-w-[85%] text-sm group-focus-within/msg:ring-1 ring-blue-400 relative",
                       msg.isSelf ? "bg-blue-500 text-white rounded-tl-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tr-sm"
                    )}>
                      <textarea 
                        value={msg.content}
                        onChange={e => {
                          updateMessage(msg.id, { content: e.target.value });
                          e.target.style.height = 'auto'; // Reset height
                          e.target.style.height = e.target.scrollHeight + 'px'; // Set to scroll height
                        }}
                        className={cn("bg-transparent border-none outline-none resize-none w-full min-h-[24px] overflow-hidden leading-relaxed", msg.isSelf ? "text-white placeholder:text-blue-200" : "text-inherit placeholder:text-slate-400")}
                        placeholder="الرسالة..."
                        rows={1}
                        onFocus={e => {
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                      />
                      <div className={cn("text-[9px] mt-1 text-right opacity-70", msg.isSelf ? "text-blue-100" : "text-slate-500")}>
                        <input 
                          value={msg.time || ''}
                          onChange={e => updateMessage(msg.id, { time: e.target.value })}
                          placeholder="10:00 م"
                          className="bg-transparent border-none outline-none w-12 text-left"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!block.messages || block.messages.length === 0) && (
                  <div className="text-center text-slate-400 text-sm py-4">
                    لا توجد رسائل. <button onClick={addMessage} className="text-blue-500 hover:underline">أضف رسالة</button>
                  </div>
                )}
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
