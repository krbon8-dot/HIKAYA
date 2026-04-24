import React, { useRef, useEffect, useState } from 'react';
import { TextBlock, ProjectData } from '../../types';
import { cn } from '../../lib/utils';
import { Bold, Italic, Underline, Baseline, Check, RotateCcw, Plus, Sparkles } from 'lucide-react';
import { dictionaryService } from '../../services/dictionaryService';
import { generateSuggestion } from '../../lib/aiService';

interface Props {
  block: TextBlock;
  project?: ProjectData;
  onChange: (updates: Partial<TextBlock>) => void;
  onClick?: () => void;
}

export default function TextEditor({ block, project, onChange, onClick }: Props) {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Spellcheck state
  const [scMenu, setScMenu] = useState<{
    visible: boolean;
    word: string;
    suggestions: string[];
    top: number;
    left: number;
  }>({ visible: false, word: '', suggestions: [], top: 0, left: 0 });

  // Autocomplete state
  const [acState, setAcState] = useState<{
    visible: boolean;
    options: string[];
    index: number;
    top: number;
    left: number;
    keyword: string; // The match like 'مملكة', 'نقابة'
    textQuery: string; // The partial text typed after the keyword
  }>({ visible: false, options: [], index: 0, top: 0, left: 0, keyword: '', textQuery: '' });

  // Sync initial content only once to avoid cursor jumping
  useEffect(() => {
    if (contentEditableRef.current && contentEditableRef.current.innerHTML !== block.content) {
      if (document.activeElement !== contentEditableRef.current) {
         contentEditableRef.current.innerHTML = block.content || '';
      }
    }
  }, [block.content]);

  const [isAiProofreading, setIsAiProofreading] = useState(false);

  const handleAiProofread = async () => {
    if (!contentEditableRef.current) return;
    const text = contentEditableRef.current.innerText;
    if (!text.trim()) return;

    setIsAiProofreading(true);
    try {
      const fixed = await generateSuggestion(text, 'proofread', project);
      if (fixed) {
        // Convert plain text back to paragraphs/newlines if needed, or simply update content
        const html = fixed.replace(/\n/g, '<br/>');
        contentEditableRef.current.innerHTML = html;
        onChange({ content: html });
      }
    } catch (err) {
      console.error("AI Proofread failed", err);
    } finally {
      setIsAiProofreading(false);
    }
  };

  const handleInput = () => {
    if (contentEditableRef.current) {
      onChange({ content: contentEditableRef.current.innerHTML });
      checkAutocomplete();
    }
  };

  const runSpellCheck = (html: string) => {
    if (!html) return html;
    
    // 1. Remove existing spell-error spans to get clean text first
    const cleanHtml = html.replace(/<span class="spell-error" data-word=".*?">(.*?)<\/span>/g, '$1');
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanHtml, 'text/html');
    
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        // Split by words but keep separators. Arabic words use space and common punctuation.
        // Regex \s+ for whitespace, then various punctuation marks.
        const words = text.split(/(\s+|[،.,!?;:()]+)/);
        
        let hasChange = false;
        const wrapper = document.createElement('span');
        
        words.forEach(w => {
          const clean = w.trim().replace(/[،.,!?;:()]/g, '');
          if (clean && clean.length > 1 && !dictionaryService.isWordCorrect(clean)) {
            const span = document.createElement('span');
            span.className = 'spell-error';
            span.dataset.word = clean;
            span.textContent = w;
            wrapper.appendChild(span);
            hasChange = true;
          } else {
            wrapper.appendChild(document.createTextNode(w));
          }
        });
        
        if (hasChange) {
           node.parentElement?.replaceChild(wrapper, node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (!el.classList.contains('entity-link')) {
          Array.from(node.childNodes).forEach(processNode);
        }
      }
    };
    
    Array.from(doc.body.childNodes).forEach(processNode);
    return doc.body.innerHTML;
  };

  const handleBlur = () => {
    if (contentEditableRef.current) {
      let html = contentEditableRef.current.innerHTML;

      // 1. Lore links
      if (project && html) {
         const entities = [
           ...(project.characters || []).map(c => ({ name: c.name, type: 'char' })),
           ...(project.lore || []).map(l => ({ name: l.title, type: 'lore' })),
           ...(project.factions || []).map(f => ({ name: f.name, type: 'faction' })),
           ...(project.worldMap || []).map(m => ({ name: m.name, type: 'map' })),
         ].filter(e => e.name && e.name.trim().length > 2);
         
         entities.sort((a,b) => b.name.length - a.name.length);

         let modifiedHtml = html;
         entities.forEach(ent => {
             const safeName = ent.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
             const regex = new RegExp(`(${safeName})(?![^<]*>)(?!(?:[^<]*<\\/span>))`, 'g');
             modifiedHtml = modifiedHtml.replace(regex, `<span class="text-blue-500 font-bold hover:underline cursor-help entity-link" data-name="$1" title="انقر لتفاصيل الموسوعة">$1</span>`);
         });
         html = modifiedHtml;
      }

      if (contentEditableRef.current.innerHTML !== html) {
          contentEditableRef.current.innerHTML = html;
      }
      
      onChange({ content: html });
    }
    setTimeout(() => setAcState(s => ({ ...s, visible: false })), 200);
  };

  const applyCorrection = (suggestion: string) => {
    if (!contentEditableRef.current) return;
    const html = contentEditableRef.current.innerHTML;
    // Simple replacement of the span with the correct text
    const regex = new RegExp(`<span class="spell-error" data-word="${scMenu.word}">.*?<\\/span>`, 'g');
    const newHtml = html.replace(regex, suggestion);
    contentEditableRef.current.innerHTML = newHtml;
    onChange({ content: newHtml });
    setScMenu(s => ({ ...s, visible: false }));
  };

  const ignoreWord = (word: string) => {
    dictionaryService.ignoreWord(word);
    if (!contentEditableRef.current) return;
    const html = contentEditableRef.current.innerHTML;
    const regex = new RegExp(`<span class="spell-error" data-word="${word}">(.*?)<\\/span>`, 'g');
    const newHtml = html.replace(regex, '$1');
    contentEditableRef.current.innerHTML = newHtml;
    onChange({ content: newHtml });
    setScMenu(s => ({ ...s, visible: false }));
  };

  const addWord = (word: string) => {
    dictionaryService.addToDictionary(word);
    ignoreWord(word);
  };

  const handleSpanClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // 1. Check for spell-error
    if (target.classList.contains('spell-error')) {
      const word = target.getAttribute('data-word') || '';
      const rect = target.getBoundingClientRect();
      const editorRect = contentEditableRef.current?.getBoundingClientRect();
      
      if (editorRect) {
         setScMenu({
           visible: true,
           word,
           suggestions: dictionaryService.getSuggestions(word),
           top: rect.bottom - editorRect.top + 5,
           left: rect.left - editorRect.left,
         });
         return;
      }
    } else {
      setScMenu(s => ({ ...s, visible: false }));
    }

    // 2. Check for entity-link
    if (target.classList.contains('entity-link')) {
      const name = target.getAttribute('data-name');
      if (name) {
        window.dispatchEvent(new CustomEvent('open-entity', { detail: { name } }));
      }
    }
    if (onClick) onClick();
  };

  const checkAutocomplete = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !project) {
       setAcState(s => ({ ...s, visible: false }));
       return;
    }

    const range = sel.getRangeAt(0);
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) {
       setAcState(s => ({ ...s, visible: false }));
       return;
    }

    const textBeforeCursor = textNode.textContent?.substring(0, range.startOffset) || '';
    
    // Look for trigger words at the end of the current text before cursor
    // e.g., "مملكة ", "نقابة ", "فريق ", "الملك "
    const triggers = ['مملكة ', 'المملكة ', 'نقابة ', 'النقابة ', 'فريق ', 'الفريق ', 'الملك ', 'شخصية '];
    
    let matchedTrigger = '';
    let query = '';

    for (const t of triggers) {
       const idx = textBeforeCursor.lastIndexOf(t);
       if (idx !== -1 && idx === textBeforeCursor.length - t.length) {
          // Exact match at the end
          matchedTrigger = t;
          query = '';
          break;
       } else if (idx !== -1 && idx > textBeforeCursor.length - t.length - 15) { // Searching within 15 chars after trigger
          const potentialQuery = textBeforeCursor.substring(idx + t.length);
          if (!potentialQuery.includes(' ')) {
             matchedTrigger = t;
             query = potentialQuery;
             break;
          }
       }
    }

    if (matchedTrigger) {
      let options: string[] = [];
      const lowerQuery = query.toLowerCase();

      if (matchedTrigger.includes('مملكة') || matchedTrigger.includes('المملكة') || matchedTrigger.includes('نقابة') || matchedTrigger.includes('النقابة') || matchedTrigger.includes('فريق') || matchedTrigger.includes('الفريق')) {
        options = (project.factions || []).map(f => f.name);
      } else if (matchedTrigger.includes('الملك') || matchedTrigger.includes('شخصية')) {
        options = (project.characters || []).map(c => c.name);
      }

      options = options.filter(o => o.toLowerCase().includes(lowerQuery));

      if (options.length > 0) {
        // Calculate coords relative to the text editor
        const rect = range.getBoundingClientRect();
        const editorRect = contentEditableRef.current?.getBoundingClientRect();
        
        if (editorRect) {
           setAcState({
             visible: true,
             options: options.slice(0, 5), // top 5
             index: 0,
             top: rect.bottom - editorRect.top + 5,
             left: rect.left - editorRect.left,
             keyword: matchedTrigger,
             textQuery: query
           });
           return;
        }
      }
    }

    setAcState(s => ({ ...s, visible: false }));
  };

  const insertAutocomplete = (text: string) => {
    const sel = window.getSelection();
    if (!sel || !contentEditableRef.current) return;
    
    const range = sel.getRangeAt(0);
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return;

    const content = textNode.textContent || '';
    const triggerIdx = content.lastIndexOf(acState.keyword);
    
    if (triggerIdx !== -1) {
       // Replace the textQuery with the full selected text, bolded for emphasis
       const before = content.substring(0, triggerIdx + acState.keyword.length);
       const after = content.substring(triggerIdx + acState.keyword.length + acState.textQuery.length);
       
       // Just put the string value first
       textNode.textContent = before + text + after;
       
       // Move cursor to end of inserted text
       const newRange = document.createRange();
       newRange.setStart(textNode, before.length + text.length);
       newRange.setEnd(textNode, before.length + text.length);
       sel.removeAllRanges();
       sel.addRange(newRange);
    }
    
    handleInput();
    setAcState(s => ({ ...s, visible: false }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (acState.visible) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAcState(s => ({ ...s, index: (s.index + 1) % s.options.length }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAcState(s => ({ ...s, index: (s.index - 1 + s.options.length) % s.options.length }));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertAutocomplete(acState.options[acState.index]);
      } else if (e.key === 'Escape') {
        setAcState(s => ({ ...s, visible: false }));
      }
    }
  };

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
    if (command === 'foreColor') setShowColorPicker(false);
  };

  const colors = ['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

  return (
    <div className="relative group/textblock w-full" onClick={onClick}>
      {/* Mini formatting toolbar appears on hover of block */}
      <div className="absolute -top-12 left-2 bg-[var(--panel)] border border-[var(--border)] rounded shadow-xl p-1.5 gap-1.5 flex opacity-0 group-hover/textblock:opacity-100 transition-all z-[60] pointer-events-none group-hover/textblock:pointer-events-auto items-center before:content-[''] before:absolute before:top-full before:left-0 before:right-0 before:h-4">
        <button 
          onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} 
          className="p-1.5 hover:bg-[#2a2a2a] rounded text-[var(--text)] transition-colors"
          title="عريض (Bold)"
        >
          <Bold size={16}/>
        </button>
        <button 
          onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} 
          className="p-1.5 hover:bg-[#2a2a2a] rounded text-[var(--text)] transition-colors" 
          title="مائل (Italic)"
        >
          <Italic size={16}/>
        </button>
        <button 
          onMouseDown={(e) => { e.preventDefault(); handleFormat('underline'); }} 
          className="p-1.5 hover:bg-[#2a2a2a] rounded text-[var(--text)] transition-colors"
          title="تحته خط (Underline)"
        >
          <Underline size={16}/>
        </button>
        
        <div className="relative">
           <button 
             onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(!showColorPicker); }} 
             className="p-1.5 hover:bg-[#2a2a2a] rounded text-[var(--text)] transition-colors"
             title="لون النص"
           >
             <Baseline size={16}/>
           </button>
           {showColorPicker && (
             <div className="absolute top-full mt-1 -left-2 bg-[var(--panel)] border border-[var(--border)] p-2 rounded shadow-xl grid grid-cols-4 gap-1 z-50 origin-top-left animate-in fade-in zoom-in-95">
               {colors.map(c => (
                 <button 
                   key={c}
                   onMouseDown={(e) => { e.preventDefault(); handleFormat('foreColor', c); }}
                   className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform"
                   style={{ backgroundColor: c }}
                   title={c}
                 />
               ))}
             </div>
           )}
        </div>

        <div className="w-px h-4 bg-[var(--border)] mx-1" />

        <button 
          onMouseDown={(e) => { e.preventDefault(); handleAiProofread(); }} 
          disabled={isAiProofreading}
          className={cn(
            "p-1.5 hover:bg-[#2a2a2a] rounded text-[var(--text)] transition-colors flex items-center gap-1.5",
            isAiProofreading && "animate-pulse text-emerald-400"
          )}
          title="تدقيق ذكي بالذكاء الاصطناعي (مثل قوقل/وورد)"
        >
          <Sparkles size={16} className={isAiProofreading ? "animate-spin" : "text-emerald-500"} />
          <span className="text-[10px] font-bold">{isAiProofreading ? "جاري..." : "تدقيق ذكي"}</span>
        </button>
      </div>

      {/* Editor Area */}
      <div className="relative w-full" onClick={handleSpanClick}>
          <div
            ref={contentEditableRef}
            contentEditable
            spellCheck="true"
            onInput={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            suppressContentEditableWarning
            data-placeholder="اكتب هنا وقم بتظليل النص للتنسيق..."
            className={cn(
              "w-full bg-transparent outline-none border-2 border-transparent hover:border-slate-300 focus:border-[var(--accent)] rounded p-4 transition-colors min-h-[80px] overflow-hidden relative z-10",
              "empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:opacity-50",
              block.align === 'center' && "text-center",
              block.align === 'left' && "text-left dir-ltr",
              block.align === 'right' && "text-right",
              block.style === 'h1' && "text-4xl font-bold font-sans",
              block.style === 'h2' && "text-2xl font-semibold font-sans",
              block.style === 'quote' && "border-r-4 border-r-purple-500 pr-4 text-slate-700 bg-purple-50",
              block.style === 'normal' && "text-lg leading-relaxed font-medium"
            )}
            style={{ 
              direction: block.align === 'left' ? 'ltr' : 'rtl',
              color: block.color || 'var(--text)',
              fontFamily: block.fontFamily ? `var(--font-${block.fontFamily})` : undefined,
              fontSize: block.fontSize ? `${block.fontSize}px` : undefined,
              lineHeight: block.fontSize ? '1.5' : undefined
            }}
          />

          {/* Autocomplete Dropdown */}
          {acState.visible && (
             <div 
               className="absolute z-50 bg-[var(--bg)] border border-[var(--border)] shadow-2xl rounded overflow-hidden flex flex-col w-48 text-sm animate-in fade-in zoom-in-95"
               style={{ top: `${acState.top}px`, left: `${acState.left}px` }}
             >
                <div className="bg-black/10 px-2 py-1 text-[10px] text-[var(--text-dim)] font-bold tracking-wider">
                  إكمال تلقائي لـ "{acState.keyword.trim()}"
                </div>
                {acState.options.map((opt, i) => (
                   <button
                     key={opt}
                     onMouseDown={(e) => { e.preventDefault(); insertAutocomplete(opt); }}
                     className={cn(
                       "px-3 py-2 text-right transition-colors hover:bg-[var(--accent)] hover:text-white",
                       i === acState.index ? "bg-[rgba(168,85,247,0.2)] text-[var(--accent)]" : "text-[var(--text)]"
                     )}
                   >
                     {opt}
                   </button>
                ))}
             </div>
          )}

          {/* Spellcheck Menu */}
          {scMenu.visible && (
             <div 
               className="absolute z-[70] bg-[var(--panel)] border border-[var(--border)] shadow-2xl rounded-lg overflow-hidden flex flex-col w-52 text-sm animate-in fade-in zoom-in-95"
               style={{ top: `${scMenu.top}px`, left: `${scMenu.left}px` }}
             >
                <div className="bg-red-500/10 px-3 py-2 text-xs text-red-500 font-bold border-b border-[var(--border)] flex items-center justify-between">
                  <span>تدقيق: {scMenu.word}</span>
                  <button onMouseDown={(e) => { e.preventDefault(); setScMenu(s => ({ ...s, visible: false })); }} className="text-[var(--text-dim)]">✕</button>
                </div>
                
                {scMenu.suggestions.length > 0 ? (
                   <div className="flex flex-col border-b border-[var(--border)]">
                      {scMenu.suggestions.map(s => (
                         <button
                           key={s}
                           onMouseDown={(e) => { e.preventDefault(); applyCorrection(s); }}
                           className="px-3 py-2 text-right hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
                         >
                            <Check size={14} className="text-emerald-500" />
                            <span>{s}</span>
                         </button>
                      ))}
                   </div>
                ) : (
                   <div className="px-3 py-3 text-center text-[var(--text-dim)] italic border-b border-[var(--border)] text-xs">
                      لا توجد اقتراحات قريبة
                   </div>
                )}
                
                <div className="flex flex-col bg-slate-50 dark:bg-black/20">
                   <button 
                     onMouseDown={(e) => { e.preventDefault(); ignoreWord(scMenu.word); }}
                     className="px-3 py-2 text-right hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between text-xs"
                   >
                      <RotateCcw size={12} className="text-slate-400" />
                      <span>تجاهل الكل</span>
                   </button>
                   <button 
                     onMouseDown={(e) => { e.preventDefault(); addWord(scMenu.word); }}
                     className="px-3 py-2 text-right hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between text-xs"
                   >
                      <Plus size={12} className="text-emerald-500" />
                      <span>إضافة للقاموس</span>
                   </button>
                </div>
             </div>
          )}
      </div>
    </div>
  );
}
