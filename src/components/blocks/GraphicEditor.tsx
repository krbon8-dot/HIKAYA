import React from 'react';
import { GraphicBlock } from '../../types';
import { Network, Users, ScrollText, Map, Trash2, Plus, Tent, CloudRain, Skull } from 'lucide-react';
import { cn, generateId } from '../../lib/utils';

interface Props {
  block: GraphicBlock;
  updateBlock: (updates: Partial<GraphicBlock>) => void;
  deleteBlock: () => void;
}

export default function GraphicEditor({ block, updateBlock, deleteBlock }: Props) {
  const options = [
    { value: 'evidence', label: 'لوحة تحقيق ومسرح جريمة', icon: Network },
    { value: 'lineage', label: 'شجرة عائلة / أنساب', icon: Users },
    { value: 'scroll', label: 'معاهدة / فتوى قديمة', icon: ScrollText },
    { value: 'minimap', label: 'خريطة مصغرة', icon: Map },
    { value: 'journey', label: 'يوميات المعسكر', icon: Tent },
    { value: 'atmosphere', label: 'المؤشر الحسي', icon: CloudRain },
    { value: 'wanted', label: 'ورقة المطلوبين', icon: Skull },
  ];

  const CurrentIcon = options.find(o => o.value === block.graphicType)?.icon || Network;

  const addItem = () => {
    updateBlock({
      items: [...(block.items || []), { id: generateId(), name: 'عنصر جديد', role: '', connectedTo: '' }]
    });
  };

  const updateItem = (id: string, updates: any) => {
    updateBlock({
      items: (block.items || []).map(i => i.id === id ? { ...i, ...updates } : i)
    });
  };

  const deleteItem = (id: string) => {
    updateBlock({
      items: (block.items || []).filter(i => i.id !== id)
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBlock({ imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative group my-8 max-w-3xl mx-auto focus-within:z-10" dir="rtl">
      {/* Top Controls */}
      <div className="absolute -top-10 right-0 bg-white dark:bg-[#222] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-1 gap-1 items-center z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex">
         <div className="flex items-center gap-1.5 px-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
            <CurrentIcon size={14} />
            <select
               value={block.graphicType}
               onChange={e => updateBlock({ graphicType: e.target.value as any })}
               className="bg-transparent border-none outline-none text-xs font-bold py-1.5 cursor-pointer max-w-[150px]"
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

      <div className="relative transition-all duration-500">
        
        {/* DETECTIVE EVIDENCE BOARD */}
        {block.graphicType === 'evidence' && (
           <div className="bg-[#111] p-6 rounded-lg border-4 border-slate-800 shadow-2xl relative min-h-[300px] overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cork-board.png')] opacity-30 mix-blend-overlay pointer-events-none" />
              {/* String background illusion */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.5 }}>
                 {(block.items || []).map((item, idx) => {
                    if(idx === 0) return null;
                    // Draw random red lines connecting nodes
                    return <line key={idx} x1={`${(idx*25)%100}%`} y1={`${(idx*30)%100}%`} x2={`${50}%`} y2={`${50}%`} stroke="red" strokeWidth="2" strokeDasharray="5,5" />
                 })}
              </svg>

              <div className="flex justify-between items-center mb-6 relative z-10">
                 <input 
                    value={block.title || ''}
                    onChange={e => updateBlock({ title: e.target.value })}
                    placeholder="عنوان لوحة التحقيق..."
                    className="bg-black/50 border border-slate-700 outline-none text-white px-4 py-2 font-mono text-xl uppercase tracking-widest placeholder:text-slate-500 w-2/3"
                 />
                 <button onClick={addItem} className="bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-900/50 px-3 py-1.5 text-xs font-bold rounded transition-colors flex items-center gap-1">
                    <Plus size={14} /> خيط جديد
                 </button>
              </div>

              <div className="flex flex-wrap gap-6 relative z-10 justify-center">
                 {(block.items || []).map(item => (
                    <div key={item.id} className="bg-[#f4f4f4] p-3 shadow-md border border-[#ccc] rotate-[-2deg] hover:rotate-0 hover:scale-105 transition-all w-40 relative group/card">
                       <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_2px_4px_rgba(0,0,0,0.5)] absolute -top-1.5 left-1/2 -translate-x-1/2 z-20" />
                       <input 
                          value={item.name}
                          onChange={e => updateItem(item.id, { name: e.target.value })}
                          className="bg-transparent border-none outline-none text-sm font-bold w-full text-center text-black mb-2"
                          placeholder="الاسم/الدليل"
                          style={{ fontFamily: "'Marker Felt', 'Comic Sans MS', sans-serif" }}
                       />
                       <textarea 
                          value={item.desc}
                          onChange={e => {
                             updateItem(item.id, { desc: e.target.value });
                             e.target.style.height = 'auto';
                             e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          className="bg-transparent border-none outline-none resize-none text-xs text-center w-full text-blue-900 leading-tight"
                          placeholder="ملاحظات المحقق..."
                          rows={2}
                          style={{ fontFamily: "shadows into light, cursive" }}
                       />
                       <button onClick={() => deleteItem(item.id)} className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 text-red-500 hover:bg-red-100 rounded transition-opacity"><Trash2 size={12} /></button>
                    </div>
                 ))}
                 {(!block.items || block.items.length === 0) && <div className="text-slate-500 font-mono text-sm w-full text-center mt-10">اللوحة فارغة. ابدأ بربط الأدلة.</div>}
              </div>
           </div>
        )}

        {/* FAMILY LINEAGE */}
        {block.graphicType === 'lineage' && (
           <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
              <input 
                 value={block.title || ''}
                 onChange={e => updateBlock({ title: e.target.value })}
                 placeholder="شجرة عائلة / سلالة..."
                 className="bg-transparent border-b-2 border-slate-300 dark:border-slate-700 outline-none text-center text-2xl font-serif text-slate-800 dark:text-slate-200 mb-8 pb-2 w-full max-w-md placeholder:text-slate-400"
              />
              <button onClick={addItem} className="mb-6 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-bold">
                 إضافة فرد للعائلة
              </button>
              
              <div className="w-full max-w-2xl flex flex-col gap-4">
                 {(block.items || []).map(item => (
                    <div key={item.id} className="relative group/node flex items-center gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-sm">
                       <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-serif text-xl font-bold">
                          {item.name ? item.name.charAt(0).toUpperCase() : '?'}
                       </div>
                       <div className="flex-1">
                          <input 
                             value={item.name}
                             onChange={e => updateItem(item.id, { name: e.target.value })}
                             placeholder="الاسم"
                             className="bg-transparent border-none outline-none font-bold text-slate-800 dark:text-slate-200 w-full mb-1"
                          />
                          <input 
                             value={item.role}
                             onChange={e => updateItem(item.id, { role: e.target.value })}
                             placeholder="اللقب / الصفة (مثل: الملك الأول، الوريث)"
                             className="bg-transparent border-none outline-none text-xs text-slate-500 w-full"
                          />
                       </div>
                       <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover/node:opacity-100 text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-opacity"><Trash2 size={16} /></button>
                    </div>
                 ))}
                 {(!block.items || block.items.length === 0) && <div className="text-center text-slate-400 font-serif">شجرة العائلة فارغة.</div>}
              </div>
           </div>
        )}

        {/* SCROLL / CONTRACT */}
        {block.graphicType === 'scroll' && (
           <div className="bg-[#f4ebd0] p-10 md:p-16 relative overflow-hidden shadow-2xl max-w-2xl mx-auto border-x-[12px] border-[#8b7355]/30">
              {/* Roll ends simulation */}
              <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#bda67a] to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#bda67a] to-transparent opacity-80" />
              
              <textarea 
                 value={block.title || ''}
                 onChange={e => {
                    updateBlock({ title: e.target.value });
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                 }}
                 placeholder="العنوان أو المرسوم..."
                 className="bg-transparent border-none outline-none resize-none text-3xl font-bold text-center w-full text-[#4a3f35] mb-8 uppercase placeholder:text-[#9e8f77]"
                 style={{ fontFamily: "'Cinzel', serif", textShadow: "1px 1px 0 rgba(255,255,255,0.5)" }}
                 rows={1}
              />
              <textarea 
                 value={block.content || ''}
                 onChange={e => {
                    updateBlock({ content: e.target.value });
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                 }}
                 placeholder="نص المعاهدة أو الفتوى..."
                 className="w-full bg-transparent border-none outline-none resize-none text-lg text-justify text-[#5c4f42] leading-loose placeholder:text-[#9e8f77] px-4"
                 style={{ fontFamily: "Georgia, serif" }}
                 rows={5}
              />

              <div className="mt-12 flex justify-between px-8 border-t border-[#8b7355]/30 pt-8 relative">
                 {/* Wax Seal Illusion */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-red-800 rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(153,27,27,0.5)] border-2 border-red-900 border-dashed opacity-90 text-red-200">
                    <ScrollText size={24} />
                 </div>
                 <div className="flex-1 text-center">
                    <input value="توقيع الطرف الأول" readOnly className="bg-transparent border-b border-[#8b7355]/30 outline-none text-center text-[#5c4f42] text-sm italic w-32 pb-1" />
                 </div>
                 <div className="flex-1 text-center">
                    <input value="توقيع الطرف الثاني" readOnly className="bg-transparent border-b border-[#8b7355]/30 outline-none text-center text-[#5c4f42] text-sm italic w-32 pb-1" />
                 </div>
              </div>
           </div>
        )}

        {/* MINIMAP */}
        {block.graphicType === 'minimap' && (
           <div className="border-[8px] border-slate-900 rounded-lg p-2 bg-slate-800 max-w-md mx-auto shadow-2xl">
              <input 
                 value={block.title || ''}
                 onChange={e => updateBlock({ title: e.target.value })}
                 placeholder="اسم المنطقة (مثال: الوادي المتصدع)"
                 className="w-full bg-transparent border-none outline-none text-center font-bold text-amber-500 uppercase tracking-widest text-sm mb-3 placeholder:text-slate-600"
              />
              <div className="w-full aspect-video bg-black rounded border border-slate-700 relative overflow-hidden group/map flex items-center justify-center">
                 {block.imageUrl ? (
                    <img src={block.imageUrl} alt="Minimap" className="w-full h-full object-cover opacity-80 group-hover/map:opacity-100 transition-opacity" />
                 ) : (
                    <div className="text-slate-600 flex flex-col items-center gap-2">
                       <Map size={32} />
                       <span className="text-xs uppercase">اضغط لإضافة صورة خريطة</span>
                    </div>
                 )}

                <label className="absolute inset-0 cursor-pointer opacity-0 group-hover/map:opacity-100 transition-opacity flex items-center justify-center bg-black/40">
                   <div className="bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-2">
                      <Map size={14} /> {block.imageUrl ? "تغيير الخريطة" : "رفع خريطة"}
                   </div>
                   <input 
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                   />
                </label>
               
               {/* Crosshair target overlay */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-red-500" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-red-500" />
                  <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-ping opacity-50" />
               </div>
            </div>
            <textarea 
               value={block.content || ''}
               onChange={e => {
                  updateBlock({ content: e.target.value });
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
               }}
               placeholder="وصف تضاريس المنطقة أو أهميتها..."
               className="w-full bg-transparent border-none outline-none resize-none text-xs text-slate-400 mt-3 text-center"
               rows={2}
            />
         </div>
      )}

      {/* JOURNEY LOG / CAMPFIRE */}
      {block.graphicType === 'journey' && (
         <div className="bg-[#2a241f] border-2 border-[#3d3228] p-6 max-w-2xl mx-auto rounded-xl relative shadow-2xl" style={{ backgroundImage: "radial-gradient(circle at center, rgba(30,20,10,0.5) 0%, rgba(10,5,0,0.8) 100%)" }}>
            <div className="flex items-center gap-3 mb-6 border-b border-[#4d3c2c] pb-4">
               <Tent className="text-orange-600" size={28} />
               <input 
                  value={block.title || ''}
                  onChange={e => updateBlock({ title: e.target.value })}
                  placeholder="موقع المعسكر أو المرحلة..."
                  className="bg-transparent border-none outline-none font-bold text-xl text-orange-200 placeholder:text-orange-900/50 flex-1"
               />
               <button onClick={addItem} className="bg-[#4d3c2c]/30 text-orange-200 hover:bg-[#4d3c2c]/60 px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1">
                  <Plus size={14} /> إضافة نقطة
               </button>
            </div>
            
            <div className="relative pl-6">
               {/* Timeline / path line */}
               <div className="absolute top-4 bottom-4 right-8 w-1 bg-gradient-to-b from-orange-900/0 via-orange-800 to-orange-900/0 md:right-auto md:left-8" />
               
               <div className="flex flex-col gap-6">
                  {(block.items || []).map((item, idx) => (
                     <div key={item.id} className="relative group/journey pl-8 md:pl-16 pr-2">
                        <div className="absolute top-2 -right-2 md:left-5 md:right-auto w-4 h-4 rounded-full bg-orange-700 border-[3px] border-[#2a241f] shadow-[0_0_10px_rgba(234,88,12,0.5)] z-10" />
                        <div className="bg-[#3d3228]/50 border border-[#4d3c2c] p-4 rounded-lg hover:border-orange-900/50 transition-colors relative">
                           <input 
                              value={item.name}
                              onChange={e => updateItem(item.id, { name: e.target.value })}
                              placeholder="الوقت (مثال: الغسق، اليوم الثالث)"
                              className="bg-transparent border-none outline-none text-xs text-orange-400 font-bold mb-2 uppercase tracking-wide w-full"
                           />
                           <textarea 
                              value={item.desc}
                              onChange={e => {
                                 updateItem(item.id, { desc: e.target.value });
                                 e.target.style.height = 'auto';
                                 e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              placeholder="حدث في الطريق..."
                              className="bg-transparent border-none outline-none resize-none text-sm text-[#d4c5b9] w-full"
                              rows={2}
                           />
                           <button onClick={() => deleteItem(item.id)} className="absolute top-2 left-2 opacity-0 group-hover/journey:opacity-100 text-red-500 hover:bg-red-900/20 p-1 rounded"><Trash2 size={14} /></button>
                        </div>
                     </div>
                  ))}
                  {(!block.items || block.items.length === 0) && (
                     <div className="text-[#8c7a6b] text-sm text-center py-4">لم يتم تسجيل أي أحداث في هذه المرحلة.</div>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* ATMOSPHERE TRACKER */}
      {block.graphicType === 'atmosphere' && (
         <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl max-w-sm mx-auto">
            <div className="flex items-center gap-2 mb-6 text-slate-300">
               <CloudRain size={20} className="text-cyan-500" />
               <h4 className="font-bold tracking-widest text-sm uppercase">المؤشر الحسي والبيئي</h4>
            </div>
            <div className="flex flex-col gap-4">
               <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                  <span className="text-[10px] text-cyan-500 uppercase font-bold tracking-wider block mb-1">الطقس / الإضاءة</span>
                  <input 
                     value={block.title || ''}
                     onChange={e => updateBlock({ title: e.target.value })}
                     placeholder="ضباب كثيف، شمس حارقة..."
                     className="bg-transparent border-none outline-none w-full text-slate-200 text-sm"
                  />
               </div>
               <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                  <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider block mb-1">الرائحة / الهواء</span>
                  <input 
                     value={(block.items && block.items[0]?.name) || ''}
                     onChange={e => {
                        const newItems = block.items && block.items.length > 0 ? [...block.items] : [{id: generateId(), name:'', desc:''}];
                        newItems[0].name = e.target.value;
                        updateBlock({ items: newItems });
                     }}
                     placeholder="رائحة صدأ، هواء بارد لاذع..."
                     className="bg-transparent border-none outline-none w-full text-slate-200 text-sm"
                  />
               </div>
               <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block mb-1">المؤثرات الصوتية</span>
                  <textarea 
                     value={block.content || ''}
                     onChange={e => {
                        updateBlock({ content: e.target.value });
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                     }}
                     placeholder="صوت قطرات ماء في الخلفية، صراخ مكتوم..."
                     className="bg-transparent border-none outline-none w-full text-slate-200 text-sm resize-none"
                     rows={2}
                  />
               </div>
            </div>
         </div>
      )}

      {/* WANTED POSTER */}
      {block.graphicType === 'wanted' && (
         <div className="bg-[#e8dcb8] p-8 max-w-sm mx-auto shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-2 border-[#8b7355] relative flex flex-col items-center" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')" }}>
            <div className="absolute top-2 left-6 w-3 h-3 rounded-full bg-red-900/80 shadow-sm" />
            <div className="absolute top-3 right-8 w-3 h-3 rounded-full bg-slate-800/80 shadow-sm" />
            
            <h1 className="text-5xl font-black text-[#3a2818] mb-2 uppercase tracking-[0.2em]" style={{ fontFamily: "Impact, sans-serif" }}>مطلوب</h1>
            <h2 className="text-xl font-bold text-red-800 mb-6 uppercase tracking-widest">حياً أو ميتاً</h2>
            
            <div className="w-full aspect-square border-4 border-[#5c4a3d] bg-[#c2b28f] mb-6 relative flex items-center justify-center overflow-hidden group/wanted">
               {block.imageUrl ? (
                  <img src={block.imageUrl} alt="Wanted" className="w-full h-full object-cover mix-blend-multiply opacity-80 filter sepia-[0.5] contrast-125" />
               ) : (
                  <Skull size={64} className="text-[#8b7355]" />
               )}
               <label className="absolute inset-0 cursor-pointer opacity-0 group-hover/wanted:opacity-100 transition-opacity flex items-center justify-center bg-black/40">
                  <div className="bg-[#3a2818] text-[#e8dcb8] px-4 py-2 rounded text-xs font-bold flex items-center gap-2">
                     <Skull size={14} /> {block.imageUrl ? "تغيير الصورة" : "رفع صورة المطلوب"}
                  </div>
                  <input 
                     type="file"
                     accept="image/*"
                     onChange={handleImageUpload}
                     className="hidden"
                  />
               </label>
            </div>

            <input 
               value={block.title || ''}
               onChange={e => updateBlock({ title: e.target.value })}
               placeholder="اسم المطلوب..."
               className="bg-transparent border-none outline-none text-center font-bold text-2xl text-[#2a1f16] w-full mb-2 uppercase"
            />
            <textarea 
               value={block.content || ''}
               onChange={e => {
                  updateBlock({ content: e.target.value });
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
               }}
               placeholder="الجرائم: السرقة، الخيانة..."
               className="bg-transparent border-none outline-none resize-none text-center text-[#5c4a3d] text-sm w-full leading-relaxed font-bold mb-4"
               rows={3}
            />
            
            <div className="w-full border-t border-b border-[#8b7355] py-2 mt-auto text-center flex flex-col items-center">
               <span className="text-[#5c4a3d] text-xs font-bold uppercase tracking-widest mb-1">المكافأة</span>
               <input 
                  value={(block.items && block.items[0]?.name) || ''}
                  onChange={e => {
                     const newItems = block.items && block.items.length > 0 ? [...block.items] : [{id: generateId(), name:'', desc:''}];
                     newItems[0].name = e.target.value;
                     updateBlock({ items: newItems });
                  }}
                  placeholder="$10,000"
                  className="bg-transparent border-none outline-none text-center text-3xl font-black text-red-800 w-full"
                  style={{ fontFamily: "Impact, sans-serif" }}
               />
            </div>
         </div>
      )}

      </div>
    </div>
  );
}
