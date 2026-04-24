import React, { useState } from 'react';
import { StoryBlock, TextBlock, ImageBlock, DialogueBlock, ProjectData, Character, Lore, Relation, KanbanCard, Chapter, Faction, PlanningItem, WorldMapNode } from '../types';
import { Sparkles, ImagePlus, UserCircle2, Loader2, Palette, Users, FileText, Settings, Plus, Minus, ZoomIn, ZoomOut, Trash2, BookOpen, Link, KanbanSquare, HeartPulse, X, Globe, Shield, Target, Briefcase, Zap, BookA, AlertTriangle, MessageSquare } from 'lucide-react';
import { fileToDataUrl, generateId, cn } from '../lib/utils';
import { generateSuggestion } from '../lib/aiService';

interface Props {
  block: StoryBlock | null;
  onChange: (id: string, updates: Partial<StoryBlock>) => void;
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
  activePageId: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  hideSettings?: boolean;
}

const FONTS = [
  { id: 'sans', name: 'الافتراضي (Sans)' },
  { id: 'serif', name: 'أفقي كلاسيكي (Serif)' },
  { id: 'display', name: 'عريض (Display)' }
];

export default function PropertiesPanel({ block, onChange, project, updateProject, activePageId, isExpanded, onToggleExpand, hideSettings }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'props' | 'chars' | 'scenario' | 'world' | 'kanban' | 'factions' | 'dict'>(hideSettings ? 'chars' : 'props');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [selectedLoreId, setSelectedLoreId] = useState<string | null>(null);
  const [selectedFactionId, setSelectedFactionId] = useState<string | null>(null);
  const [selectedMapNodeId, setSelectedMapNodeId] = useState<string | null>(null);
  const [optionsModal, setOptionsModal] = useState<{ isOpen: boolean, options: string[], onSelect: (index: number) => void } | null>(null);

  const activePage = project.pages.find(p => p.id === activePageId);

  React.useEffect(() => {
    const handleOpenEntity = (e: any) => {
      const name = e.detail?.name;
      if (!name) return;
      if (onToggleExpand && !isExpanded) onToggleExpand();

      const char = project.characters?.find(c => c.name === name);
      if (char) {
        setActiveTab('chars');
        setSelectedCharId(char.id);
        return;
      }
      const lore = project.lore?.find(l => l.title === name);
      if (lore) {
        setActiveTab('world');
        setSelectedLoreId(lore.id);
        return;
      }
      const map = project.worldMap?.find(m => m.name === name);
      if (map) {
        setActiveTab('world');
        setSelectedMapNodeId(map.id);
        return;
      }
      const faction = project.factions?.find(f => f.name === name);
      if (faction) {
        setActiveTab('factions');
        setSelectedFactionId(faction.id);
        return;
      }
    };
    window.addEventListener('open-entity', handleOpenEntity);
    return () => window.removeEventListener('open-entity', handleOpenEntity);
  }, [project, isExpanded, onToggleExpand]);

  const update = (updates: any) => block && onChange(block.id, updates);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      callback(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAI = async (currentText: string, type: 'narrative' | 'dialogue', callback: (newText: string) => void) => {
    setIsGenerating(true);
    try {
      const suggestion = await generateSuggestion(currentText, type, project);
      if (suggestion) {
        // If currentText is empty, just use the suggestion
        callback(currentText.trim() ? currentText + " " + suggestion : suggestion);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const addCharacter = () => {
    const newChar: Character = {
      id: generateId(),
      name: 'شخصية جديدة',
      avatarUrl: '',
      details: ''
    };
    updateProject({ characters: [...(project.characters || []), newChar] });
    setSelectedCharId(newChar.id);
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    updateProject({
      characters: (project.characters || []).map(c => c.id === id ? { ...c, ...updates } : c)
    });
  };

  const deleteCharacter = (id: string) => {
    updateProject({
      characters: (project.characters || []).filter(c => c.id !== id),
      relations: (project.relations || []).filter(r => r.char1Id !== id && r.char2Id !== id)
    });
    if (selectedCharId === id) setSelectedCharId(null);
  };

  const addRelation = (c1: string, c2: string, type: string) => {
    if (c1 === c2) return;
    const existing = project.relations?.find(r => (r.char1Id === c1 && r.char2Id === c2) || (r.char1Id === c2 && r.char2Id === c1));
    if (existing) return;
    updateProject({ relations: [...(project.relations || []), { id: generateId(), char1Id: c1, char2Id: c2, type }] });
  };

  const deleteRelation = (id: string) => {
    updateProject({ relations: (project.relations || []).filter(r => r.id !== id) });
  };

  const renderTextProps = (b: TextBlock) => (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-[0.8rem] text-[var(--text)]">مستوى النص</label>
        <select 
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] p-2 rounded text-[0.85rem]"
          value={b.style} 
          onChange={e => update({ style: e.target.value })}
        >
          <option value="normal">فقرة عادية</option>
          <option value="h1">عنوان ضخم</option>
          <option value="h2">عنوان فرعي</option>
          <option value="quote">اقتباس</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[0.8rem] text-[var(--text)]">المحاذاة</label>
        <select 
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] p-2 rounded text-[0.85rem]"
          value={b.align} 
          onChange={e => update({ align: e.target.value })}
        >
          <option value="right">يمين</option>
          <option value="center">وسط</option>
          <option value="left">يسار</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[0.8rem] text-[var(--text)]">الخط</label>
        <select 
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] p-2 rounded text-[0.85rem]"
          value={b.fontFamily || 'sans'} 
          onChange={e => update({ fontFamily: e.target.value })}
        >
          {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[0.8rem] text-[var(--text)]">لون النص</label>
        <input 
          type="color" 
          value={b.color || '#000000'} 
          onChange={e => update({ color: e.target.value })}
          className="w-full h-10 rounded cursor-pointer bg-transparent border-0 p-0"
        />
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-[0.8rem] text-[var(--text)] flex justify-between">
           <span>حجم الخط المخصص</span>
           <span className="text-[var(--text-dim)]">{b.fontSize ? `${b.fontSize}px` : 'تلقائي'}</span>
        </label>
        <div className="flex items-center gap-2">
           <input 
             type="range" min="10" max="100" 
             value={b.fontSize || 0} 
             onChange={e => update({ fontSize: Number(e.target.value) || undefined })}
             className="accent-[var(--accent)] flex-1"
           />
           {b.fontSize && <button onClick={() => update({ fontSize: undefined })} className="text-[10px] text-red-400 hover:text-red-500">إلغاء</button>}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <button 
          onClick={() => handleAI(b.content, 'narrative', (text) => update({ content: text }))}
          disabled={isGenerating}
          className="w-full bg-[var(--bg)] border border-[var(--accent)] text-[var(--accent)] py-2 rounded text-xs hover:bg-[rgba(168,85,247,0.1)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          أكمل بالذكاء الاصطناعي
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => handleAI(b.content, 'proofread' as any, (text) => update({ content: text }))}
            disabled={isGenerating}
            className="flex-1 bg-[var(--bg)] border border-green-500/50 text-green-500 py-2 rounded text-xs hover:bg-green-500/10 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <Sparkles size={12} /> تدقيق
          </button>
          <button 
            onClick={() => handleAI(`قم بتوسيع هذه الجملة القصيرة إلى فقرة سردية مشوقة ومفصلة: ${b.content}`, 'narrative', (text) => update({ content: text }))}
            disabled={isGenerating}
            className="flex-1 bg-[var(--bg)] border border-blue-500/50 text-blue-500 py-2 rounded text-xs hover:bg-blue-500/10 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <Sparkles size={12} /> توسيع
          </button>
        </div>
        <button 
           onClick={async () => {
              setIsGenerating(true);
              try {
                const { generateSuggestion } = await import('../lib/aiService');
                const rawOptions = await generateSuggestion(b.content, 'options', project);
                if (rawOptions) {
                  try {
                    const parsed = JSON.parse(rawOptions.replace(/```json/g, '').replace(/```/g, '').trim());
                    if (Array.isArray(parsed) && parsed.length >= 2) {
                       setOptionsModal({
                         isOpen: true,
                         options: parsed,
                         onSelect: (index: number) => {
                           update({ content: b.content + '\n\n' + parsed[index] });
                           setOptionsModal(null);
                         }
                       });
                    } else {
                       alert("الخيارات المستلمة:\n" + rawOptions);
                    }
                  } catch(e) {
                    alert("الخيارات المقترحة:\n\n" + rawOptions);
                  }
                }
              } finally {
                setIsGenerating(false);
              }
           }}
           disabled={isGenerating}
           className="w-full bg-[var(--bg)] border border-yellow-500/50 text-yellow-500 py-2 mt-2 rounded text-xs hover:bg-yellow-500/10 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <Sparkles size={12} /> اقترح خيارات للأحداث القادمة
        </button>
      </div>
    </>
  );

  const renderImageProps = (b: ImageBlock) => (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-[0.8rem] text-[var(--text)]">المحاذاة</label>
        <select 
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] p-2 rounded text-[0.85rem]"
          value={b.align} 
          onChange={e => update({ align: e.target.value })}
        >
          <option value="right">يمين</option>
          <option value="center">وسط</option>
          <option value="left">يسار</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
         <label className="text-[0.8rem] text-[var(--text)]">دوران الزوايا (Border Radius)</label>
         <input 
           type="range" min="0" max="40" 
           value={b.borderRadius ?? 8} 
           onChange={e => update({ borderRadius: Number(e.target.value) })}
           className="accent-[var(--accent)]"
         />
      </div>
      <div className="text-[10px] text-[var(--text-dim)] mt-4 text-center">
        تلميح: يمكنك تغيير حجم الصور وترتيبها بجانب بعضها مباشرة عبر السحب على الصورة نفسها.
      </div>
    </>
  );

  const renderDialogueProps = (b: DialogueBlock) => (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-[0.8rem] text-[var(--text)]">نـــوع الفقاعة</label>
        <select 
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] p-2 rounded text-[0.85rem]"
          value={b.bubbleType} 
          onChange={e => update({ bubbleType: e.target.value })}
        >
          <option value="speech">حديث (عادي)</option>
          <option value="thought">تفكير (متقطع)</option>
          <option value="shout">صراخ (حواف مدببة)</option>
          <option value="whisper">همس (صغير ومقطع)</option>
          <option value="electronic">إلكتروني (رقمي مربع)</option>
          <option value="scared">خوف (متموج ومرتعش)</option>
          <option value="narrator">راوي قصة (مستطيل سادة بدون ذيل)</option>
          <option value="system">نظام/لعبة (شريط مظلل)</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[0.8rem] text-[var(--text)]">اتجاه المتحدث</label>
        <div className="flex border border-[var(--border)] rounded overflow-hidden">
           <button onClick={() => update({ direction: 'rtl' })} className={`flex-1 py-1.5 text-sm transition-colors ${b.direction === 'rtl' ? 'bg-[var(--accent)]' : 'bg-[var(--bg)] hover:bg-[var(--border)]'}`}>يمين</button>
           <button onClick={() => update({ direction: 'ltr' })} className={`flex-1 py-1.5 text-sm transition-colors ${b.direction === 'ltr' ? 'bg-[var(--accent)]' : 'bg-[var(--bg)] hover:bg-[var(--border)]'}`}>يسار</button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[0.8rem] text-[var(--text)]">لون الفقاعة</label>
         <input 
          type="color" 
          value={b.bubbleColor || '#ffffff'} 
          onChange={e => update({ bubbleColor: e.target.value })}
          className="w-full h-10 rounded cursor-pointer bg-transparent border-0 p-0"
        />
      </div>

      <div className="flex flex-col gap-2 mt-2">
         <label className="text-[0.8rem] text-[var(--text)]">حجم صورة المتحدث</label>
         <input 
           type="range" min="48" max="256" step="8"
           value={b.avatarSize ?? 128} 
           onChange={e => update({ avatarSize: Number(e.target.value) })}
           className="accent-[var(--accent)]"
         />
      </div>

      <div className="flex flex-col gap-2 mt-4">
         <label className="text-[0.8rem] text-[var(--text)] flex items-center gap-1"><UserCircle2 size={14}/> الشخصيات المحفوظة</label>
         <div className="flex gap-4 w-full overflow-x-auto pb-4 custom-scrollbar items-start">
            {project.characters && project.characters.length > 0 ? project.characters.map((char) => (
              <div key={char.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div 
                  onClick={() => update({ avatarUrl: char.avatarUrl })}
                  className={`w-12 h-12 rounded-lg shadow-sm border cursor-pointer hover:border-[var(--accent)] transition-colors bg-white relative overflow-hidden ${b.avatarUrl === char.avatarUrl ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]' : 'border-[var(--border)]'}`}
                  title={char.name}
                >
                  {char.avatarUrl ? <img src={char.avatarUrl} className="w-full h-full object-cover" /> : <UserCircle2 className="w-full h-full p-2 text-slate-300" />}
                </div>
                
                {/* Secondary images selection from folder */}
                {char.images && char.images.length > 0 && typeof b.avatarUrl === 'string' && (b.avatarUrl === char.avatarUrl || char.images.some(img => img.url === b.avatarUrl)) && (
                  <div className="flex bg-[#1a1a1a] border border-[#333] p-1 rounded-full gap-1 items-center">
                     <div 
                       onClick={() => update({ avatarUrl: char.avatarUrl })}
                       className={cn("w-5 h-5 rounded-full border cursor-pointer overflow-hidden flex-shrink-0", b.avatarUrl === char.avatarUrl ? 'border-[var(--accent)] shadow-[0_0_5px_var(--accent)]' : 'border-transparent')}
                       title="الأساسية"
                     >
                        {char.avatarUrl ? <img src={char.avatarUrl} className="w-full h-full object-cover" /> : <UserCircle2 className="w-full h-full text-slate-400" />}
                     </div>
                     {char.images.map(img => (
                        <div 
                          key={img.id}
                          onClick={() => update({ avatarUrl: img.url })}
                          className={cn("w-5 h-5 rounded-full border cursor-pointer overflow-hidden flex-shrink-0", b.avatarUrl === img.url ? 'border-[var(--accent)] shadow-[0_0_5px_var(--accent)]' : 'border-transparent')}
                          title={img.name || 'مجلد الصور'}
                        >
                           <img src={img.url} className="w-full h-full object-cover" />
                        </div>
                     ))}
                  </div>
                )}
              </div>
            )) : <span className="text-xs text-[var(--text-dim)]">لا توجد شخصيات. أضفها من قسم الشخصيات.</span>}
         </div>
         <label className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] py-2 rounded text-sm hover:bg-[var(--border)] transition-colors cursor-pointer text-center flex justify-center items-center gap-2 mt-2">
           <ImagePlus size={14} /> رفع صورة خارجية
           <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, url => update({ avatarUrl: url }))} />
         </label>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <button 
          onClick={() => {
             const charMatch = project.characters?.find(c => c.avatarUrl === b.avatarUrl);
             let prompt = b.text;
             if (charMatch && charMatch.details) {
               prompt = `تفاصيل هذه الشخصية هي: ${charMatch.details}. \n\nبناءً على هذا، اقترح الجملة التالية لـ ${charMatch.name}: ${b.text}`;
             }
             handleAI(prompt, 'dialogue', (text) => update({ text }));
          }}
          disabled={isGenerating}
          className="w-full bg-[var(--bg)] border border-[var(--accent)] text-[var(--accent)] py-2 rounded text-sm hover:bg-[rgba(168,85,247,0.1)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isGenerating ? 'جاري العصف الذهني...' : '✨ اقتراح بالذكاء الاصطناعي'}
        </button>
        <button 
          onClick={async () => {
             setIsGenerating(true);
             try {
               const colorCode = await generateSuggestion(`قم بتحليل المشاعر في هذه الجملة: "${b.text}". رد بكلمة واحدة فقط تمثل لون HEX مناسب للمشاعر. مثلاً: #FFCCCC للغضب، #CCCCFF للحزن، #CCFFCC للسعادة، #FFFFFF للعادي أو الحيادي. رد فقط برمز الـ HEX.`, 'dialogue');
               if (colorCode && colorCode.trim().startsWith('#')) {
                 update({ bubbleColor: colorCode.trim() });
               } else {
                 alert('تعذر استنتاج لون المشاعر.');
               }
             } finally { setIsGenerating(false); }
          }}
          disabled={isGenerating}
          className="w-full bg-[var(--bg)] border border-rose-500/50 text-rose-500 py-2 rounded text-sm hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <HeartPulse size={16} /> تحليل المشاعر (تلوين ذكي)
        </button>

        <button 
           onClick={async () => {
              setIsGenerating(true);
              try {
                const { generateSuggestion } = await import('../lib/aiService');
                const charMatch = project.characters?.find(c => c.avatarUrl === b.avatarUrl);
                let contextText = b.text;
                if (charMatch && charMatch.details) {
                  contextText = `المتحدث ${charMatch.name} (${charMatch.details}): ${b.text}`;
                }
                const rawOptions = await generateSuggestion(contextText, 'options', project);
                if (rawOptions) {
                  try {
                    const parsed = JSON.parse(rawOptions.replace(/```json/g, '').replace(/```/g, '').trim());
                    if (Array.isArray(parsed) && parsed.length >= 2) {
                       setOptionsModal({
                         isOpen: true,
                         options: parsed,
                         onSelect: (index: number) => {
                           update({ text: b.text + '\n\n' + parsed[index] });
                           setOptionsModal(null);
                         }
                       });
                    } else {
                       alert("الخيارات المستلمة:\n" + rawOptions);
                    }
                  } catch(e) {
                    alert("الخيارات المقترحة:\n\n" + rawOptions);
                  }
                }
              } finally {
                setIsGenerating(false);
              }
           }}
           disabled={isGenerating}
           className="w-full bg-[var(--bg)] border border-yellow-500/50 text-yellow-500 py-2 mt-0 rounded text-xs hover:bg-yellow-500/10 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <Sparkles size={12} /> اقترح خيارات استجابة
        </button>
      </div>
    </>
  );

  const renderCalloutProps = (b: any) => (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-[0.8rem] text-[var(--text)]">نوع المربع</label>
        <select 
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] p-2 rounded text-[0.85rem]"
          value={b.calloutType} 
          onChange={e => update({ calloutType: e.target.value })}
        >
          <option value="note">ملاحظة عادية (أصفر)</option>
          <option value="flashback">فلاش باك / ماضي (رمادي)</option>
          <option value="warning">تحذير / خطورة (أحمر)</option>
          <option value="info">معلومة / اكتشاف (أزرق)</option>
          <option value="quote">اقتباس (ذهبي/بني)</option>
        </select>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-[0.8rem] text-[var(--text)]">تخصيص لون الخلفية</label>
        <input 
          type="color" 
          value={b.backgroundColor || '#ffffff'} 
          onChange={e => update({ backgroundColor: e.target.value })}
          className="w-full h-10 rounded cursor-pointer bg-transparent border-[var(--border)] p-1"
        />
        <button onClick={() => update({ backgroundColor: undefined, textColor: undefined })} className="text-xs text-[var(--text-dim)] hover:text-white mt-1">إعادة تعيين للألوان الافتراضية</button>
      </div>
    </>
  );

  const renderTableProps = (b: any) => (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-[0.8rem] text-[var(--text)]">عدد الأعمدة</label>
        <div className="flex border border-[var(--border)] rounded overflow-hidden">
           {[1, 2, 3, 4, 5, 6].map((colCount) => (
             <button 
               key={colCount}
               onClick={() => {
                 if (b.columns === colCount) return;
                 const newRows = b.rows.map((r: any) => {
                   const newRow = [];
                   for(let i = 0; i < colCount; i++) newRow.push(r[i] || '');
                   return newRow;
                 });
                 update({ columns: colCount, rows: newRows });
               }} 
               className={`flex-1 py-1.5 text-xs sm:text-sm transition-colors border-l last:border-l-0 border-[var(--border)] ${b.columns === colCount ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg)] hover:bg-[var(--border)]'}`}
             >
               {colCount}
             </button>
           ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-[0.8rem] text-[var(--text)]">تعبئة ذكية بالذكاء الاصطناعي</label>
        <button 
           onClick={async () => {
              const command = window.prompt("ما هي البيانات التي تريد ملء الجدول بها بناءً على القصة؟ (مثال: إحصائيات بطل القصة، تسلسل زمني للحروب...)");
              if (!command) return;
              setIsGenerating(true);
              try {
                const { generateSuggestion } = await import('../lib/aiService');
                const context = `نريد إنشاء جدول يحتوي على ${b.columns} أعمدة. المطلوب هو:\n${command}\n\nالإرجاع يجب أن يكون بصيغة JSON Array of Arrays (مصفوفة ثنائية الأبعاد فقط) حيث كل مصفوفة داخلية تمثل صفاً واحداً ولا يجب إرجاع أي نص إضافي.`;
                const result = await generateSuggestion(context, 'options', project);
                if (result) {
                   try {
                     const parsedRows = JSON.parse(result);
                     if (Array.isArray(parsedRows) && Array.isArray(parsedRows[0])) {
                        // Normalize columns width to match current table
                        const normalizedRows = parsedRows.map((r: any[]) => {
                           const row = [];
                           for(let i=0; i<b.columns; i++) row.push(r[i] ? String(r[i]) : '');
                           return row;
                        });
                        update({ rows: normalizedRows });
                     } else {
                        alert('رد الذكاء الاصطناعي لم يكن بالتنسيق المطلوب (مصفوفة).');
                     }
                   } catch(e) {
                      alert('تعذر قراءة بيانات الجدول من المولد (JSON Error).');
                   }
                }
              } finally {
                setIsGenerating(false);
              }
           }}
           disabled={isGenerating}
           className="w-full bg-[var(--bg)] border border-blue-500/50 text-blue-500 py-2 rounded text-xs hover:bg-blue-500/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-bold"
        >
           <Sparkles size={14} /> إنشاء محتوى للجدول (AI)
        </button>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <p className="text-[0.7rem] text-[var(--text-dim)] border-t border-[var(--border)] pt-2 mt-2">يمكنك الكتابة داخل خلايا الجدول مباشرة من الواجهة الرئيسية.</p>
      </div>
    </>
  );

  const renderDividerProps = (b: any) => (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-[0.8rem] text-[var(--text)]">نوع وشكل الخط الفاصل</label>
        <select 
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] p-2 rounded text-[0.85rem]"
          value={b.style} 
          onChange={e => update({ style: e.target.value })}
        >
          <option value="solid">مستمر (صلب)</option>
          <option value="dashed">متقطع (Dashed)</option>
          <option value="dotted">منقط (Dotted)</option>
          <option value="double">مزدوج (Double)</option>
          <option value="wavy">مموج (Wavy)</option>
        </select>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-[0.8rem] text-[var(--text)]">لون الخط</label>
        <input 
          type="color" 
          value={b.color || '#cccccc'} 
          onChange={e => update({ color: e.target.value })}
          className="w-full h-10 rounded cursor-pointer bg-transparent border-0 p-0"
        />
      </div>
      <div className="flex flex-col gap-2 mt-2">
         <label className="text-[0.8rem] text-[var(--text)]">سُمك الخط (Thickness)</label>
         <input 
           type="range" min="1" max="10" 
           value={b.thickness ?? 2} 
           onChange={e => update({ thickness: Number(e.target.value) })}
           className="accent-[var(--accent)]"
         />
      </div>
    </>
  );

  const renderPageProps = () => (
    <div className="flex flex-col gap-6">
      <h3 className="text-xs uppercase tracking-wider text-[var(--text-dim)] font-bold flex items-center gap-2">
        <Palette size={16} /> خصائص الصفحة
      </h3>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[0.8rem] text-[var(--text)]">لون خلفية الورقة</label>
          <div className="flex gap-2 items-center">
            <input 
              type="color" 
              value={project.backgroundColor || '#ffffff'} 
              onChange={e => updateProject({ backgroundColor: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-[var(--border)] p-0 bg-transparent flex-shrink-0"
            />
            <span className="text-[var(--text-dim)] font-mono text-xs">{project.backgroundColor || '#ffffff'}</span>
          </div>
        </div>
        
        {/* New Background Image feature */}
        <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-4 mt-2">
          <label className="text-[0.8rem] text-[var(--accent)] font-bold mb-2 pb-2 border-b border-[var(--border)]">إعدادات غلاف القصة للصفحة</label>
          <div className="flex items-center justify-between bg-black/10 p-2 rounded border border-[var(--border)] mb-2">
            <span className="text-xs">هل هذه صفحة غلاف القصة؟</span>
            <input 
              type="checkbox"
              checked={activePage?.isCover || false}
              onChange={e => updateProject({
                 pages: project.pages.map(p => p.id === activePageId ? { ...p, isCover: e.target.checked } : p)
              })}
              className="accent-[var(--accent)] cursor-pointer w-4 h-4"
            />
          </div>

          <label className="text-[0.8rem] text-[var(--text)]">صورة الغلاف / الخلفية</label>
          
          <label className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] py-2.5 rounded text-sm hover:bg-[var(--border)] transition-colors cursor-pointer text-center block w-full flex items-center justify-center gap-2">
            <ImagePlus size={16}/> إضافة/تغيير طبقة الصورة
            <input type="file" accept="image/*" className="hidden" onChange={async e => {
               const file = e.target.files?.[0];
               if (!file) return;
               try {
                 const url = await fileToDataUrl(file);
                 updateProject({
                   pages: project.pages.map(p => p.id === activePageId ? { ...p, backgroundImage: url } : p)
                 });
               } catch (err) { }
            }} />
          </label>
          {activePage?.backgroundImage && (
            <button 
              onClick={() => updateProject({ pages: project.pages.map(p => p.id === activePageId ? { ...p, backgroundImage: undefined } : p) })} 
              className="text-xs text-red-500 hover:text-red-400 mt-1"
            >
              حذف الصورة
            </button>
          )}

          {activePage?.isCover && (
            <div className="flex flex-col gap-2 mt-4 border border-[var(--border)] p-3 rounded bg-black/20">
              <label className="text-xs text-[var(--accent)] font-bold">مصمم الأغلفة</label>
              <p className="text-[10px] text-[var(--text-dim)] mb-2">أضف "مربع نص ضخم" للعنوان و"مربع نص عادي" لاسم المؤلف فوق الغلاف. سيتم دمجهم כغلاف كامل ومستقل عند الطباعة بصيغة PDF.</p>
              
              <button 
                onClick={async () => {
                   const { generateId } = await import('../lib/utils');
                   const barcodeBlock = {
                       id: generateId(), type: 'image' as const, width: 200, height: 100, x: 50, y: 500, align: 'center', url: 'https://barcode.tec-it.com/barcode.ashx?data=978020137962&code=ISBN13&translate-esc=on'
                   } as any;
                   updateProject({ pages: project.pages.map(p => p.id === activePageId ? { ...p, blocks: [...p.blocks, barcodeBlock] } : p) });
                }}
                className="w-full bg-[var(--bg)] border border-[var(--border)] hover:bg-[#333] py-2 text-xs rounded transition-colors flex items-center justify-center gap-2 font-bold"
              >
                توليد باركود ISBN للغلاف
              </button>
            </div>
          )}
        </div>

        {/* Subplots Tagging feature */}
        <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-4 mt-2">
          <label className="text-[0.8rem] text-[var(--text)] font-bold mb-2">الحبكات الفرعية الموجودة في هذه الصفحة</label>
          <div className="flex flex-wrap gap-2">
            {(project.subplots || []).map(sp => {
              const isActive = activePage?.subplots?.includes(sp.id);
              return (
                <button
                  key={sp.id}
                  onClick={() => {
                    const curr = activePage?.subplots || [];
                    updateProject({
                      pages: project.pages.map(p => 
                        p.id === activePageId 
                          ? { ...p, subplots: isActive ? curr.filter(id => id !== sp.id) : [...curr, sp.id] } 
                          : p
                      )
                    });
                  }}
                  className={cn(
                    "text-xs px-2 py-1 rounded border transition-colors",
                    isActive ? "text-white" : "bg-transparent text-[var(--text-dim)] hover:bg-[var(--bg)]"
                  )}
                  style={isActive ? { backgroundColor: sp.color, borderColor: sp.color } : { borderColor: 'var(--border)' }}
                >
                  {sp.name}
                </button>
              );
            })}
            {(!project.subplots || project.subplots.length === 0) && (
              <span className="text-[10px] text-[var(--text-dim)]">أضف حبكات فرعية من قسم 'السيناريو'</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[0.8rem] text-[var(--accent)] font-bold">حجم الصفحة (للقراءة / للطباعة)</label>
          <select
            value={project.pageFormat || 'Custom'}
            onChange={e => updateProject({ pageFormat: e.target.value as any })}
            className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
          >
            <option value="A4">A4 (210x297mm) - مثالي للهاردكوفر والمستندات</option>
            <option value="A5">A5 (148x210mm) - مقاس الروايات القياسي</option>
            <option value="B5">B5 (176x250mm) - مقاس فاخر / للقصص</option>
            <option value="Manhwa">مانهوا (Webtoon) - طويل جداً للقراءة الرقمية</option>
            <option value="Manga">مانجا (Tankobon) - 130x180mm</option>
            <option value="WebNovel">رواية ويب - عرض واسع مريح</option>
            <option value="Letter">US Letter - طباعة رسائل أمريكية</option>
            <option value="Custom">تخصيص حر (مخصص للقراءة الرقمية)</option>
          </select>
        </div>

        {(!project.pageFormat || project.pageFormat === 'Custom') && (
          <div className="flex flex-col gap-2">
            <label className="text-[0.8rem] text-[var(--text)] flex justify-between">
              <span>عرض الصفحة الحر (بالبكسل)</span>
              <span className="text-[var(--accent)] font-mono">{project.pageWidth || 624}px</span>
            </label>
            <input 
              type="range" min="400" max="1400" step="10"
              value={project.pageWidth || 624} 
              onChange={e => updateProject({ pageWidth: Number(e.target.value) })}
              className="accent-[var(--accent)]"
            />
          </div>
        )}

        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg flex gap-2 items-start">
          <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-yellow-200/80 leading-relaxed">
            تنبيه: تغيير مساحة الهوامش (Padding) أو المسافة بين العناصر (Gap) قد يؤثر بشكل مباشر على مظهر الصفحات عند الطباعة الورقية. يرجى تجربة الطباعة بعد كل تعديل.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[0.8rem] text-[var(--text)] flex justify-between">
            <span>الهوامش (Padding)</span>
            <span className="text-[var(--accent)] font-mono">{project.pagePadding || 0}px</span>
          </label>
          <input 
            type="range" min="0" max="120" step="4"
            value={project.pagePadding || 0} 
            onChange={e => updateProject({ pagePadding: Number(e.target.value) })}
            className="accent-[var(--accent)]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[0.8rem] text-[var(--text)] flex justify-between">
            <span>المسافة (Gap)</span>
            <span className="text-[var(--accent)] font-mono">{project.blockGap || 0}px</span>
          </label>
          <input 
            type="range" min="0" max="120" step="4"
            value={project.blockGap || 0} 
            onChange={e => updateProject({ blockGap: Number(e.target.value) })}
            className="accent-[var(--accent)]"
          />
        </div>
      </div>
    </div>
  );

  const renderCharactersTab = () => {
    const chars = project.characters || [];
    const selectedChar = chars.find(c => c.id === selectedCharId);
    const relations = project.relations || [];

    return (
      <div className="flex flex-col h-full gap-4">
        <div className="flex justify-between items-center mb-0">
           <h3 className="text-xs uppercase tracking-wider text-[var(--text-dim)] font-bold flex items-center gap-2">طاقم الشخصيات</h3>
           <button onClick={addCharacter} className="p-1 hover:bg-[rgba(168,85,247,0.1)] text-[var(--accent)] rounded transition-colors"><Plus size={16}/></button>
        </div>

        {!selectedCharId ? (
          <div className="flex flex-col gap-4">
            {chars.length === 0 ? (
              <p className="text-xs text-[var(--text-dim)] text-center py-4">لم تقم بإضافة أي شخصيات بعد.</p>
            ) : (
              (['main', 'secondary', 'unappeared', 'dead', 'none'] as const).map(roleGroup => {
                const groupChars = chars.filter(c => roleGroup === 'none' ? !c.role : c.role === roleGroup);
                if (groupChars.length === 0) return null;
                
                const groupTitle = 
                  roleGroup === 'main' ? 'شخصيات رئيسية' :
                  roleGroup === 'secondary' ? 'شخصيات ثانوية' :
                  roleGroup === 'unappeared' ? 'لم تخرج في القصة بعد' :
                  roleGroup === 'dead' ? 'شخصيات ميتة' : 'غير مصنف';

                return (
                  <div key={roleGroup} className="flex flex-col gap-2">
                    <h4 className="text-[10px] text-[var(--accent)] font-bold mb-1 border-b border-[var(--border)] pb-1">{groupTitle}</h4>
                    {groupChars.map(char => (
                      <div 
                        key={char.id} 
                        onClick={() => setSelectedCharId(char.id)}
                        className="flex items-center gap-3 p-2 border border-[var(--border)] rounded cursor-pointer hover:border-[var(--accent)] transition-colors bg-[var(--bg)]"
                      >
                        <div className="w-10 h-10 rounded bg-slate-200 overflow-hidden flex-shrink-0">
                           {char.avatarUrl ? <img src={char.avatarUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover"/> : <UserCircle2 className="w-full h-full p-2 text-slate-400" />}
                        </div>
                        <span className="text-sm font-bold flex-1 truncate">{char.name}</span>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          selectedChar && (
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setSelectedCharId(null)}
                className="text-xs text-[var(--accent)] self-start hover:underline"
              >
                &larr; رجوع للقائمة
              </button>

              <div className="flex flex-col gap-2">
                <label className="text-[0.8rem] text-[var(--text)]">الدور العضوي في القصة</label>
                <select 
                  value={selectedChar.role || 'none'}
                  onChange={e => updateCharacter(selectedChar.id, { role: e.target.value === 'none' ? undefined : e.target.value as any })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="none">غير مصنف</option>
                  <option value="main">شخصية رئيسية</option>
                  <option value="secondary">شخصية ثانوية</option>
                  <option value="unappeared">لم تخرج في القصة بعد</option>
                  <option value="dead">شخصية ميتة</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.8rem] text-[var(--text)]">مجلد صور الشخصية</label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded bg-slate-200 overflow-hidden flex-shrink-0 border border-[var(--border)] relative cursor-pointer" title="الصورة الرئيسية المختارة حالياً">
                     {selectedChar.avatarUrl ? <img src={selectedChar.avatarUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover"/> : <UserCircle2 className="w-full h-full p-2 text-slate-400" />}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-[8px] text-white font-bold text-center px-1">الصورة الرئيسية</span>
                     </div>
                  </div>
                  <label className="bg-[var(--bg)] border border-[var(--border)] text-[var(--accent)] px-3 py-1.5 rounded text-xs hover:border-[var(--accent)] transition-colors cursor-pointer font-medium flex-1 text-center border-dashed">
                    + رفع صورة أخرى للمجلد
                    <input type="file" accept="image/*" multiple className="hidden" onChange={async e => {
                      if (!e.target.files) return;
                      const newImages = [...(selectedChar.images || [])];
                      // Iterate and create ObjectURLs (in a real app, upload to storage)
                      for(let i = 0; i < e.target.files.length; i++) {
                          const file = e.target.files[i];
                          const url = URL.createObjectURL(file);
                          newImages.push({ id: Math.random().toString(36).substr(2, 9), url, name: file.name });
                          // Automatically set as main if it's the first image ever
                          if (!selectedChar.avatarUrl && i === 0) {
                              updateCharacter(selectedChar.id, { avatarUrl: url });
                          }
                      }
                      updateCharacter(selectedChar.id, { images: newImages });
                    }} />
                  </label>
                </div>
                
                {/* Images grid for this character */}
                {(selectedChar.images && selectedChar.images.length > 0) && (
                  <div className="grid grid-cols-4 gap-2 mt-2 bg-[#151515] p-2 rounded-lg border border-[var(--border)] max-h-[150px] overflow-y-auto custom-scrollbar">
                    {selectedChar.images.map(img => (
                      <div key={img.id} className="relative group aspect-square rounded overflow-hidden">
                        <img src={img.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                          <button 
                            onClick={() => updateCharacter(selectedChar.id, { avatarUrl: img.url })}
                            className="bg-[var(--accent)] text-white text-[9px] px-2 py-1 rounded hover:bg-purple-600"
                            title="تعيين كصورة رئيسية للمحادثة والواجهة"
                          >
                           رئيسية
                          </button>
                          <button 
                            onClick={() => {
                               // if deleting the main image, clear the main image too
                               const willClearMain = selectedChar.avatarUrl === img.url;
                               updateCharacter(selectedChar.id, { 
                                 images: selectedChar.images?.filter(i => i.id !== img.id),
                                 avatarUrl: willClearMain ? '' : selectedChar.avatarUrl 
                               });
                            }}
                            className="bg-red-500 text-white text-[9px] px-2 py-1 rounded hover:bg-red-600"
                          >
                           حذف
                          </button>
                        </div>
                        {selectedChar.avatarUrl === img.url && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]" title="الصورة الرئيسية"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.8rem] text-[var(--text)]">الاسم</label>
                <input 
                  type="text" 
                  value={selectedChar.name}
                  onChange={e => updateCharacter(selectedChar.id, { name: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[0.8rem] text-[var(--text)] flex justify-between">
                  سمات و ملامح الشخصية
                  <button 
                    onClick={() => handleAI(selectedChar.details, 'narrative', (details) => updateCharacter(selectedChar.id, { details }))}
                    className="text-[var(--accent)] text-xs hover:underline flex items-center gap-1"
                  >
                     <Sparkles size={12}/> توليد أفكار
                  </button>
                </label>
                <textarea 
                  value={selectedChar.details}
                  onChange={e => updateCharacter(selectedChar.id, { details: e.target.value })}
                  placeholder="طباعها، دورها في القصة، ملامحها..."
                  className="w-full min-h-[80px] bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[0.8rem] text-[var(--text)] font-bold text-yellow-500">العمر</label>
                  <input 
                     type="text"
                     value={selectedChar.age || ''}
                     onChange={e => updateCharacter(selectedChar.id, { age: e.target.value })}
                     placeholder="مثال: 24 عاماً"
                     className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.8rem] text-[var(--text)] font-bold text-indigo-400">مستوى الشخصية (لفل)</label>
                  <input 
                     type="text"
                     value={selectedChar.level || ''}
                     onChange={e => updateCharacter(selectedChar.id, { level: e.target.value })}
                     placeholder="مثال: لفل 10 / ساحر أعلى"
                     className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[0.8rem] text-[var(--text)] font-bold text-rose-500">مخاوف الشخصية</label>
                <textarea 
                  value={selectedChar.fears || ''}
                  onChange={e => updateCharacter(selectedChar.id, { fears: e.target.value })}
                  placeholder="مما تخاف هذه الشخصية؟ ما هي عقدها النفسية؟"
                  className="w-full min-h-[60px] bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[0.8rem] text-[var(--text)] font-bold text-red-600">أعداء الشخصية</label>
                <textarea 
                  value={selectedChar.enemies || ''}
                  onChange={e => updateCharacter(selectedChar.id, { enemies: e.target.value })}
                  placeholder="أسماء الأعداء، أو خصمئيسي، أو جهات تعاديها..."
                  className="w-full min-h-[60px] bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
                <p className="text-[10px] text-[var(--text-dim)]">يمكنك أيضاً ربط الشخصيات المسجلة من قسم "الصلة" بالأسفل كأعداء.</p>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[0.8rem] text-[var(--text)] font-bold text-emerald-400">الدين والاعتقادات واللغة</label>
                <select 
                  value={selectedChar.beliefId || ''}
                  onChange={e => updateCharacter(selectedChar.id, { beliefId: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="">-- اختر الدين أو الاعتقاد --</option>
                  {(project.religions || []).map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <input 
                  type="text"
                  placeholder="ما هي لغتها أو معتقدات إضافية؟"
                  value={selectedChar.language || ''}
                  onChange={e => updateCharacter(selectedChar.id, { language: e.target.value })}
                  className="w-full mt-1 bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
                <p className="text-[10px] text-[var(--text-dim)]">يتم إضافة الأديان والمعتقدات من قسم اللغة المبتكرة (القاموس).</p>
              </div>

              <div className="flex flex-col gap-2 mt-2 border-t border-[var(--border)] pt-2">
                <label className="text-[0.8rem] text-[var(--text)] font-bold text-blue-500">قدرات الشخصية الجسدية والسحرية</label>
                <div className="flex gap-2">
                  <input 
                    type="text" id="new-ability-name"
                    placeholder="اسم القدرة..."
                    className="flex-1 bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] w-1/3"
                  />
                  <input 
                    type="text" id="new-ability-desc"
                    placeholder="وصف للقدرة..."
                    className="flex-1 bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const nameInput = document.getElementById('new-ability-name') as HTMLInputElement;
                        const descInput = document.getElementById('new-ability-desc') as HTMLInputElement;
                        if (nameInput.value.trim() && descInput.value.trim()) {
                           updateCharacter(selectedChar.id, { 
                             abilities: [...(selectedChar.abilities || []), { name: nameInput.value.trim(), desc: descInput.value.trim() }] 
                           });
                           nameInput.value = '';
                           descInput.value = '';
                        }
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                        const nameInput = document.getElementById('new-ability-name') as HTMLInputElement;
                        const descInput = document.getElementById('new-ability-desc') as HTMLInputElement;
                        if (nameInput.value.trim() && descInput.value.trim()) {
                           updateCharacter(selectedChar.id, { 
                             abilities: [...(selectedChar.abilities || []), { name: nameInput.value.trim(), desc: descInput.value.trim() }] 
                           });
                           nameInput.value = '';
                           descInput.value = '';
                        }
                    }}
                    className="bg-[var(--accent)] text-white px-3 rounded text-sm"
                  >إضافة</button>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {(selectedChar.abilities || []).map((ab, idx) => (
                    <div key={idx} className="bg-[var(--bg)] border border-[var(--border)] text-xs p-2 rounded flex flex-col gap-1 relative">
                      <strong className="text-[var(--accent)] text-sm">{ab.name}</strong>
                      <span className="text-[var(--text-dim)]">{ab.desc}</span>
                      <button onClick={() => updateCharacter(selectedChar.id, { abilities: selectedChar.abilities?.filter((_, i) => i !== idx) })} className="absolute top-2 left-2 text-red-400 hover:text-red-300"><X size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[0.8rem] text-[var(--text)] font-bold text-cyan-500">تذكيرات أفكار / أعمال (Reminders)</label>
                <textarea 
                  value={selectedChar.reminders || ''}
                  onChange={e => updateCharacter(selectedChar.id, { reminders: e.target.value })}
                  placeholder="افكار عملتها الشخصية أو ستعملها مستقبلاً..."
                  className="w-full min-h-[80px] bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                <label className="text-[0.8rem] text-[var(--text)] font-bold text-indigo-400 flex items-center justify-between">
                  مكان الشخصية الحالي
                  <span className="text-[10px] text-[var(--text-dim)] font-normal">لتتذكر موقعها في القصة</span>
                </label>
                <input 
                  type="text"
                  value={selectedChar.currentLocation || ''}
                  onChange={e => updateCharacter(selectedChar.id, { currentLocation: e.target.value })}
                  placeholder="أين تتواجد الشخصية حالياً في أحداث القصة؟"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                <label className="text-[0.8rem] text-[var(--text)] font-bold text-green-400">هدف الشخصية (النهائي)</label>
                <input 
                  type="text"
                  value={selectedChar.goal || ''}
                  onChange={e => updateCharacter(selectedChar.id, { goal: e.target.value })}
                  placeholder="ما الذي يسعى للوصول إليه؟"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.8rem] text-[var(--text)] font-bold text-orange-400">أدوات وممتلكات الشخصية</label>
                <div className="flex gap-2">
                  <input 
                    type="text" id="new-item-input"
                    placeholder="إضافة أداة / سلاح..."
                    className="flex-1 bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value.trim();
                        if (val) {
                          updateCharacter(selectedChar.id, { inventory: [...(selectedChar.inventory || []), val] });
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('new-item-input') as HTMLInputElement;
                      const val = input.value.trim();
                      if (val) {
                        updateCharacter(selectedChar.id, { inventory: [...(selectedChar.inventory || []), val] });
                        input.value = '';
                      }
                    }}
                    className="bg-[var(--accent)] text-white px-3 rounded text-sm"
                  >إضافة</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(selectedChar.inventory || []).map((item, idx) => (
                    <div key={idx} className="bg-[var(--bg)] border border-[var(--border)] text-xs px-2 py-1 rounded flex items-center gap-2">
                      <span>{item}</span>
                      <button onClick={() => updateCharacter(selectedChar.id, { inventory: selectedChar.inventory?.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-300"><X size={12}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.8rem] text-[var(--text)] font-bold text-purple-400">النقابة / المملكة التابع لها</label>
                <div className="flex flex-wrap gap-2">
                   {(project.factions || []).map(faction => {
                      const isActive = selectedChar.factionIds?.includes(faction.id);
                      return (
                         <button 
                           key={faction.id}
                           onClick={() => {
                              const curr = selectedChar.factionIds || [];
                              updateCharacter(selectedChar.id, { 
                                factionIds: isActive ? curr.filter(id => id !== faction.id) : [...curr, faction.id]
                              });
                           }}
                           className={cn("text-[10px] px-2 py-1 rounded border", isActive ? "bg-purple-600 border-purple-500 text-white" : "bg-transparent border-[var(--border)] text-[var(--text-dim)]")}
                         >
                           {faction.name} ({faction.type})
                         </button>
                      );
                   })}
                   {(!project.factions || project.factions.length === 0) && (
                     <span className="text-[10px] text-[var(--text-dim)]">لم يتم إنشاء نقابات أو ممالك بعد. أنشئها في قسم النقابات.</span>
                   )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <label className="text-[0.8rem] text-[var(--text)] font-bold text-amber-500">العائلة / القبيلة المرتبطة</label>
                <div className="flex flex-wrap gap-2">
                   {(project.families || []).map(fam => {
                      const isActive = selectedChar.familyIds?.includes(fam.id);
                      return (
                         <button 
                           key={fam.id}
                           onClick={() => {
                              const curr = selectedChar.familyIds || [];
                              updateCharacter(selectedChar.id, { 
                                familyIds: isActive ? curr.filter(id => id !== fam.id) : [...curr, fam.id]
                              });
                           }}
                           className={cn("text-[10px] px-2 py-1 rounded border", isActive ? "bg-amber-600 border-amber-500 text-white" : "bg-transparent border-[var(--border)] text-[var(--text-dim)]")}
                         >
                           {fam.name} ({fam.type})
                         </button>
                      );
                   })}
                   {(!project.families || project.families.length === 0) && (
                     <span className="text-[10px] text-[var(--text-dim)]">لم يتم إنشاء عائلات بعد. أنشئها في قسم النقابات.</span>
                   )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <label className="text-[0.8rem] text-[var(--text)] font-bold text-pink-400">تقسيمات أخرى (مدارس/طوائف/فرق)</label>
                <div className="flex flex-wrap gap-2">
                   {(project.otherGroups || []).map(group => {
                      const isActive = selectedChar.otherGroupIds?.includes(group.id);
                      return (
                         <button 
                           key={group.id}
                           onClick={() => {
                              const curr = selectedChar.otherGroupIds || [];
                              updateCharacter(selectedChar.id, { 
                                otherGroupIds: isActive ? curr.filter(id => id !== group.id) : [...curr, group.id]
                              });
                           }}
                           className={cn("text-[10px] px-2 py-1 rounded border", isActive ? "bg-pink-600 border-pink-500 text-white" : "bg-transparent border-[var(--border)] text-[var(--text-dim)]")}
                         >
                           {group.name}
                         </button>
                      );
                   })}
                   {(!project.otherGroups || project.otherGroups.length === 0) && (
                     <span className="text-[10px] text-[var(--text-dim)]">لم يتم إنشاء تقسيمات بعد. أنشئها في قسم النقابات.</span>
                   )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[0.8rem] text-[var(--text)] font-bold text-red-500">الحالة الصحية / الجسدية</label>
                <input 
                  type="text"
                  value={selectedChar.healthStatus || ''}
                  onChange={e => updateCharacter(selectedChar.id, { healthStatus: e.target.value })}
                  placeholder="مثال: سليم، مريض، بُترت يده اليمنى، ميت..."
                  className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Related Characters specific to this character */}
              {chars.length > 1 && (
                 <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                   <h4 className="text-[0.8rem] font-bold text-cyan-400">شخصيات قريبة لها (الصلة)</h4>
                   
                   {/* List existing relations */}
                   <div className="flex flex-col gap-2 mb-2">
                       {relations.filter(r => r.char1Id === selectedChar.id || r.char2Id === selectedChar.id).map(rel => {
                          const otherCharId = rel.char1Id === selectedChar.id ? rel.char2Id : rel.char1Id;
                          const otherChar = chars.find(c => c.id === otherCharId);
                          if(!otherChar) return null;
                          
                          return (
                            <div key={rel.id} className="flex items-center gap-2 justify-between bg-[var(--bg)] p-2 rounded border border-[var(--border)]">
                               <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded bg-slate-200 overflow-hidden flex-shrink-0">
                                      {otherChar.avatarUrl ? <img src={otherChar.avatarUrl} className="w-full h-full object-cover"/> : <UserCircle2 className="w-full h-full p-0.5 text-slate-400" />}
                                  </div>
                                  <span className="text-xs font-bold">{otherChar.name}</span>
                                  <span className="text-[10px] text-[var(--accent)] border border-[var(--accent)] px-1 rounded bg-[rgba(168,85,247,0.1)]">{rel.type}</span>
                               </div>
                               <button onClick={() => deleteRelation(rel.id)} className="text-red-400 hover:text-red-300 transition-colors">
                                  <Trash2 size={12} />
                               </button>
                            </div>
                          )
                       })}
                   </div>

                   {/* Add Relation Form */}
                   <div className="flex items-center gap-2 mt-2">
                      <select 
                        className="bg-[var(--bg)] text-[11px] p-2 border border-[var(--border)] rounded outline-none flex-1"
                        id={`rel-char-select-${selectedChar.id}`}
                      >
                        <option value="">اختر شخصية...</option>
                        {chars.filter(c => c.id !== selectedChar.id).map(c => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      
                      <input 
                         type="text" 
                         id={`rel-type-input-${selectedChar.id}`}
                         placeholder="نوع الصلة (أخ، عدو...)"
                         className="flex-1 bg-[var(--bg)] text-[11px] p-2 border border-[var(--border)] rounded outline-none w-24"
                      />
                      
                      <button 
                        onClick={() => {
                           const charSelect = document.getElementById(`rel-char-select-${selectedChar.id}`) as HTMLSelectElement;
                           const typeInput = document.getElementById(`rel-type-input-${selectedChar.id}`) as HTMLInputElement;
                           const targetCharId = charSelect.value;
                           const relType = typeInput.value.trim();
                           
                           if (targetCharId && relType) {
                              addRelation(selectedChar.id, targetCharId, relType);
                              charSelect.value = '';
                              typeInput.value = '';
                           }
                        }}
                        className="bg-[var(--accent)] text-white px-3 py-1.5 rounded text-xs hover:bg-purple-600 transition-colors font-bold whitespace-nowrap"
                      >
                         ربط
                      </button>
                   </div>
                 </div>
              )}

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => {
                    const event = new CustomEvent('start-roleplay', { detail: { characterId: selectedChar.id } });
                    window.dispatchEvent(event);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 py-2 border border-blue-500 rounded transition-colors text-sm font-bold shadow-lg"
                >
                  <MessageSquare size={16} /> محادثة مع {selectedChar.name} (Roleplay)
                </button>

                <button 
                  onClick={() => deleteCharacter(selectedChar.id)}
                  className="flex items-center justify-center gap-2 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 border border-red-500/30 rounded transition-colors"
                  title="حذف الشخصية"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  const renderScenarioTab = () => (
    <div className="flex flex-col h-full gap-4">
      <h3 className="text-xs uppercase tracking-wider text-[var(--text-dim)] font-bold flex items-center gap-2">
         <FileText size={16} /> سيناريو وتخطيط الرواية
      </h3>
      <p className="text-xs text-[var(--text-dim)]">
        اكتب هنا الأفكار العامة، المسودة، والخطة للقصة. سيساعدك هذا المرجع أثناء تصميم الصفحات.
      </p>
      
      <button 
        onClick={() => handleAI(project.scenario || '', 'narrative', (scenario) => updateProject({ scenario }))}
        disabled={isGenerating}
        className="w-full bg-[var(--bg)] border border-[var(--accent)] text-[var(--accent)] py-2 rounded text-sm hover:bg-[rgba(168,85,247,0.1)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        توليد مسار قصة
      </button>

      <div className="flex flex-col gap-2 flex-1 min-h-[250px]">
        <label className="text-xs font-bold text-[var(--accent)]">السيناريو الأساسي</label>
        <textarea 
          value={project.scenario || ''}
          onChange={e => updateProject({ scenario: e.target.value })}
          placeholder="كان ياما كان..."
          className="w-full flex-1 bg-[var(--bg)] border border-[var(--border)] p-3 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] min-h-[200px] leading-relaxed resize-y"
        />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <label className="text-xs font-bold text-orange-400 flex items-center justify-between">
          <span>سيناريوهات بديلة</span>
          <button 
            onClick={() => updateProject({ alternativeScenarios: [...(project.alternativeScenarios || []), 'بديل جديد...'] })}
            className="text-[var(--accent)] hover:text-purple-400 p-1"
          ><Plus size={14}/></button>
        </label>
        {(project.alternativeScenarios || []).map((alt, idx) => (
          <div key={idx} className="flex flex-col gap-1 relative group">
            <textarea
              value={alt}
              onChange={e => {
                const newAlts = [...(project.alternativeScenarios || [])];
                newAlts[idx] = e.target.value;
                updateProject({ alternativeScenarios: newAlts });
              }}
              className="w-full bg-black/20 border border-[var(--border)] p-2 rounded text-xs text-[var(--text-dim)] outline-none focus:border-[var(--accent)] min-h-[80px]"
            />
            <button 
              onClick={() => updateProject({ alternativeScenarios: project.alternativeScenarios?.filter((_, i) => i !== idx) })}
              className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded transition-opacity"
            ><Trash2 size={12}/></button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-4 border-t border-[var(--border)] pt-4">
        <label className="text-xs font-bold text-rose-500 flex items-center justify-between">
          <span>أفكار وتويستات الحبكة (Twists)</span>
          <button 
            onClick={() => updateProject({ twists: [...(project.twists || []), { id: generateId(), title: 'تويست جديد', content: '' }] })}
            className="text-[var(--accent)] hover:text-purple-400 p-1"
          ><Plus size={14}/></button>
        </label>
        {(project.twists || []).map((twist, idx) => (
          <div key={twist.id} className="flex flex-col gap-1 relative group bg-[var(--bg)] border border-[var(--border)] p-2 rounded">
            <input
              type="text"
              value={twist.title}
              placeholder="عنوان الحبكة / التويست (مثال: خيانة الصديق)"
              onChange={e => {
                const newTwists = [...(project.twists || [])];
                newTwists[idx].title = e.target.value;
                updateProject({ twists: newTwists });
              }}
              className="w-full bg-transparent border-b border-[var(--border)] mb-1 pb-1 text-sm font-bold text-[var(--accent)] outline-none focus:border-[var(--accent)]"
            />
            <textarea
              value={twist.content}
              placeholder="شرح وتفاصيل الحبكة وكيف يمكن دمجها وكيف يمكن تطبيقها في القصة..."
              onChange={e => {
                const newTwists = [...(project.twists || [])];
                newTwists[idx].content = e.target.value;
                updateProject({ twists: newTwists });
              }}
              className="w-full bg-transparent p-1 rounded text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] min-h-[60px]"
            />
            <button 
              onClick={() => updateProject({ twists: project.twists?.filter(t => t.id !== twist.id) })}
              className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded transition-opacity"
            ><Trash2 size={12}/></button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWorldTab = () => {
    const lores = project.lore || [];
    const selectedLore = lores.find(l => l.id === selectedLoreId);

    const worldMap = project.worldMap || [];
    const selectedMapNode = worldMap.find(m => m.id === selectedMapNodeId);

    const addLore = () => {
      const newLore: Lore = { id: generateId(), title: 'عنصر جديد', content: '', type: 'general' };
      updateProject({ lore: [...lores, newLore] });
      setSelectedLoreId(newLore.id);
    };

    const addMapNode = () => {
      const newNode: WorldMapNode = { id: generateId(), name: 'مملكة/مدينة جديدة', type: 'kingdom' };
      updateProject({ worldMap: [...worldMap, newNode] });
      setSelectedMapNodeId(newNode.id);
    };

    const renderMapHierarchy = (parentId?: string, depth=0) => {
      const children = worldMap.filter(n => n.parentId === parentId);
      if (children.length === 0) return null;
      return (
        <div className="flex flex-col gap-1 w-full pl-2 border-l border-[var(--border)] mt-1">
          {children.map(node => (
            <div key={node.id} className="flex flex-col gap-1 w-full">
              <div 
                onClick={() => setSelectedMapNodeId(node.id)}
                className={cn("text-xs p-2 rounded cursor-pointer border hover:border-[var(--accent)] transition-colors flex justify-between", selectedMapNodeId === node.id ? "bg-[rgba(168,85,247,0.1)] border-[var(--accent)] text-[var(--accent)]" : "bg-[var(--bg)] border-[var(--border)] text-[var(--text)]")}
              >
                <span>{node.name}</span>
                <span className="text-[9px] text-[var(--text-dim)]">{node.type === 'kingdom' ? 'مملكة' : node.type === 'city' ? 'مدينة' : 'قرية'}</span>
              </div>
              {renderMapHierarchy(node.id, depth + 1)}
            </div>
          ))}
        </div>
      );
    };

    if (selectedMapNode) {
      return (
        <div className="flex flex-col h-full gap-4">
          <button onClick={() => setSelectedMapNodeId(null)} className="text-xs text-[var(--accent)] self-start hover:underline">&larr; رجوع للخريطة</button>
          
          <div className="flex flex-col gap-2">
            <label className="text-[0.8rem] text-[var(--text)]">صورة الموقع / المعلم</label>
            <div className="flex gap-4 items-center">
               <div className="w-16 h-16 rounded bg-slate-200 overflow-hidden flex-shrink-0 border border-[var(--border)]">
                  {selectedMapNode.imageUrl ? <img src={selectedMapNode.imageUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover"/> : <ImagePlus className="w-full h-full p-2 text-slate-400" />}
               </div>
               <label className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-3 py-1.5 rounded text-xs hover:bg-[var(--border)] transition-colors cursor-pointer font-medium">
                 رفع صورة الموقع
                 <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, url => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, imageUrl: url } : n) }))} />
               </label>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <input 
              type="text" value={selectedMapNode.name}
              onChange={e => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, name: e.target.value } : n) })}
              className="flex-1 bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] font-bold outline-none"
              placeholder="الاسم..."
            />
            
            <select 
              value={selectedMapNode.type}
              onChange={e => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, type: e.target.value as any } : n) })}
              className="w-1/3 bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm outline-none"
            >
              <option value="kingdom">مملكة</option>
              <option value="city">مقاطعة/مدينة</option>
              <option value="village">قرية/بلدة</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-xs text-[var(--text)] font-bold text-yellow-400">الكيان التابع له</label>
             <select 
               value={selectedMapNode.parentId || ''}
               onChange={e => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, parentId: e.target.value || undefined } : n) })}
               className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm outline-none"
             >
               <option value="">(مستقل - لا يتبع لأحد)</option>
               {worldMap.filter(n => n.id !== selectedMapNode.id).map(n => (
                 <option key={n.id} value={n.id}>تابعة لـ: {n.name}</option>
               ))}
             </select>
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-xs text-[var(--text)] font-bold text-blue-400">الحاكم / الزعيم</label>
             <input 
               type="text" value={selectedMapNode.leader || ''}
               onChange={e => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, leader: e.target.value } : n) })}
               className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm outline-none"
               placeholder="من يحكم هذه المنطقة؟"
             />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[var(--text)] font-bold text-cyan-400">المناخ والبيئة</label>
            <input 
               type="text" value={selectedMapNode.climate || ''}
               onChange={e => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, climate: e.target.value } : n) })}
               className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm outline-none"
               placeholder="مثال: ممطر دائماً، صحراوي قاحل، غابات مظلمة..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[var(--text)] font-bold text-green-400">الوضع الاقتصادي ومصادر الدخل</label>
            <input 
               type="text" value={selectedMapNode.economy || ''}
               onChange={e => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, economy: e.target.value } : n) })}
               className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm outline-none"
               placeholder="تعدين، زراعة، تجارة، ضرائب..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[var(--text)] font-bold text-purple-400">الطوائف والنقابات المتواجدة</label>
            <input 
               type="text" value={selectedMapNode.guilds || ''}
               onChange={e => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, guilds: e.target.value } : n) })}
               className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm outline-none"
               placeholder="من هي القوى المسيطرة فعلياً؟"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[var(--text)] font-bold text-red-500">المخاطر والتهديدات</label>
            <input 
               type="text" value={selectedMapNode.risks || ''}
               onChange={e => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, risks: e.target.value } : n) })}
               className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm outline-none"
               placeholder="قطاع طرق، وحوش، وباء..."
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
             <label className="text-[0.8rem] text-[var(--text)] flex items-center justify-between">
               تفاصيل جغرافية (الحدود)
               <button onClick={() => handleAI(selectedMapNode?.borders || '', 'narrative', (text) => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, borders: text } : n) }))} className="text-[var(--accent)] hover:underline flex items-center gap-1"><Sparkles size={12}/> أفكار</button>
             </label>
            <textarea 
              value={selectedMapNode.borders || ''}
              onChange={e => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, borders: e.target.value } : n) })}
              className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm outline-none min-h-[60px]"
              placeholder="الحدود والتضاريس المحيطة بها..."
            />
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-[0.8rem] text-[var(--text)] flex items-center justify-between">
               ملاحظات ووصف عام
               <button onClick={() => handleAI(selectedMapNode?.description || '', 'narrative', (text) => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, description: text } : n) }))} className="text-[var(--accent)] hover:underline flex items-center gap-1"><Sparkles size={12}/> توليد</button>
             </label>
            <textarea 
              value={selectedMapNode.description || ''}
              onChange={e => updateProject({ worldMap: worldMap.map(n => n.id === selectedMapNode.id ? { ...n, description: e.target.value } : n) })}
              className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm outline-none min-h-[80px]"
              placeholder="وصف للمنطقة، تاريخها، وأهم الأحداث التي ستقع فيها..."
            />
          </div>

          <button onClick={() => {
            updateProject({ worldMap: worldMap.filter(n => n.id !== selectedMapNode.id) });
            setSelectedMapNodeId(null);
          }} className="mt-2 text-red-500 hover:text-red-400 p-2 text-center text-sm bg-red-500/10 rounded">حذف الموقع</button>
        </div>
      );
    }

    if (selectedLore) {
       return (
          <div className="flex flex-col gap-4">
            <button onClick={() => setSelectedLoreId(null)} className="text-xs text-[var(--accent)] self-start hover:underline">&larr; رجوع</button>
            <input 
              type="text" value={selectedLore.title}
              onChange={e => updateProject({ lore: lores.map(l => l.id === selectedLore.id ? { ...l, title: e.target.value } : l) })}
              className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm font-bold outline-none"
            />
            <select 
              value={selectedLore.type || 'general'}
              onChange={e => updateProject({ lore: lores.map(l => l.id === selectedLore.id ? { ...l, type: e.target.value as any } : l) })}
              className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm outline-none"
            >
              <option value="general">عام / تاريخ</option>
              <option value="law">قوانين العالم</option>
              <option value="currency">عملات العالم</option>
              <option value="secret">أسرار العالم</option>
              <option value="economy">اقتصاد العالم</option>
            </select>
            <textarea 
              value={selectedLore.content}
              onChange={e => updateProject({ lore: lores.map(l => l.id === selectedLore.id ? { ...l, content: e.target.value } : l) })}
              className="w-full min-h-[250px] bg-[var(--bg)] border border-[var(--border)] p-3 rounded text-sm outline-none resize-y leading-relaxed"
            />
            <button onClick={() => { updateProject({ lore: lores.filter(l => l.id !== selectedLore.id) }); setSelectedLoreId(null); }} className="text-red-400 hover:text-red-300 p-2 bg-red-950/30 rounded text-sm">حذف</button>
          </div>
       );
    }

    const typeIcons: Record<string, string> = {
      'general': '📖', 'law': '⚖️', 'currency': '💰', 'secret': '👁️', 'economy': '📈'
    };
    const typeLabels: Record<string, string> = {
      'general': 'موسوعة عامة', 'law': 'قانون', 'currency': 'عملة', 'secret': 'سر', 'economy': 'اقتصاد'
    };

    return (
      <div className="flex flex-col h-full gap-6">
        
        {/* World Map Section */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center mb-1">
             <h3 className="text-xs uppercase tracking-wider text-[var(--accent)] font-bold flex items-center gap-2">
               <Globe size={16} /> المواقع الجغرافية
             </h3>
             <button onClick={addMapNode} className="p-1 hover:bg-[rgba(168,85,247,0.1)] text-[var(--accent)] rounded transition-colors"><Plus size={16}/></button>
          </div>
          {worldMap.length === 0 ? (
            <p className="text-xs text-[var(--text-dim)]">أضف ممالك، مدن، أو مناطق للعالم.</p>
          ) : (
            <div className="flex flex-col p-2 bg-black/20 rounded border border-[var(--border)] overflow-y-auto max-h-[250px]">
              {renderMapHierarchy(undefined)}
            </div>
          )}
        </div>

        {/* Lore Section */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center mb-1">
             <h3 className="text-xs uppercase tracking-wider text-[var(--accent)] font-bold flex items-center gap-2">
               <BookOpen size={16} /> موسوعة العالم
             </h3>
             <button onClick={addLore} className="p-1 hover:bg-[rgba(168,85,247,0.1)] text-[var(--accent)] rounded transition-colors"><Plus size={16}/></button>
          </div>
          {lores.length === 0 ? (
            <p className="text-xs text-[var(--text-dim)]">لم يتم إضافة قواعد أو تفاصيل.</p>
          ) : (
            <div className="flex flex-col gap-2">
               {lores.map(lore => (
                 <div key={lore.id} onClick={() => setSelectedLoreId(lore.id)} className="flex items-center gap-2 p-3 border border-[var(--border)] rounded cursor-pointer hover:border-[var(--accent)] bg-[var(--bg)]">
                    <span>{typeIcons[lore.type || 'general']}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{lore.title}</span>
                      <span className="text-[9px] text-[var(--text-dim)]">{typeLabels[lore.type || 'general']}</span>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>

      </div>
    );
  };

  const renderFactionsTab = () => {
    const factions = project.factions || [];
    const selectedFaction = factions.find(f => f.id === selectedFactionId);

    const addFaction = () => {
      const newFac: Faction = { id: generateId(), name: 'نقابة/فريق جديد', type: 'نقابة' };
      updateProject({ factions: [...factions, newFac] });
      setSelectedFactionId(newFac.id);
    };

    const updateFaction = (id: string, updates: Partial<Faction>) => {
      updateProject({ factions: factions.map(f => f.id === id ? { ...f, ...updates } : f) });
    };

    const deleteFaction = (id: string) => {
      updateProject({ 
        factions: factions.filter(f => f.id !== id),
        characters: (project.characters || []).map(c => ({
          ...c,
          factionIds: c.factionIds?.filter(fid => fid !== id)
        }))
      });
      if (selectedFactionId === id) setSelectedFactionId(null);
    };

    return (
      <div className="flex flex-col h-full gap-4">
        <div className="flex justify-between items-center mb-0">
           <h3 className="text-xs uppercase tracking-wider text-[var(--accent)] font-bold flex items-center gap-2">
             <Shield size={16} /> النقابات والممالك
           </h3>
           <button onClick={addFaction} className="p-1 hover:bg-[rgba(168,85,247,0.1)] text-[var(--accent)] rounded transition-colors"><Plus size={16}/></button>
        </div>

        {!selectedFactionId ? (
          <div className="flex flex-col gap-2">
            {factions.length === 0 ? (
              <p className="text-xs text-[var(--text-dim)] text-center py-4">أضف ممالك، نقابات، أو فرق.</p>
            ) : (
              factions.map(fac => (
                <div 
                  key={fac.id} 
                  onClick={() => setSelectedFactionId(fac.id)}
                  className="flex items-center gap-3 p-2 border border-[var(--border)] rounded cursor-pointer hover:border-[var(--accent)] transition-colors bg-[var(--bg)]"
                >
                  <div className="flex flex-col flex-1 truncate">
                    <span className="text-sm font-bold truncate">{fac.name}</span>
                    <span className="text-[10px] text-[var(--text-dim)]">{fac.type}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          selectedFaction && (
            <div className="flex flex-col gap-4">
              <button onClick={() => setSelectedFactionId(null)} className="text-xs text-[var(--accent)] self-start hover:underline">
                &larr; رجوع
              </button>

              <div className="flex flex-col gap-3">
                <input 
                  value={selectedFaction.name}
                  onChange={e => updateFaction(selectedFaction.id, { name: e.target.value })}
                  placeholder="الاسم..."
                  className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />

                <select 
                  value={selectedFaction.type}
                  onChange={e => updateFaction(selectedFaction.id, { type: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none"
                >
                  <option value="مملكة">مملكة</option>
                  <option value="نقابة">نقابة</option>
                  <option value="فريق">فريق</option>
                  <option value="أخرى">أخرى</option>
                </select>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[var(--text-dim)]">وصف أو قوانين الكيان</label>
                  <textarea 
                    value={selectedFaction.description || ''}
                    onChange={e => updateFaction(selectedFaction.id, { description: e.target.value })}
                    placeholder="ضع التفاصيل هنا..."
                    className="w-full min-h-[100px] bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-[var(--text-dim)]">الأعضاء (يتم إضافتهم من صفحة الشخصية)</label>
                  <div className="flex flex-wrap gap-2 p-2 bg-black/20 rounded min-h-[40px]">
                     {project.characters?.filter(c => c.factionIds?.includes(selectedFaction.id)).map(c => (
                        <div key={c.id} className="bg-[var(--bg)] border border-[var(--border)] px-2 py-1 rounded text-xs flex items-center gap-1">
                          {c.avatarUrl && <img src={c.avatarUrl} className="w-4 h-4 rounded-full object-cover" />}
                          {c.name}
                        </div>
                     ))}
                  </div>
                </div>

                <button 
                  onClick={() => deleteFaction(selectedFaction.id)}
                  className="mt-2 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 py-2 rounded text-sm"
                >
                  حذف الكيان
                </button>
              </div>
            </div>
          )
        )}

        {/* Families and Tribes Section */}
        <div className="flex flex-col gap-3 mt-4 border-t border-[var(--border)] pt-4 pb-12">
          <div className="flex justify-between items-center mb-0">
             <h3 className="text-xs uppercase tracking-wider text-amber-500 font-bold flex items-center gap-2">العائلات والقبائل</h3>
             <button onClick={() => updateProject({ families: [...(project.families || []), { id: generateId(), name: 'عائلة/قبيلة جديدة', type: 'family', description: '' }] })} className="p-1 hover:bg-[rgba(245,158,11,0.1)] text-amber-500 rounded transition-colors"><Plus size={16}/></button>
          </div>
          
          {(project.families || []).length === 0 ? (
             <p className="text-xs text-[var(--text-dim)] text-center py-4">لم يتم إضافة عائلات النبلاء أو القبائل.</p>
          ) : (
            (project.families || []).map(fam => (
              <div key={fam.id} className="flex flex-col gap-2 p-3 bg-black/20 border border-[var(--border)] rounded relative group">
                <div className="flex justify-between gap-2">
                  <input 
                    value={fam.name}
                    onChange={e => updateProject({ families: project.families!.map(f => f.id === fam.id ? { ...f, name: e.target.value } : f) })}
                    placeholder="اسم العائلة..."
                    className="flex-1 bg-transparent border-b border-[var(--border)] p-1 text-sm font-bold text-amber-500 outline-none focus:border-amber-500"
                  />
                  <select 
                    value={fam.type}
                    onChange={e => updateProject({ families: project.families!.map(f => f.id === fam.id ? { ...f, type: e.target.value as any } : f) })}
                    className="w-1/3 bg-[var(--bg)] border border-[var(--border)] p-1 rounded text-xs text-[var(--text)] outline-none"
                  >
                    <option value="family">عائلة نبيلة</option>
                    <option value="tribe">قبيلة عشائرية</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <textarea 
                    value={fam.description || ''}
                    placeholder="وصف وتاريخ وسمعة العائلة..."
                    onChange={e => updateProject({ families: project.families!.map(f => f.id === fam.id ? { ...f, description: e.target.value } : f) })}
                    className="w-full bg-[var(--bg)] min-h-[60px] border border-[var(--border)] p-2 rounded text-xs text-[var(--text)] outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[var(--text-dim)]">ملاحظات سرية / علاقات عائلية</label>
                  <textarea 
                    value={fam.members_notes || ''}
                    placeholder="..."
                    onChange={e => updateProject({ families: project.families!.map(f => f.id === fam.id ? { ...f, members_notes: e.target.value } : f) })}
                    className="w-full bg-[var(--bg)] min-h-[40px] border border-[var(--border)] p-2 rounded text-xs text-[var(--text)] outline-none focus:border-amber-500 max-h-[100px]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[var(--text-dim)]">أعضاء العائلة من الشخصيات</label>
                  <div className="flex flex-wrap gap-1">
                     {project.characters?.filter(c => c.familyIds?.includes(fam.id)).map(c => (
                        <div key={c.id} className="bg-black/30 border border-[var(--border)] px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                          {c.avatarUrl && <img src={c.avatarUrl} className="w-3 h-3 rounded-full object-cover" />}
                          {c.name}
                        </div>
                     ))}
                     {(!project.characters || !project.characters.some(c => c.familyIds?.includes(fam.id))) && (
                        <span className="text-[9px] text-zinc-600">لا يوجد أعضاء. أضفهم من صفحة الشخصية.</span>
                     )}
                  </div>
                </div>
                
                <button 
                  onClick={() => updateProject({ families: project.families!.filter(f => f.id !== fam.id) })}
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 bg-[var(--bg)] rounded-full p-1 border border-red-500"
                ><Trash2 size={12} /></button>
              </div>
            ))
          )}
        </div>

        {/* Other Groups / Divisions Section */}
        <div className="flex flex-col gap-3 mt-4 border-t border-[var(--border)] pt-4 pb-12">
          <div className="flex justify-between items-center mb-0">
             <h3 className="text-xs uppercase tracking-wider text-pink-400 font-bold flex items-center gap-2">تقسيمات أخرى</h3>
             <button onClick={() => updateProject({ otherGroups: [...(project.otherGroups || []), { id: generateId(), name: 'مجموعة/تقسيم جديد', description: '' }] })} className="p-1 hover:bg-[rgba(244,114,182,0.1)] text-pink-400 rounded transition-colors"><Plus size={16}/></button>
          </div>
          
          <p className="text-[10px] text-[var(--text-dim)]">استخدم هذا القسم لأي تجمع آخر من الشخصيات (مثل طائفة، فرقة، مدرسة، الخ).</p>

          {(project.otherGroups || []).length === 0 ? (
             <p className="text-xs text-center text-[var(--text-dim)] py-4">لم يتم إضافة تقسيمات أخرى.</p>
          ) : (
             (project.otherGroups || []).map(group => (
               <div key={group.id} className="flex flex-col gap-2 p-3 bg-black/20 border border-[var(--border)] rounded relative group">
                  <input 
                    value={group.name}
                    onChange={e => updateProject({ otherGroups: project.otherGroups!.map(g => g.id === group.id ? { ...g, name: e.target.value } : g) })}
                    placeholder="اسم التقسيم..."
                    className="w-full bg-transparent border-b border-[var(--border)] p-1 text-sm font-bold text-pink-400 outline-none focus:border-pink-400"
                  />
                  <textarea 
                    value={group.description || ''}
                    placeholder="وصف هذا التقسيم..."
                    onChange={e => updateProject({ otherGroups: project.otherGroups!.map(g => g.id === group.id ? { ...g, description: e.target.value } : g) })}
                    className="w-full bg-[var(--bg)] min-h-[60px] border border-[var(--border)] p-2 rounded text-xs text-[var(--text)] outline-none focus:border-pink-400"
                  />
                  
                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[9px] text-[var(--text-dim)]">أعضاء هذا القسم من الشخصيات</label>
                    <div className="flex flex-wrap gap-1">
                       {project.characters?.filter(c => c.otherGroupIds?.includes(group.id)).map(c => (
                          <div key={c.id} className="bg-black/30 border border-[var(--border)] px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                            {c.avatarUrl && <img src={c.avatarUrl} className="w-3 h-3 rounded-full object-cover" />}
                            {c.name}
                          </div>
                       ))}
                       {(!project.characters || !project.characters.some(c => c.otherGroupIds?.includes(group.id))) && (
                          <span className="text-[9px] text-zinc-600">لا يوجد أعضاء. أضفهم من صفحة الشخصية.</span>
                       )}
                    </div>
                  </div>

                  <button 
                    onClick={() => updateProject({ otherGroups: project.otherGroups!.filter(g => g.id !== group.id) })}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 bg-[var(--bg)] rounded-full p-1 border border-red-500"
                  ><Trash2 size={12} /></button>
               </div>
             ))
          )}
        </div>
      </div>
    );
  };

  const renderKanbanTab = () => {
    const cards = project.kanban || [];
    const chapters = project.chapters || [];
    const planningItems = project.planningItems || [];

    const addCard = (status: 'todo' | 'doing' | 'done') => {
      updateProject({ kanban: [...cards, { id: generateId(), title: 'فكرة جديدة', desc: '', status }] });
    };

    const updateCard = (id: string, updates: Partial<KanbanCard>) => {
      updateProject({ kanban: cards.map(c => c.id === id ? { ...c, ...updates } : c) });
    };

    const deleteCard = (id: string) => {
      updateProject({ kanban: cards.filter(c => c.id !== id) });
    };

    const addChapter = () => {
      const newChapter: Chapter = { id: generateId(), title: `الفصل ${chapters.length + 1}` };
      updateProject({ chapters: [...chapters, newChapter] });
    };

    const updateChapter = (id: string, title: string) => {
      updateProject({ chapters: chapters.map(c => c.id === id ? { ...c, title } : c) });
    };

    const deleteChapter = (id: string) => {
      updateProject({ 
        chapters: chapters.filter(c => c.id !== id),
        pages: project.pages.map(p => p.chapterId === id ? { ...p, chapterId: undefined } : p)
      });
    };

    const addPlanningItem = (type: 'artifact' | 'power') => {
      updateProject({ planningItems: [...planningItems, { id: generateId(), name: 'عنصر جديد', description: '', type }] });
    };

    const updatePlanningItem = (id: string, updates: Partial<PlanningItem>) => {
      updateProject({ planningItems: planningItems.map(p => p.id === id ? { ...p, ...updates } : p) });
    };

    const deletePlanningItem = (id: string) => {
      updateProject({ planningItems: planningItems.filter(p => p.id !== id) });
    };

    const columns: { id: 'todo' | 'doing' | 'done', title: string }[] = [
      { id: 'todo', title: 'مخطط' },
      { id: 'doing', title: 'قيد الكتابة' },
      { id: 'done', title: 'مكتمل' }
    ];

    return (
      <div className="flex flex-col h-full gap-6">

        {/* Timeline Section */}
        <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4">
           <div className="flex justify-between items-center mb-1">
             <h3 className="text-xs uppercase tracking-wider text-[var(--accent)] font-bold">تسلسل القصة (Timeline)</h3>
             <button onClick={addChapter} className="p-1 hover:bg-[rgba(168,85,247,0.1)] text-[var(--accent)] rounded transition-colors"><Plus size={16}/></button>
           </div>
           
           <div className="flex gap-2 min-h-[60px] overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--border)]">
              {chapters.length === 0 ? (
                 <div className="w-full flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded text-[var(--text-dim)] text-[10px]">
                   أضف فصولاً لعرض الجدول الزمني
                 </div>
              ) : (
                chapters.map((c, i) => {
                  const chapterPages = project.pages.filter(p => p.chapterId === c.id);
                  return (
                    <div key={c.id} className="flex items-center gap-2 flex-shrink-0">
                       <div className="flex flex-col items-center gap-1 group">
                          <div className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all relative",
                            chapterPages.length > 0 ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-lg" : "border-[var(--border)] text-[var(--text-dim)]"
                          )}>
                             {i + 1}
                             {chapterPages.length > 0 && (
                               <span className="absolute -top-1 -right-1 bg-white text-[var(--accent)] text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-[var(--accent)] shadow-sm">
                                 {chapterPages.length}
                               </span>
                             )}
                          </div>
                          <span className="text-[9px] font-medium truncate max-w-[50px]">{c.title}</span>
                       </div>
                       {i < chapters.length - 1 && <div className="w-4 h-[2px] bg-[var(--border)] rounded flex-shrink-0" />}
                    </div>
                  );
                })
              )}
           </div>

           {chapters.length > 0 && (
             <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto mt-2">
               {chapters.map(c => (
                 <div key={c.id} className="flex gap-2 items-center bg-black/20 p-1 rounded">
                   <input 
                     value={c.title} 
                     onChange={e => updateChapter(c.id, e.target.value)}
                     className="bg-transparent border-0 p-1 rounded text-xs text-[var(--text)] outline-none focus:bg-black/30 flex-1"
                   />
                   <button onClick={() => deleteChapter(c.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Subplots Section */}
        <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4">
           <div className="flex justify-between items-center mb-1">
             <h3 className="text-xs uppercase tracking-wider text-pink-400 font-bold flex items-center gap-2"><BookOpen size={14}/> إدارة الحبكات الفرعية</h3>
             <button onClick={() => updateProject({ subplots: [...(project.subplots || []), { id: generateId(), name: 'مسار جديد', color: '#ec4899' }] })} className="p-1 hover:bg-[rgba(236,72,153,0.1)] text-pink-400 rounded transition-colors"><Plus size={16}/></button>
           </div>
           
           <div className="flex flex-col gap-2">
             {(project.subplots || []).length === 0 ? (
               <p className="text-xs text-[var(--text-dim)]">تتيح لك الحبكات تتبع مسارات محددة (كالبحث عن الكنز، أو الانتقام) ممتدة عبر الفصول.</p>
             ) : (
               (project.subplots || []).map(sp => (
                 <div key={sp.id} className="flex gap-2 items-center bg-black/20 p-1 rounded border border-[var(--border)]">
                   <input 
                     type="color" 
                     value={sp.color} 
                     onChange={e => updateProject({ subplots: project.subplots!.map(s => s.id === sp.id ? { ...s, color: e.target.value } : s) })}
                     className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                   />
                   <input 
                     value={sp.name} 
                     onChange={e => updateProject({ subplots: project.subplots!.map(s => s.id === sp.id ? { ...s, name: e.target.value } : s) })}
                     className="bg-transparent border-0 p-1 rounded text-xs text-[var(--text)] outline-none focus:bg-black/30 flex-1 font-bold"
                   />
                   <button onClick={() => updateProject({ 
                     subplots: project.subplots!.filter(s => s.id !== sp.id),
                     pages: project.pages.map(p => ({ ...p, subplots: p.subplots?.filter(pid => pid !== sp.id) }))
                   })} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                 </div>
               ))
             )}
           </div>
        </div>

        {/* Powers and Artifacts */}
        <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
               <h3 className="text-xs uppercase tracking-wider text-purple-400 font-bold flex items-center gap-2"><Zap size={14}/> قدرات خارقة/قتالية</h3>
               <button onClick={() => addPlanningItem('power')} className="p-1 text-[var(--accent)]"><Plus size={14}/></button>
            </div>
            {planningItems.filter(p => p.type === 'power').map(p => (
              <div key={p.id} className="flex flex-col gap-1 p-2 bg-black/20 rounded border border-[var(--border)] relative group">
                <input value={p.name} onChange={e => updatePlanningItem(p.id, { name: e.target.value })} className="bg-transparent font-bold text-xs outline-none w-[90%]" placeholder="اسم القدرة..." />
                <textarea value={p.description} onChange={e => updatePlanningItem(p.id, { description: e.target.value })} className="bg-transparent text-[10px] text-[var(--text-dim)] outline-none w-[90%] resize-y" placeholder="شرح القدرة..." />
                <button onClick={() => deletePlanningItem(p.id)} className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={12}/></button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
               <h3 className="text-xs uppercase tracking-wider text-orange-400 font-bold flex items-center gap-2"><Briefcase size={14}/> أدوات مهمة مذكرورة/سيتم ذكرها</h3>
               <button onClick={() => addPlanningItem('artifact')} className="p-1 text-[var(--accent)]"><Plus size={14}/></button>
            </div>
            {planningItems.filter(p => p.type === 'artifact').map(p => (
              <div key={p.id} className="flex flex-col gap-1 p-2 bg-black/20 rounded border border-[var(--border)] relative group">
                <input value={p.name} onChange={e => updatePlanningItem(p.id, { name: e.target.value })} className="bg-transparent font-bold text-xs outline-none w-[90%]" placeholder="اسم الأداة..." />
                <textarea value={p.description} onChange={e => updatePlanningItem(p.id, { description: e.target.value })} className="bg-transparent text-[10px] text-[var(--text-dim)] outline-none w-[90%] resize-y" placeholder="تفاصيل الأداة، ولمن تعود..." />
                <button onClick={() => deletePlanningItem(p.id)} className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={12}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-dim)] font-bold flex items-center gap-2">
             <KanbanSquare size={16} /> لوحة المهام
          </h3>
          <div className="flex flex-col gap-6 overflow-y-auto pr-1">
            {columns.map(col => (
              <div key={col.id} className="flex flex-col gap-2 p-3 bg-black/20 rounded border border-[var(--border)]">
                 <div className="flex justify-between items-center mb-2 text-sm font-bold">
                   <span>{col.title} ({cards.filter(c => c.status === col.id).length})</span>
                   <button onClick={() => addCard(col.id)} className="text-[var(--accent)] hover:text-purple-400"><Plus size={16}/></button>
                 </div>
                 {cards.filter(c => c.status === col.id).map(card => (
                   <div key={card.id} className="bg-[var(--bg)] p-3 rounded border border-[var(--border)] flex flex-col gap-2 transition-all hover:border-gray-500">
                      <input 
                        className="bg-transparent font-bold text-sm outline-none w-full"
                        value={card.title}
                        onChange={e => updateCard(card.id, { title: e.target.value })}
                      />
                      <textarea 
                        className="bg-transparent text-xs outline-none w-full resize-none text-[var(--text-dim)] min-h-[40px]"
                        value={card.desc}
                        placeholder="التفاصيل..."
                        onChange={e => updateCard(card.id, { desc: e.target.value })}
                      />
                      <div className="flex justify-between items-center mt-1 border-t border-[var(--border)] pt-2">
                         <select 
                           className="bg-transparent text-xs text-[var(--text)] outline-none"
                           value={card.status}
                           onChange={e => updateCard(card.id, { status: e.target.value as any })}
                         >
                           {columns.map(c => <option key={c.id} value={c.id} className="bg-[var(--bg)]">{c.title}</option>)}
                         </select>
                         <button onClick={() => deleteCard(card.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14}/></button>
                      </div>
                   </div>
                 ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDictionaryTab = () => {
    const dictionary = project.dictionary || [];
    return (
      <div className="flex flex-col h-full gap-4 pb-20">
        <div className="flex justify-between items-center mb-0">
           <h3 className="text-xs uppercase tracking-wider text-[var(--accent)] font-bold flex items-center gap-2"><BookA size={14}/> قاموس اللغة المبتكرة</h3>
           <button onClick={() => updateProject({ dictionary: [...dictionary, { id: generateId(), word: '', meaning: '', notes: '' }] })} className="p-1 hover:bg-[rgba(168,85,247,0.1)] text-[var(--accent)] rounded transition-colors"><Plus size={16}/></button>
        </div>
        <p className="text-[10px] text-[var(--text-dim)]">أضف كلمات من لغاتك الخيالية ليتمكن الذكاء الاصطناعي من فهمها وربطها.</p>

        <div className="flex flex-col gap-3 mt-2">
          {dictionary.length === 0 ? (
            <p className="text-xs text-center text-[var(--text-dim)] py-4 border border-dashed border-[var(--border)] rounded">لا توجد كلمات حالياً.</p>
          ) : (
            dictionary.map(item => (
              <div key={item.id} className="flex flex-col gap-2 p-3 bg-black/20 border border-[var(--border)] rounded relative group">
                <div className="flex gap-2">
                   <div className="flex flex-col gap-1 flex-1">
                     <label className="text-[9px] text-[var(--text-dim)]">الكلمة المبتكرة</label>
                     <input 
                       value={item.word}
                       onChange={e => updateProject({ dictionary: dictionary.map(d => d.id === item.id ? { ...d, word: e.target.value } : d) })}
                       className="bg-transparent border-b border-[var(--border)] p-1 text-sm font-bold text-[var(--accent)] outline-none focus:border-purple-500"
                       placeholder="مثال: Dracarys"
                     />
                   </div>
                   <div className="flex flex-col gap-1 flex-1">
                     <label className="text-[9px] text-[var(--text-dim)]">المعنى / الترجمة</label>
                     <input 
                       value={item.meaning}
                       onChange={e => updateProject({ dictionary: dictionary.map(d => d.id === item.id ? { ...d, meaning: e.target.value } : d) })}
                       className="bg-transparent border-b border-[var(--border)] p-1 text-sm font-medium text-[var(--text)] outline-none focus:border-purple-500"
                       placeholder="مثال: نار تنين"
                     />
                   </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[var(--text-dim)]">ملاحظات حول النطق أو الاستخدام (اختياري)</label>
                  <textarea 
                    value={item.notes || ''}
                    onChange={e => updateProject({ dictionary: dictionary.map(d => d.id === item.id ? { ...d, notes: e.target.value } : d) })}
                    className="bg-[var(--bg)] border border-[var(--border)] p-1 text-xs text-[var(--text)] outline-none focus:border-purple-500 rounded min-h-[40px] resize-y"
                    placeholder="..."
                  />
                </div>
                <button 
                  onClick={() => updateProject({ dictionary: dictionary.filter(d => d.id !== item.id) })}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 bg-[var(--bg)] rounded-full p-1"
                ><Trash2 size={12} /></button>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 mt-2 border-t border-[var(--border)] pt-4 pb-12">
          <div className="flex justify-between items-center mb-0">
             <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">أديان ومعتقدات العالم</h3>
             <button onClick={() => updateProject({ religions: [...(project.religions || []), { id: generateId(), name: '', description: '' }] })} className="p-1 hover:bg-[rgba(16،85,247,0.1)] text-[var(--accent)] rounded transition-colors"><Plus size={16}/></button>
          </div>
          <p className="text-[10px] text-[var(--text-dim)]">أضف الأديان والاعتقادات هنا لتتمكن من ربطها بالشخصيات.</p>
          {(project.religions || []).length === 0 ? (
             <p className="text-xs text-center text-[var(--text-dim)] py-4 border border-dashed border-[var(--border)] rounded">لا توجد أديان مسجلة حالياً.</p>
          ) : (
             (project.religions || []).map(rel => (
               <div key={rel.id} className="flex flex-col gap-2 p-3 bg-black/20 border border-[var(--border)] rounded relative group">
                 <div className="flex flex-col gap-1">
                   <label className="text-[9px] text-[var(--text-dim)]">اسم الدين / الاعتقاد</label>
                   <input 
                     value={rel.name}
                     onChange={e => updateProject({ religions: project.religions!.map(r => r.id === rel.id ? { ...r, name: e.target.value } : r) })}
                     className="bg-transparent border-b border-[var(--border)] p-1 text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500"
                     placeholder="مثال: عقيدة النور"
                   />
                 </div>
                 <div className="flex flex-col gap-1">
                   <label className="text-[9px] text-[var(--text-dim)]">وصف الاعتقاد والمبادئ</label>
                   <textarea 
                     value={rel.description}
                     onChange={e => updateProject({ religions: project.religions!.map(r => r.id === rel.id ? { ...r, description: e.target.value } : r) })}
                     className="w-full min-h-[60px] bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-emerald-500 max-h-[120px]"
                   />
                 </div>
                 <button 
                   onClick={() => updateProject({ religions: project.religions!.filter(r => r.id !== rel.id) })}
                   className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 bg-[var(--bg)] rounded-full p-1"
                 ><Trash2 size={12} /></button>
               </div>
             ))
          )}
        </div>

        <div className="flex flex-col gap-3 mt-2 border-t border-[var(--border)] pt-4 pb-12">
          <div className="flex justify-between items-center mb-0">
             <h3 className="text-xs uppercase tracking-wider text-rose-400 font-bold flex items-center gap-2">اقتباسات/إلهامات مستقبلية</h3>
             <button onClick={() => updateProject({ futureQuotes: [...(project.futureQuotes || []), { id: generateId(), content: '', link: '' }] })} className="p-1 hover:bg-[rgba(244,63,94,0.1)] text-[var(--accent)] rounded transition-colors"><Plus size={16}/></button>
          </div>
          <p className="text-[10px] text-[var(--text-dim)]">تحفظ هنا أي روابط أو اقتباسات (من يوتيوب، ويكيبيديا وغيرها) لتلهمك بها لاحقاً.</p>
          {(project.futureQuotes || []).length === 0 ? (
             <p className="text-xs text-center text-[var(--text-dim)] py-4 border border-dashed border-[var(--border)] rounded">لا توجد اقتباسات حالياً.</p>
          ) : (
             (project.futureQuotes || []).map(quote => (
               <div key={quote.id} className="flex flex-col gap-2 p-3 bg-black/20 border border-[var(--border)] rounded relative group">
                 <div className="flex flex-col gap-1">
                   <label className="text-[9px] text-[var(--text-dim)]">محتوى الاقتباس / الفكرة المستلهمة</label>
                   <textarea 
                     value={quote.content}
                     onChange={e => updateProject({ futureQuotes: project.futureQuotes!.map(q => q.id === quote.id ? { ...q, content: e.target.value } : q) })}
                     className="w-full min-h-[60px] bg-[var(--bg)] border border-[var(--border)] p-2 rounded text-sm text-[var(--text)] outline-none focus:border-rose-400"
                     placeholder="فكرة أعجبتني أريد تطبيقها..."
                   />
                 </div>
                 <div className="flex flex-col gap-1">
                   <label className="text-[9px] text-[var(--text-dim)]">رابط المرجع (يوتيوب، مقالة...)</label>
                   <input 
                     type="url"
                     value={quote.link || ''}
                     onChange={e => updateProject({ futureQuotes: project.futureQuotes!.map(q => q.id === quote.id ? { ...q, link: e.target.value } : q) })}
                     className="bg-[var(--bg)] border border-[var(--border)] p-1.5 rounded text-xs text-rose-400 outline-none focus:border-rose-400"
                     placeholder="https://youtube.com/..."
                   />
                 </div>
                 <button 
                   onClick={() => updateProject({ futureQuotes: project.futureQuotes!.filter(q => q.id !== quote.id) })}
                   className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 bg-[var(--bg)] rounded-full p-1"
                 ><Trash2 size={12} /></button>
               </div>
             ))
          )}
        </div>

      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[var(--panel)]">
      <div className="flex w-full border-b border-[var(--border)] p-1.5 gap-0.5 overflow-x-hidden justify-center items-center shrink-0">
         {!hideSettings && <button onClick={() => setActiveTab('props')} title="خصائص" className={`p-1.5 rounded flex items-center justify-center transition-colors ${activeTab==='props' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-dim)] hover:bg-[var(--bg)]'}`}><Settings size={18}/></button>}
         <button onClick={() => { if(hideSettings && activeTab==='props') setActiveTab('chars'); setActiveTab('chars') }} title="شخصيات" className={`p-1.5 rounded flex items-center justify-center transition-colors ${activeTab==='chars' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-dim)] hover:bg-[var(--bg)]'}`}><Users size={18}/></button>
         <button onClick={() => setActiveTab('scenario')} title="سيناريو" className={`p-1.5 rounded flex items-center justify-center transition-colors ${activeTab==='scenario' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-dim)] hover:bg-[var(--bg)]'}`}><FileText size={18}/></button>
         <button onClick={() => setActiveTab('world')} title="العالم" className={`p-1.5 rounded flex items-center justify-center transition-colors ${activeTab==='world' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-dim)] hover:bg-[var(--bg)]'}`}><BookOpen size={18}/></button>
         <button onClick={() => setActiveTab('kanban')} title="تخطيط" className={`p-1.5 rounded flex items-center justify-center transition-colors ${activeTab==='kanban' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-dim)] hover:bg-[var(--bg)]'}`}><KanbanSquare size={18}/></button>
         <button onClick={() => setActiveTab('factions')} title="النقابات/الممالك" className={`p-1.5 rounded flex items-center justify-center transition-colors ${activeTab==='factions' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-dim)] hover:bg-[var(--bg)]'}`}><Shield size={18}/></button>
         <button onClick={() => setActiveTab('dict')} title="القاموس" className={`p-1.5 rounded flex items-center justify-center transition-colors ${activeTab==='dict' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-dim)] hover:bg-[var(--bg)]'}`}><BookA size={18}/></button>
         
         <div className="w-[1px] h-5 bg-[var(--border)] mx-0.5" />
         
         {onToggleExpand && (
           <button 
             onClick={onToggleExpand} 
             title={isExpanded ? "تصغير" : "تكبير الشاشة"} 
             className="p-1.5 rounded flex items-center transition-colors text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
           >
             {isExpanded ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
           </button>
         )}
      </div>
      
      <div className="flex-1 p-5 overflow-y-auto w-full max-h-full">
        {activeTab === 'scenario' && renderScenarioTab()}
        {activeTab === 'chars' && renderCharactersTab()}
        {activeTab === 'world' && renderWorldTab()}
        {activeTab === 'kanban' && renderKanbanTab()}
        {activeTab === 'factions' && renderFactionsTab()}
        {activeTab === 'dict' && renderDictionaryTab()}
        {activeTab === 'props' && (
          !block ? renderPageProps() : (
            <div className="flex flex-col gap-6 pb-20">
               <div className="inline-block bg-[rgba(168,85,247,0.1)] border border-[var(--accent)] text-[var(--accent)] px-3 py-1 rounded-full text-xs self-start font-bold">
                 {block.type === 'text' ? 'نص سردي' : block.type === 'image' ? 'صورة' : 'حوار'} نشط
               </div>
               <div className="flex flex-col gap-4">
                 <h3 className="text-xs uppercase tracking-wider text-[var(--text-dim)] font-bold">تنسيق العنصر</h3>
                 {block.type === 'text' && renderTextProps(block as TextBlock)}
                 {block.type === 'image' && renderImageProps(block as ImageBlock)}
                 {block.type === 'dialogue' && renderDialogueProps(block as DialogueBlock)}
                 {block.type === 'callout' && renderCalloutProps(block)}
                 {block.type === 'table' && renderTableProps(block)}
                 {block.type === 'divider' && renderDividerProps(block)}
               </div>
            </div>
          )
        )}
      </div>

      {optionsModal && optionsModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex justify-center items-center no-print" dir="rtl">
           <div className="bg-[var(--panel)] border border-[var(--border)] w-[450px] max-w-[90vw] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 p-6 gap-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-2"><Sparkles className="text-yellow-500"/> خيارات الأحداث القادمة</h3>
               <p className="text-[var(--text-dim)] text-sm">اختر المسار الذي ترغب في إضافته للقصة من الخيارات المقترحة من قبل الذكاء الاصطناعي (Gemini):</p>
               <div className="flex flex-col gap-3 mt-2">
                 {optionsModal.options.map((opt, i) => (
                   <button 
                     key={i} 
                     onClick={() => optionsModal.onSelect(i)} 
                     className="w-full text-right p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[rgba(168,85,247,0.1)] transition-colors text-sm leading-relaxed"
                   >
                     <span className="font-bold text-[var(--accent)] mb-1 block">خيار {i + 1}</span>
                     {opt}
                   </button>
                 ))}
               </div>
               <button onClick={() => setOptionsModal(null)} className="mt-2 text-[var(--text-dim)] hover:text-white transition-colors py-2 text-sm">
                 إلغاء
               </button>
           </div>
        </div>
      )}
    </div>
  );
}
