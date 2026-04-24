import React from 'react';
import { ChatBlock } from '../../types';
import { generateId, cn } from '../../lib/utils';
import { Plus, Trash2, Smartphone, AlignLeft, AlignRight } from 'lucide-react';

interface Props {
  block: ChatBlock;
  updateBlock: (updates: Partial<ChatBlock>) => void;
  deleteBlock: () => void;
}

export default function ChatEditor({ block, updateBlock, deleteBlock }: Props) {
  const addMessage = () => {
    const newMessage = {
      id: generateId(),
      sender: 'المتصل',
      content: 'رسالة جديدة...',
      isSelf: false,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };
    updateBlock({ messages: [...block.messages, newMessage] });
  };

  const updateMessage = (id: string, updates: any) => {
    updateBlock({
      messages: block.messages.map(m => m.id === id ? { ...m, ...updates } : m)
    });
  };

  const deleteMessage = (id: string) => {
    updateBlock({
      messages: block.messages.filter(m => m.id !== id)
    });
  };

  return (
    <div className="relative group bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden my-4 max-w-sm mx-auto" dir="rtl">
      
      {/* Header */}
      <div className="bg-slate-100 dark:bg-[#222] border-b border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-slate-500" />
          <input 
            type="text" 
            value={block.title || ''} 
            onChange={e => updateBlock({ title: e.target.value })}
            placeholder="اسم جهة الاتصال..."
            className="bg-transparent border-none outline-none font-bold text-sm w-32 placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={addMessage} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors" title="إضافة رسالة">
            <Plus size={14} />
          </button>
          <button onClick={deleteBlock} className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors" title="حذف المحادثة">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 flex flex-col gap-3 min-h-[100px] max-h-[400px] overflow-y-auto custom-scrollbar" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '100% 20px' }}>
        {block.messages.map((msg, index) => (
          <div key={msg.id} className={cn("flex flex-col relative group/msg", msg.isSelf ? "items-end" : "items-start")}>
            {/* Controls specific to message */}
            <div className={cn("absolute top-0 -mt-5 hidden group-hover/msg:flex items-center gap-1 bg-white border border-slate-200 shadow-sm rounded-full px-1 py-0.5 z-10", msg.isSelf ? "left-0" : "right-0")}>
               <button onClick={() => updateMessage(msg.id, { isSelf: !msg.isSelf })} className="p-1 hover:bg-slate-100 rounded text-slate-500" title="تغيير المرسل">
                  {msg.isSelf ? <AlignRight size={12} /> : <AlignLeft size={12} />}
               </button>
               <button onClick={() => deleteMessage(msg.id)} className="p-1 hover:bg-red-50 text-red-500 rounded">
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
        {block.messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-4">
            لا توجد رسائل. <button onClick={addMessage} className="text-blue-500 hover:underline">أضف رسالة</button>
          </div>
        )}
      </div>
    </div>
  );
}
