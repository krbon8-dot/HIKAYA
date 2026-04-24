import React from 'react';
import { QuestBlock, InventoryItem, RpgStat } from '../../types';
import { Shield, Sparkles, Target, Trash2, CheckCircle2, Circle, Backpack, TrendingUp, Plus, Minus } from 'lucide-react';
import { cn, generateId } from '../../lib/utils';

interface Props {
  block: QuestBlock;
  updateBlock: (updates: Partial<QuestBlock>) => void;
  deleteBlock: () => void;
}

export default function QuestEditor({ block, updateBlock, deleteBlock }: Props) {
  const mode = block.mode || 'quest';

  const addInvItem = () => {
    updateBlock({
      inventoryItems: [...(block.inventoryItems || []), { id: generateId(), name: 'عنصر جديد', quantity: '1', desc: 'الوصف...' }]
    });
  };

  const addStat = () => {
    updateBlock({
      stats: [...(block.stats || []), { id: generateId(), name: 'HP', value: '100', maxValue: '100', color: 'bg-red-500' }]
    });
  };

  return (
    <div className="relative group bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden my-6 max-w-2xl mx-auto shadow-[0_0_15px_rgba(0,0,0,0.5)] font-mono text-slate-300 transition-all focus-within:border-amber-500/50 focus-within:shadow-[0_0_20px_rgba(245,158,11,0.2)]" dir="rtl">
      
       {/* Game UI Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className={mode === 'quest' ? "text-amber-500" : mode === 'choice' ? "text-purple-400" : "text-blue-400"} />
            <select
               value={mode}
               onChange={e => updateBlock({ mode: e.target.value as any })}
               className="bg-transparent border-none outline-none font-bold tracking-wider text-sm text-white appearance-none cursor-pointer"
            >
               <option value="quest" className="bg-slate-800 text-amber-500">QUEST (مهمة)</option>
               <option value="inventory" className="bg-slate-800 text-blue-400">INVENTORY & STATS (مخزون وقدرات)</option>
               <option value="choice" className="bg-slate-800 text-purple-400">DECISION (قرار وتصويت)</option>
               <option value="spell" className="bg-slate-800 text-emerald-400">SPELL / RITUAL (تعويذة وطقوس)</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {mode === 'quest' && (
             <select 
                value={block.status}
                onChange={e => updateBlock({ status: e.target.value as any })}
                className={cn(
                   "bg-transparent border-none outline-none text-xs font-bold uppercase cursor-pointer",
                   block.status === 'completed' && "text-emerald-400",
                   block.status === 'in_progress' && "text-blue-400",
                   block.status === 'failed' && "text-red-400",
                   block.status === 'new' && "text-slate-400"
                )}
             >
                <option value="new" className="bg-slate-800 text-white">NEW</option>
                <option value="in_progress" className="bg-slate-800 text-white">IN PROGRESS</option>
                <option value="completed" className="bg-slate-800 text-white">COMPLETED</option>
                <option value="failed" className="bg-slate-800 text-white">FAILED</option>
             </select>
           )}
           <button onClick={deleteBlock} className="p-1 hover:bg-red-500/10 text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={14} />
           </button>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
         {/* Title (Shared) */}
         <input 
           type="text" 
           value={block.title} 
           onChange={e => updateBlock({ title: e.target.value })}
           placeholder={mode === 'quest' ? "اسم المهمة..." : "اسم الشخصية أو الفئة..."}
           className="w-full bg-transparent border-none outline-none text-xl font-bold text-white placeholder:text-slate-600"
         />

         {mode === 'quest' ? (
           <>
             {/* Description */}
             <textarea 
               value={block.description}
               onChange={e => {
                  updateBlock({ description: e.target.value });
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
               }}
               placeholder="تفاصيل المهمة..."
               className="w-full bg-transparent border-none outline-none resize-none text-sm text-slate-400 placeholder:text-slate-700 min-h-[40px]"
               rows={2}
             />

             {/* Objectives & Rewards */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
                   <div className="flex items-center gap-2 mb-2 text-blue-400">
                      <Target size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">Objective</span>
                   </div>
                   <div className="flex items-start gap-2">
                      {block.status === 'completed' ? <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" /> : <Circle size={14} className="text-slate-600 mt-0.5 shrink-0" />}
                      <input 
                        value={block.objective}
                        onChange={e => updateBlock({ objective: e.target.value })}
                        placeholder="الهدف الأساسي..."
                        className="bg-transparent border-none outline-none w-full text-sm text-slate-300"
                      />
                   </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
                   <div className="flex items-center gap-2 mb-2 text-amber-500">
                      <Sparkles size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">Reward</span>
                   </div>
                   <input 
                      value={block.reward}
                      onChange={e => updateBlock({ reward: e.target.value })}
                      placeholder="المكافأة (EXP، ذهب، إلخ)..."
                      className="bg-transparent border-none outline-none w-full text-sm text-emerald-400 font-bold font-sans"
                   />
                </div>
             </div>
           </>
         ) : mode === 'choice' ? (
           <div className="flex flex-col gap-4">
              <textarea 
               value={block.description}
               onChange={e => {
                  updateBlock({ description: e.target.value });
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
               }}
               placeholder="وصف الموقف الذي يستدعي اتخاذ قرار..."
               className="w-full bg-transparent border-none outline-none resize-none text-sm text-slate-400 placeholder:text-slate-700 min-h-[40px]"
               rows={2}
             />
             <div className="flex flex-col gap-2 relative">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-700/50 -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">OR</div>
                {(block.choices && block.choices.length > 0 ? block.choices : [{id:'1', text:'فتح الباب'}, {id:'2', text:'الهروب'}]).map((choice, idx) => (
                   <div key={choice.id} className="flex items-center gap-2 bg-slate-800 border border-purple-500/30 p-3 rounded-lg hover:border-purple-500/80 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                         {String.fromCharCode(65 + idx)}
                      </div>
                      <input 
                         value={choice.text}
                         onChange={e => {
                            const newChoices = [...(block.choices || [{id:'1', text:'فتح الباب'}, {id:'2', text:'الهروب'}])];
                            newChoices[idx].text = e.target.value;
                            updateBlock({ choices: newChoices });
                         }}
                         className="bg-transparent border-none outline-none text-sm font-bold text-white w-full"
                         placeholder="اكتب الخيار..."
                      />
                   </div>
                ))}
             </div>
           </div>
         ) : mode === 'spell' ? (
           <div className="flex flex-col gap-4">
              <input 
                 value={block.title}
                 onChange={e => updateBlock({ title: e.target.value })}
                 placeholder="اسم التعويذة أو الطقس..."
                 className="bg-transparent border-none outline-none font-bold text-xl text-emerald-400 w-full"
              />
              <textarea 
               value={block.description}
               onChange={e => {
                  updateBlock({ description: e.target.value });
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
               }}
               placeholder="الكلمات السحرية للتعويذة أو الطقوس بصوت الشخصية..."
               className="w-full bg-slate-950 p-4 border border-emerald-500/20 rounded-lg outline-none resize-none text-sm text-emerald-100 placeholder:text-emerald-900/50 italic leading-loose"
               rows={3}
               style={{ textShadow: "0 0 5px rgba(16, 185, 129, 0.3)" }}
             />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                   <div className="flex items-center gap-2 mb-2 text-rose-400">
                      <span className="text-xs font-bold uppercase tracking-wider">Cost / Catalyst (التكلفة)</span>
                   </div>
                   <input 
                     value={block.objective}
                     onChange={e => updateBlock({ objective: e.target.value })}
                     placeholder="قطرة دم، 10 مانا، تضحية..."
                     className="bg-transparent border-none outline-none w-full text-sm text-slate-300 placeholder:text-slate-600"
                   />
                </div>
                <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                   <div className="flex items-center gap-2 mb-2 text-violet-400">
                      <span className="text-xs font-bold uppercase tracking-wider">Effect (التأثير)</span>
                   </div>
                   <input 
                      value={block.reward}
                      onChange={e => updateBlock({ reward: e.target.value })}
                      placeholder="استدعاء شيطان، شفاء الحلفاء..."
                      className="bg-transparent border-none outline-none w-full text-sm text-slate-300 placeholder:text-slate-600"
                   />
                </div>
             </div>
           </div>
         ) : (
           <div className="flex flex-col gap-6">
              {/* Stats Section */}
              <div>
                 <div className="flex items-center justify-between mb-2 text-emerald-400 border-b border-slate-700 pb-1">
                    <div className="flex items-center gap-2">
                       <TrendingUp size={16} />
                       <span className="text-sm font-bold uppercase tracking-wider">Stats & Level</span>
                    </div>
                    <button onClick={addStat} className="hover:text-white transition-colors" title="إضافة قدرة"><Plus size={14} /></button>
                 </div>
                 <div className="flex flex-col gap-2">
                    {(block.stats || []).map(stat => (
                       <div key={stat.id} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded">
                          <input 
                             value={stat.name}
                             onChange={e => updateBlock({ stats: block.stats?.map(s => s.id === stat.id ? { ...s, name: e.target.value } : s) })}
                             className="w-20 bg-transparent border-none outline-none text-xs font-bold text-slate-300 placeholder:text-slate-600"
                             placeholder="القدرة"
                          />
                          <div className="flex-1 bg-slate-900 h-2.5 rounded-full overflow-hidden flex relative group/bar">
                              <select 
                                 value={stat.color}
                                 onChange={e => updateBlock({ stats: block.stats?.map(s => s.id === stat.id ? { ...s, color: e.target.value } : s) })}
                                 className="absolute inset-0 opacity-0 cursor-pointer"
                              >
                                 <option value="bg-red-500">أحمر (HP)</option>
                                 <option value="bg-blue-500">أزرق (MP/Mana)</option>
                                 <option value="bg-emerald-500">أخضر (Stamina)</option>
                                 <option value="bg-amber-500">أصفر (EXP)</option>
                                 <option value="bg-purple-500">بنفسجي</option>
                              </select>
                             <div className={cn("h-full", stat.color || "bg-red-500")} style={{ width: `${Math.min(100, (Number(stat.value) / Number(stat.maxValue || stat.value)) * 100 || 0)}%` }} />
                          </div>
                          <div className="flex items-center text-xs font-sans text-slate-400 gap-1 w-24">
                             <input value={stat.value} onChange={e => updateBlock({ stats: block.stats?.map(s => s.id === stat.id ? { ...s, value: e.target.value } : s) })} className="w-8 bg-transparent text-right outline-none text-white" />
                             <span>/</span>
                             <input value={stat.maxValue} onChange={e => updateBlock({ stats: block.stats?.map(s => s.id === stat.id ? { ...s, maxValue: e.target.value } : s) })} className="w-8 bg-transparent outline-none" placeholder="Max" />
                          </div>
                          <button onClick={() => updateBlock({ stats: block.stats?.filter(s => s.id !== stat.id) })} className="text-slate-600 hover:text-red-500"><Trash2 size={12} /></button>
                       </div>
                    ))}
                    {(!block.stats || block.stats.length === 0) && <div className="text-xs text-slate-500 text-center py-2">لا توجد قدرات.</div>}
                 </div>
              </div>

              {/* Inventory Section */}
              <div>
                 <div className="flex items-center justify-between mb-2 text-violet-400 border-b border-slate-700 pb-1">
                    <div className="flex items-center gap-2">
                       <Backpack size={16} />
                       <span className="text-sm font-bold uppercase tracking-wider">Inventory</span>
                    </div>
                    <button onClick={addInvItem} className="hover:text-white transition-colors" title="إضافة عنصر"><Plus size={14} /></button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(block.inventoryItems || []).map(item => (
                       <div key={item.id} className="flex items-start gap-2 bg-slate-800/50 p-2 rounded relative group/item">
                          <input 
                             value={item.quantity}
                             onChange={e => updateBlock({ inventoryItems: block.inventoryItems?.map(i => i.id === item.id ? { ...i, quantity: e.target.value } : i) })}
                             className="w-6 h-6 bg-slate-700 rounded text-center text-xs font-sans text-white border-none outline-none"
                             title="الكمية"
                          />
                          <div className="flex flex-col flex-1">
                             <input 
                               value={item.name}
                               onChange={e => updateBlock({ inventoryItems: block.inventoryItems?.map(i => i.id === item.id ? { ...i, name: e.target.value } : i) })}
                               className="bg-transparent border-none outline-none text-sm font-bold text-slate-200"
                               placeholder="اسم العنصر"
                             />
                             <input 
                               value={item.desc}
                               onChange={e => updateBlock({ inventoryItems: block.inventoryItems?.map(i => i.id === item.id ? { ...i, desc: e.target.value } : i) })}
                               className="bg-transparent border-none outline-none text-xs text-slate-400"
                               placeholder="الوصف أو التأثير..."
                             />
                          </div>
                          <button onClick={() => updateBlock({ inventoryItems: block.inventoryItems?.filter(i => i.id !== item.id) })} className="absolute top-2 left-2 opacity-0 group-hover/item:opacity-100 text-red-500/50 hover:text-red-500 transition-opacity"><Trash2 size={12} /></button>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
         )}
      </div>

    </div>
  );
}

