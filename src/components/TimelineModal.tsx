import React, { useState } from 'react';
import { ProjectData, StoryEvent } from '../types';
import { X, Clock, CalendarHeart, Trash2, Plus, Edit } from 'lucide-react';
import { cn, generateId } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
  updateProject?: (updates: Partial<ProjectData>) => void;
}

export function TimelineModal({ isOpen, onClose, project, updateProject }: Props) {
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  if (!isOpen) return null;

  const events = [...(project.events || [])].sort((a, b) => a.order - b.order);

  const handleAddEvent = () => {
    if (!updateProject) return;
    const newEvent: StoryEvent = {
        id: generateId(),
        title: 'حدث جديد',
        description: '',
        timestamp: 'سنة 1',
        order: events.length > 0 ? events[events.length - 1].order + 1 : 0
    };
    updateProject({ events: [...events, newEvent] });
    setEditingEventId(newEvent.id);
  };

  const updateEvent = (id: string, updates: Partial<StoryEvent>) => {
      if (!updateProject) return;
      updateProject({ events: events.map(e => e.id === id ? { ...e, ...updates } : e) });
  };

  const deleteEvent = (id: string) => {
      if (!updateProject) return;
      updateProject({ events: events.filter(e => e.id !== id) });
      if (editingEventId === id) setEditingEventId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex justify-center items-center no-print" dir="rtl">
      <div className="bg-[#121212] border border-[#333] w-[900px] max-w-[95vw] h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#1a1a1a]">
          <div className="flex items-center gap-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-xl">
                <Clock className="text-emerald-500" />
                الخط الزمني المتشابك
              </h3>
              {updateProject && (
                  <button onClick={handleAddEvent} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 transition-colors">
                      <Plus size={14} /> إضافة حدث
                  </button>
              )}
          </div>
          <button onClick={() => { onClose(); setEditingEventId(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-8 flex flex-col bg-[#0a0a0a] relative custom-scrollbar">
           
           {events.length === 0 ? (
             <div className="text-slate-500 text-lg flex flex-col items-center justify-center h-full gap-4">
                <Clock size={48} className="opacity-20" />
                <p>لا توجد أحداث زمنية مضافة بعد. أضف أحداثاً لتتبع مسار القصة هنا.</p>
             </div>
           ) : (
             <div className="relative border-r-4 border-[#333] pr-6 py-4 flex flex-col gap-10 min-h-max mr-10">
               {events.map((event, index) => (
                 <div key={event.id} className="relative group">
                   <div className="absolute -right-[35px] top-0 w-6 h-6 rounded-full border-4 border-[#0a0a0a] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10 group-hover:scale-125 transition-transform" />
                   
                   <div className={cn("bg-[#111] border rounded-xl p-5 shadow-lg group-hover:border-emerald-500/50 transition-colors", editingEventId === event.id ? "border-emerald-500" : "border-[#222]")}>
                      
                      {editingEventId === event.id ? (
                          <div className="flex flex-col gap-3">
                              <div className="flex gap-2">
                                  <input 
                                     value={event.title} 
                                     onChange={(e) => updateEvent(event.id, { title: e.target.value })} 
                                     className="bg-[#222] border border-[#333] text-emerald-400 font-bold px-3 py-2 rounded-lg flex-1 outline-none focus:border-emerald-500" 
                                     placeholder="عنوان الحدث"
                                  />
                                  <input 
                                     value={event.timestamp} 
                                     onChange={(e) => updateEvent(event.id, { timestamp: e.target.value })} 
                                     className="bg-[#222] border border-[#333] text-emerald-200 font-mono px-3 py-2 rounded-lg w-32 outline-none focus:border-emerald-500" 
                                     placeholder="سنة 1، يوم 5"
                                  />
                                  <input 
                                     type="number"
                                     value={event.order} 
                                     onChange={(e) => updateEvent(event.id, { order: Number(e.target.value) })} 
                                     className="bg-[#222] border border-[#333] text-slate-300 font-mono px-3 py-2 rounded-lg w-20 outline-none title='الترتيب'" 
                                     placeholder="الترتيب"
                                  />
                              </div>
                              <textarea 
                                  value={event.description} 
                                  onChange={(e) => updateEvent(event.id, { description: e.target.value })} 
                                  className="bg-[#222] border border-[#333] text-slate-300 px-3 py-2 rounded-lg w-full h-24 resize-none outline-none focus:border-emerald-500" 
                                  placeholder="تفاصيل وحبكة الحدث..."
                              />
                              <div className="flex items-center justify-between">
                                  <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                                      <input type="checkbox" checked={event.isFlashback || false} onChange={e => updateEvent(event.id, { isFlashback: e.target.checked })} />
                                      هذا الحدث فلاش باك (Flashback)
                                  </label>
                                  <div className="flex gap-2">
                                     <button onClick={() => deleteEvent(event.id)} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 rounded transition-colors text-sm">حذف</button>
                                     <button onClick={() => setEditingEventId(null)} className="bg-[#333] text-white hover:bg-[#444] px-4 py-1.5 rounded transition-colors text-sm font-bold">إغلاق التعديل</button>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <>
                              <div className="flex justify-between items-start mb-2 group/edit">
                                <h4 className="text-lg font-bold text-emerald-400">{event.title}</h4>
                                <div className="flex items-center gap-2">
                                  {updateProject && (
                                     <button onClick={() => setEditingEventId(event.id)} className="opacity-0 group-hover/edit:opacity-100 text-slate-500 hover:text-white transition-opacity p-1">
                                        <Edit size={14} />
                                     </button>
                                  )}
                                  <span className="text-xs bg-[#222] px-2 py-1 rounded-md text-emerald-200 font-mono border border-[#333]">
                                     {event.timestamp}
                                  </span>
                                </div>
                              </div>
                              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
                              
                              <div className="flex gap-2 mt-4 flex-wrap">
                                {event.isFlashback && (
                                  <span className="flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded border border-purple-500/30">
                                    <CalendarHeart size={12} /> فلاش باك
                                  </span>
                                )}
                                {event.relatedCharacterIds?.map(cId => {
                                  const c = project.characters?.find(ch => ch.id === cId);
                                  return c ? (
                                    <span key={c.id} className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30">
                                      <img src={c.avatarUrl} className="w-3 h-3 rounded-full object-cover" /> {c.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                          </>
                      )}
                   </div>
                 </div>
               ))}
               
               <div className="absolute -right-[27px] bottom-0 w-4 h-4 rounded-full bg-[#333] z-10" />
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
