import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Type, ImageIcon, MessageSquare, GripVertical, Trash2, Save, Printer, Plus, ChevronLeft, ChevronRight, FilePlus, FolderClock, X, Loader2, Focus, Grid, Cloud, LogOut, User as UserIcon, Sparkles, Send, Square, LayoutTemplate, Minus, HelpCircle, Music, Search, Download, Columns, Smartphone, Target, Clock, Network } from 'lucide-react';
import { StoryBlock, ProjectData, ProjectPage, Character } from '../types';
import { generateId, cn } from '../lib/utils';
import TextEditor from './blocks/TextEditor';
import ImageEditor from './blocks/ImageEditor';
import DialogueEditor from './blocks/DialogueEditor';
import TableEditor from './blocks/TableEditor';
import DividerEditor from './blocks/DividerEditor';
import CalloutEditor from './blocks/CalloutEditor';
import ChatEditor from './blocks/ChatEditor';
import QuestEditor from './blocks/QuestEditor';
import DocumentEditor from './blocks/DocumentEditor';
import GraphicEditor from './blocks/GraphicEditor';
import PropertiesPanel from './PropertiesPanel';
import AISettingsModal from './AISettingsModal';
import { MusicPlayer } from './MusicPlayer';
import { GoalTracker } from './GoalTracker';
import { ExportModal } from './ExportModal';
import { FindReplaceModal } from './FindReplaceModal';
import { AccessibilityModal } from './AccessibilityModal';
import { RelationshipModal } from './RelationshipModal';
import { TimelineModal } from './TimelineModal';
import { Monitor } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'hikaya-projects-v3';

const createEmptyPage = (name: string): ProjectPage => ({
  id: generateId(),
  name,
  blocks: []
});

const createNewProject = (): ProjectData => ({
  id: generateId(),
  name: 'رواية جديدة',
  backgroundColor: '#ffffff',
  pageWidth: 624,
  pagePadding: 0,
  blockGap: 0,
  pages: [
    { id: generateId(), name: 'الغلاف', blocks: [], isCover: true },
    createEmptyPage('صفحة 1')
  ],
  characters: [],
  scenario: ''
});

export default function StoryEditor() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const cached = await localforage.getItem<ProjectData[]>(LOCAL_STORAGE_KEY);
        if (cached && cached.length > 0) {
          setProjects(cached);
          setCurrentProjectId(cached[0].id);
        } else {
          const newProj = createNewProject();
          setProjects([newProj]);
          setCurrentProjectId(newProj.id);
          await localforage.setItem(LOCAL_STORAGE_KEY, [newProj]);
        }
      } catch (e) {
        console.error("Load failed:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, []);

  const project = projects.find(p => p.id === currentProjectId) || projects[0];

  const [activePageId, setActivePageId] = useState<string>('');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  const [printType, setPrintType] = useState<'none' | 'current' | 'all'>('none');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFindReplaceModal, setShowFindReplaceModal] = useState(false);
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{msg: string, action: () => void} | null>(null);

  // New UX Modes
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  // External Views
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  
  // Undo/Redo tracking
  const [history, setHistory] = useState<ProjectData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoing, setIsUndoRedoing] = useState(false);

  // Accessibility
  const [showA11yModal, setShowA11yModal] = useState(false);
  const [uiScale, setUiScale] = useState(16);
  const [a11yMode, setA11yMode] = useState(false);
  const [editorZoom, setEditorZoom] = useState(1);

  // Load A11y settings
  useEffect(() => {
    const saved = localStorage.getItem('hikaya-a11y');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.uiScale) setUiScale(parsed.uiScale);
        if (parsed.a11yMode) setA11yMode(parsed.a11yMode);
        if (parsed.editorZoom) setEditorZoom(parsed.editorZoom);
      } catch (e) {}
    }
  }, []);

  // Sync A11y state with body & localstorage
  useEffect(() => {
    document.documentElement.style.fontSize = `${uiScale}px`;
    if (a11yMode) {
      document.body.classList.add('a11y-mode');
    } else {
      document.body.classList.remove('a11y-mode');
    }
    localStorage.setItem('hikaya-a11y', JSON.stringify({ uiScale, a11yMode, editorZoom }));
  }, [uiScale, a11yMode, editorZoom]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    if (project && !activePageId && project.pages.length > 0) {
      setActivePageId(project.pages[0].id);
    }
  }, [project, activePageId]);

  const updateProject = (updates: Partial<ProjectData>) => {
    const updatedProject = { ...project, ...updates };
    const updatedProjects = projects.map(p => p.id === project.id ? updatedProject : p);
    setProjects(updatedProjects);
    // Silent auto-save with indexedDB
    localforage.setItem(LOCAL_STORAGE_KEY, updatedProjects).catch(e => {
        console.error("Failed to auto-save:", e);
    });
    
    if (!isUndoRedoing) {
       const newHistory = history.slice(0, historyIndex + 1);
       newHistory.push(updatedProject);
       if (newHistory.length > 15) newHistory.shift(); 
       setHistory(newHistory);
       setHistoryIndex(newHistory.length - 1);
    }
  };

  // Setup undo/redo hotkeys and global custom events
  useEffect(() => {
    const handleRoleplay = (e: any) => {
      const charId = e.detail.characterId;
      const char = project?.characters?.find(c => c.id === charId);
      if (char) {
        setChatMessages([
          { 
            role: 'ai', 
            content: `أنا الآن متقمص لشخصية "${char.name}". تفضل بطرح أسئلتك لتختبر ردودي كأنني أنا هو حقاً، بناءً على صفاتي في القصة!` 
          }
        ]);
        setChatInput(`/roleplay ${charId} `);
        setShowChatModal(true);
      }
    };

    window.addEventListener('start-roleplay', handleRoleplay);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) { // Redo
          if (historyIndex < history.length - 1) {
            setIsUndoRedoing(true);
            const nextState = history[historyIndex + 1];
            setHistoryIndex(historyIndex + 1);
            setProjects(projects.map(p => p.id === nextState.id ? nextState : p));
            localforage.setItem(LOCAL_STORAGE_KEY, projects.map(p => p.id === nextState.id ? nextState : p));
            setTimeout(() => setIsUndoRedoing(false), 50);
          }
        } else { // Undo
          if (historyIndex > 0) {
            setIsUndoRedoing(true);
            const prevState = history[historyIndex - 1];
            setHistoryIndex(historyIndex - 1);
            setProjects(projects.map(p => p.id === prevState.id ? prevState : p));
            localforage.setItem(LOCAL_STORAGE_KEY, projects.map(p => p.id === prevState.id ? prevState : p));
            setTimeout(() => setIsUndoRedoing(false), 50);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('start-roleplay', handleRoleplay);
    };
  }, [history, historyIndex, projects, project?.characters]);

  const handleSave = async () => {
    try {
      setIsSyncing(true);
      await localforage.setItem(LOCAL_STORAGE_KEY, projects);
      showToast('تم الحفظ محلياً بنجاح ✅');
    } catch (e) {
      console.error("Save failed", e);
      showToast('❌ فشل الحفظ!');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateNewProject = async () => {
    const newProj = createNewProject();
    const newProjects = [...projects, newProj];
    setProjects(newProjects);
    setCurrentProjectId(newProj.id);
    setActivePageId(newProj.pages[0].id);
    setShowProjectsModal(false);
    await localforage.setItem(LOCAL_STORAGE_KEY, newProjects);
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length === 1) {
      showToast('لا يمكنك حذف المشروع الأخير. أنشئ مشروعاً جديداً أولاً.');
      return;
    }
    setConfirmDialog({
      msg: 'هل أنت متأكد من حذف هذا المشروع نهائياً؟',
      action: async () => {
        const newProjects = projects.filter(p => p.id !== id);
        setProjects(newProjects);
        if (currentProjectId === id) {
          setCurrentProjectId(newProjects[0].id);
          setActivePageId(newProjects[0].pages[0].id);
        }
        await localforage.setItem(LOCAL_STORAGE_KEY, newProjects);
      }
    });
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintType('none');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Fallback: If afterprint fails to fire after a long time (e.g. mobile browsers), 
    // we want a manual way out or timeout, but native afterprint is generally best.
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  if (isLoading) {
    return (
      <div className="flex w-full h-screen items-center justify-center bg-[var(--bg)] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
          <p className="font-bold text-xl">جاري تحميل مسوداتك...</p>
        </div>
      </div>
    );
  }

  const activePage = project?.pages.find(p => p.id === activePageId);
  const blocks = activePage?.blocks || [];

  const updatePageBlocks = (newBlocks: StoryBlock[]) => {
    updateProject({
      pages: project.pages.map(p => p.id === activePageId ? { ...p, blocks: newBlocks } : p)
    });
  };

  const addBlock = (type: StoryBlock['type']) => {
    const newBlock: any = { id: generateId(), type };
    if (type === 'text') {
      newBlock.content = '';
      newBlock.style = 'normal';
      newBlock.align = 'right';
    } else if (type === 'image') {
      newBlock.images = [];
      newBlock.align = 'center';
    } else if (type === 'dialogue') {
      newBlock.text = '';
      newBlock.avatarUrl = '';
      newBlock.direction = 'rtl';
      newBlock.bubbleType = 'speech';
    } else if (type === 'table') {
      newBlock.columns = 2;
      newBlock.rows = [['عمود 1', 'عمود 2'], ['نصف يمين', 'نصف يسار']];
      newBlock.align = 'center';
    } else if (type === 'divider') {
      newBlock.style = 'solid';
      newBlock.thickness = 2;
    } else if (type === 'callout') {
      newBlock.content = 'نص توضيحي أو تذكر...';
      newBlock.calloutType = 'note';
    } else if (type === 'chat') {
      newBlock.messages = [];
      newBlock.title = 'محادثة جديدة';
    } else if (type === 'quest') {
      newBlock.title = 'مهمة جديدة';
      newBlock.description = 'وصف المهمة...';
      newBlock.objective = 'الهدف:';
      newBlock.reward = 'المكافأة:';
      newBlock.status = 'new';
      newBlock.mode = 'quest';
      newBlock.choices = [{ id: generateId(), text: 'الخيار الأول' }, { id: generateId(), text: 'الخيار الثاني' }];
      newBlock.inventory = [];
      newBlock.stats = [];
    } else if (type === 'document') {
      newBlock.docType = 'newspaper';
      newBlock.title = '';
      newBlock.content = '';
      newBlock.metadata = '';
    } else if (type === 'graphic') {
      newBlock.graphicType = 'evidence';
      newBlock.title = '';
      newBlock.items = [];
    }
    updatePageBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<StoryBlock>) => {
    updatePageBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } as StoryBlock : b));
  };

  const deleteBlock = (id: string) => {
    updatePageBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(blocks) as StoryBlock[];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updatePageBlocks(items);
  };

  const executePrint = (printAll: boolean) => {
    setShowPrintModal(false);
    setPrintType(printAll ? 'all' : 'current');
    
    // Give React time to render all pages into the DOM print-only container
    setTimeout(async () => {
      try {
        const element = document.querySelector('.print-only-container');
        if (!element) throw new Error("Print container not found");
        
        showToast("جاري تجهيز وإنشاء ملف PDF...");
        
        // Dynamically import html2pdf to avoid bloating the main bundle
        // @ts-ignore
        const html2pdf = (await import('html2pdf.js')).default || (await import('html2pdf.js'));
        
        const pdfFormat = project.pageFormat === 'Custom' || !project.pageFormat ? 'a4' : project.pageFormat.toLowerCase();
        
        const opt: any = {
          margin:       0,
          filename:     `${project.name || 'Hikaya_Story'}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, allowTaint: true, logging: false },
          jsPDF:        { unit: 'mm', format: pdfFormat, orientation: 'portrait' }
        };
        
        // To support correct page breaks in html2pdf
        opt.pagebreak = { mode: ['css', 'legacy'] };

        await (html2pdf as any)().set(opt).from(element).save();
        showToast("تم تنزيل ملف PDF بنجاح! ✅");
      } catch (err) {
        console.error("Print to PDF failed:", err);
        showToast("عذراً، حدث خطأ أثناء إنشاء PDF.");
      } finally {
        setPrintType('none');
      }
    }, 800);
  };

  const addPage = () => {
    const newPage = createEmptyPage(`صفحة ${project.pages.length + 1}`);
    updateProject({ pages: [...project.pages, newPage] });
    setActivePageId(newPage.id);
  };

  const switchPage = (direction: 'next' | 'prev') => {
    const idx = project.pages.findIndex(p => p.id === activePageId);
    if (direction === 'next' && idx < project.pages.length - 1) {
      setActivePageId(project.pages[idx + 1].id);
      setSelectedBlockId(null);
    }
    if (direction === 'prev' && idx > 0) {
      setActivePageId(project.pages[idx - 1].id);
      setSelectedBlockId(null);
    }
  };

  const deletePage = () => {
    if (project.pages.length <= 1) {
      showToast('لا يمكن حذف الصفحة الوحيدة المتبقية!');
      return;
    }
    setConfirmDialog({
      msg: 'هل أنت متأكد من حذف هذه الصفحة ومحتوياتها نهائياً؟',
      action: () => {
        const newPages = project.pages.filter(p => p.id !== activePageId);
        updateProject({ pages: newPages });
        
        // Choose carefully which page to jump to
        const deletedIdx = project.pages.findIndex(p => p.id === activePageId);
        const jumpToDetails = newPages[deletedIdx - 1] || newPages[0];
        
        setActivePageId(jumpToDetails.id);
        setSelectedBlockId(null);
      }
    });
  };

  const renderBlockEditor = (block: StoryBlock) => {
    switch (block.type) {
      case 'text': return <TextEditor block={block as any} project={project} onChange={(u) => updateBlock(block.id, u)} onClick={() => setSelectedBlockId(block.id)} />;
      case 'image': return <ImageEditor block={block as any} onChange={(u) => updateBlock(block.id, u)} onClick={() => setSelectedBlockId(block.id)} />;
      case 'dialogue': return <DialogueEditor block={block as any} onChange={(u) => updateBlock(block.id, u)} onClick={() => setSelectedBlockId(block.id)} />;
      case 'table': return <TableEditor block={block as any} onChange={(u) => updateBlock(block.id, u)} onClick={() => setSelectedBlockId(block.id)} />;
      case 'divider': return <DividerEditor block={block as any} onChange={(u) => updateBlock(block.id, u)} onClick={() => setSelectedBlockId(block.id)} />;
      case 'callout': return <CalloutEditor block={block as any} onChange={(u) => updateBlock(block.id, u)} onClick={() => setSelectedBlockId(block.id)} />;
      case 'chat': return <ChatEditor block={block as any} updateBlock={(u) => updateBlock(block.id, u)} deleteBlock={() => deleteBlock(block.id)} />;
      case 'quest': return <QuestEditor block={block as any} updateBlock={(u) => updateBlock(block.id, u)} deleteBlock={() => deleteBlock(block.id)} />;
      case 'document': return <DocumentEditor block={block as any} updateBlock={(u) => updateBlock(block.id, u)} deleteBlock={() => deleteBlock(block.id)} />;
      case 'graphic': return <GraphicEditor block={block as any} updateBlock={(u) => updateBlock(block.id, u)} deleteBlock={() => deleteBlock(block.id)} />;
      default: return null;
    }
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;

  if (!project || !activePage) return null;

  // Visual representation components for print view ONLY
  const PrintDisplayBlock = ({ block, ...props }: { block: StoryBlock } & React.HTMLAttributes<HTMLDivElement>) => {
    if (block.type === 'text') {
      const b = block as any;
      return (
        <div {...props} style={{
          direction: b.align === 'left' ? 'ltr' : 'rtl',
          color: b.color || '#000',
          fontFamily: b.fontFamily ? `var(--font-${b.fontFamily})` : undefined,
          fontSize: b.fontSize ? `${b.fontSize}px` : undefined,
          lineHeight: b.fontSize ? '1.5' : undefined,
          textAlign: b.align === 'center' ? 'center' : (b.align === 'left' ? 'left' : 'right')
        }} className={cn(
          "w-full min-h-[80px] p-4 break-words relative z-10",
          b.style === 'h1' && "text-4xl font-bold font-sans",
          b.style === 'h2' && "text-2xl font-semibold font-sans",
          b.style === 'quote' && "border-r-4 border-r-purple-500 pr-4 text-slate-700 bg-purple-50",
          b.style === 'normal' && "text-lg leading-relaxed font-medium"
        )} dangerouslySetInnerHTML={{ __html: b.content }} />
      );
    }
    if (block.type === 'image') {
      const b = block as any;
      const imagesArr = b.images || (b.url ? [{ id: 'legacy', url: b.url, width: 200, height: 200 }] : []);
      if (imagesArr.length === 0) return null;
      return (
        <div {...props} className={cn(
          "py-4 w-full flex flex-wrap gap-4 relative z-10",
          b.align === 'center' ? 'justify-center' : b.align === 'left' ? 'justify-start' : 'justify-end'
        )}>
          {imagesArr.map((img: any) => (
            <img 
               key={img.id}
               src={img.url} 
               alt="Story Integrated"
               referrerPolicy="no-referrer"
               className="shadow-sm"
               style={{ 
                 width: img.width ? `${img.width}px` : 'auto',
                 height: img.height ? `${img.height}px` : 'auto',
                 borderRadius: `${b.borderRadius ?? 8}px`,
                 objectFit: 'fill'
               }}
            />
          ))}
        </div>
      );
    }
    if (block.type === 'dialogue') {
      const b = block as any;
      const isRtl = b.direction === 'rtl';
      return (
        <div {...props} className="py-4 flex flex-col w-full break-inside-avoid relative z-10">
           <div className={cn("flex items-start gap-4", isRtl ? "flex-row" : "flex-row-reverse")}>
              <div 
                className="flex-shrink-0"
                style={{ 
                  width: b.avatarSize ? `${b.avatarSize}px` : '128px',
                  height: b.avatarSize ? `${b.avatarSize}px` : '128px'
                }}
              >
                {b.avatarUrl && (
                  <div className="w-full h-full rounded-md shadow-md border-2 border-black overflow-hidden bg-white">
                    <img src={b.avatarUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" style={{ imageRendering: 'high-quality' }} alt="Avatar" />
                  </div>
                )}
              </div>
              <div className={cn("flex-grow flex flex-col relative", isRtl ? "items-start mt-2" : "items-end mt-2")}>
                 <div 
                   className={cn(
                     "relative bg-white p-4 sm:p-6 shadow-sm border-2 border-black min-h-[80px]",
                     b.bubbleType === 'speech' && "rounded-3xl",
                     b.bubbleType === 'thought' && "rounded-[2rem] border-dashed border-2",
                     b.bubbleType === 'shout' && "rounded-none",
                     b.bubbleType === 'whisper' && "rounded-2xl opacity-75 scale-95 origin-bottom",
                     b.bubbleType === 'electronic' && "rounded-sm",
                     b.bubbleType === 'scared' && "rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%]",
                     b.bubbleType === 'narrator' && "rounded-none border-t-4 border-b-4 border-l-0 border-r-0 !bg-transparent !shadow-none !border-black",
                     b.bubbleType === 'system' && "rounded-sm border border-slate-500 !bg-slate-900 !text-green-400 font-mono shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]",
                     b.bubbleType === 'speech' && (isRtl ? "rounded-tr-sm" : "rounded-tl-sm")
                   )} 
                   style={{ 
                     backgroundColor: (b.bubbleType === 'narrator' || b.bubbleType === 'system') ? undefined : (b.bubbleColor || '#ffffff'),
                     borderWidth: b.bubbleType === 'electronic' ? '4px' : (b.bubbleType === 'narrator' ? undefined : '2px'),
                     borderStyle: b.bubbleType === 'whisper' ? 'dotted' : b.bubbleType === 'thought' ? 'dashed' : 'solid',
                     width: b.bubbleWidth || 'auto',
                     height: b.bubbleHeight || 'auto',
                     direction: isRtl ? 'rtl' : 'ltr'
                   }}
                 >
                    {b.bubbleType === 'speech' && (
                      <svg 
                        className={cn("absolute top-6 w-6 h-6 z-10", isRtl ? "-right-[14px] rotate-180" : "-left-[14px]")}
                        style={{ filter: "drop-shadow(-2px 0px 0px rgba(0,0,0,1))", color: b.bubbleColor || '#ffffff' }}
                        fill="currentColor" viewBox="0 0 24 24" preserveAspectRatio="none"
                      >
                        <path d="M24 4L0 12L24 20V4Z" />
                      </svg>
                    )}
                    <div
                      className={cn(
                        "w-full h-full font-medium text-lg leading-relaxed text-slate-800 whitespace-pre-wrap",
                        b.bubbleType === 'shout' && "font-bold text-xl",
                        b.bubbleType === 'thought' && "italic text-slate-600",
                        b.bubbleType === 'whisper' && "text-sm text-slate-500",
                        b.bubbleType === 'electronic' && "font-mono font-bold tracking-tighter",
                        b.bubbleType === 'system' && "text-green-400 font-mono"
                      )}
                      style={{ fontFamily: b.fontFamily ? `var(--font-${b.fontFamily})` : undefined }}
                    >
                      {b.text}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      );
    }
    if (block.type === 'table') {
      const b = block as any;
      return (
        <div {...props} className={cn("py-4 pb-0 w-full flex relative z-10", b.align === 'center' ? 'justify-center' : b.align === 'left' ? 'justify-start' : 'justify-end')}>
           <table className="border-collapse border border-gray-400 max-w-full" style={{ tableLayout: 'fixed' }}>
              <tbody>
                {(b.rows || []).map((row: string[], rIdx: number) => (
                  <tr key={rIdx} className={rIdx === 0 ? "bg-gray-100 font-bold" : "border-t border-gray-300"}>
                    {row.map((cell: string, cIdx: number) => (
                      <td key={cIdx} className="border border-gray-400 p-3 whitespace-pre-wrap break-words" dir="rtl">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      );
    }
    if (block.type === 'divider') {
      const b = block as any;
      const getStyleParams = () => {
        if (b.style === 'wavy') return { borderTop: `${b.thickness || 2}px solid ${b.color || '#d1d5db'}` };
        return { borderTop: `${b.thickness || 2}px ${b.style || 'solid'} ${b.color || '#d1d5db'}` };
      };
      return (
        <div {...props} className="py-6 w-full flex items-center justify-center relative z-10">
          <hr style={b.style !== 'wavy' ? getStyleParams() : { borderTop: `${b.thickness||2}px dashed ${b.color||'#ccc'}`}} className="w-4/5 mx-auto" />
        </div>
      );
    }
    if (block.type === 'callout') {
      const b = block as any;
      const getClasses = () => {
        switch (b.calloutType) {
          case 'flashback': return "bg-gray-100 border-gray-400 text-gray-800 italic";
          case 'warning': return "bg-red-50 border-red-300 text-red-900";
          case 'info': return "bg-blue-50 border-blue-300 text-blue-900";
          case 'quote': return "bg-amber-50 border-amber-300 text-amber-900 font-serif";
          case 'note':
          default: return "bg-yellow-50 border-yellow-300 text-yellow-900";
        }
      };
      return (
        <div {...props} className="py-4 w-full relative z-10">
           <div 
             className={cn("w-full rounded-xl border p-5 font-sans text-lg leading-relaxed shadow-sm block break-inside-avoid px-8", getClasses())}
             style={b.backgroundColor ? { backgroundColor: b.backgroundColor, color: b.textColor } : {}}
             dir="rtl"
           >
             <div className="whitespace-pre-wrap">{b.content}</div>
           </div>
        </div>
      );
    }
    return null;
  };

  const pagesToRenderForPrint = printType === 'all' ? project.pages : (printType === 'current' ? [activePage] : []);

  return (
    <>
      <div className={cn(
        "flex flex-col h-screen overflow-hidden text-[var(--text)] font-sans",
        printType !== 'none' ? "hidden" : "bg-[var(--bg)]"
      )} dir="rtl">
      {/* Top Navbar */}
      <header className="bg-[var(--panel)] border-b border-[var(--border)] h-[56px] flex-shrink-0 flex items-center justify-between px-5 no-print z-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[var(--accent)] text-[1.2rem] font-extrabold tracking-widest font-sans border-l border-[var(--border)] pl-4">
              <span>✦</span>
              <h1>HIKAYA</h1>
            </div>
            
            <input 
              type="text"
              value={project.name || 'رواية جديدة'}
              onChange={e => updateProject({ name: e.target.value })}
              className="bg-transparent border border-transparent text-[var(--text)] font-bold outline-none focus:border-[var(--accent)] rounded px-2 py-1 w-48 text-sm transition-colors"
              placeholder="اسم الرواية..."
            />

            <button onClick={() => setShowProjectsModal(true)} className="flex items-center gap-2 bg-[#252525] hover:bg-[#333] border border-[var(--border)] px-3 py-1.5 rounded transition-colors text-xs font-bold text-[var(--text)]">
              <FolderClock size={16} title="مشاريعي" />
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2 bg-[#000000] rounded-full p-1 border border-[var(--border)]">
             <button 
               onClick={() => switchPage('next')} 
               disabled={project.pages.findIndex(p => p.id === activePageId) === project.pages.length - 1}
               className="p-1 hover:bg-[#2a2a2a] rounded-full disabled:opacity-30 transition-colors"
               title="الصفحة السابقة"
             ><ChevronRight size={18} /></button>
             
             <div className="flex flex-col items-center justify-center min-w-[80px]">
               <span className="text-sm font-bold text-center leading-none">{activePage.name}</span>
               {project.chapters && project.chapters.length > 0 && (
                 <select 
                   className="bg-transparent text-[10px] text-[var(--accent)] outline-none text-center cursor-pointer appearance-none text-center w-full mt-0.5"
                   value={activePage.chapterId || ''}
                   onChange={e => {
                     updateProject({ pages: project.pages.map(p => p.id === activePageId ? { ...p, chapterId: e.target.value } : p) });
                   }}
                 >
                   <option value="" className="bg-[var(--bg)] text-[var(--text)]">بدون فصل</option>
                   {project.chapters.map(c => (
                     <option key={c.id} value={c.id} className="bg-[var(--bg)] text-[var(--text)]">{c.title}</option>
                   ))}
                 </select>
               )}
             </div>
             
             <button 
               onClick={() => switchPage('prev')} 
               disabled={project.pages.findIndex(p => p.id === activePageId) === 0}
               className="p-1 hover:bg-[#2a2a2a] rounded-full disabled:opacity-30 transition-colors"
               title="الصفحة التالية"
             ><ChevronLeft size={18} /></button>

             <div className="w-px h-4 bg-[var(--border)] mx-1" />

             <button onClick={addPage} className="flex items-center gap-1 text-[var(--text-dim)] hover:text-[var(--accent)] text-sm transition-colors p-1.5 rounded-full" title="إضافة صفحة جديدة">
                <FilePlus size={16} /> 
             </button>
             
             <button 
                onClick={deletePage} 
                disabled={project.pages.length <= 1}
                className="flex items-center gap-1 text-[var(--text-dim)] hover:text-red-500 disabled:opacity-30 disabled:hover:text-[var(--text-dim)] text-sm transition-colors p-1.5 rounded-full" 
                title="حذف هذه الصفحة"
              >
                <Trash2 size={16} />
             </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className={cn("hidden lg:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all", isSyncing ? "text-[var(--accent)] opacity-100" : "text-[var(--text-dim)] opacity-40")}>
               <Cloud size={14} className={cn(isSyncing && "animate-pulse")} />
               <span>{isSyncing ? "جاري الحفظ..." : "تم الحفظ محلياً"}</span>
            </div>

            <div className="w-px h-6 bg-[var(--border)] mx-1 hidden lg:block" />

            <button 
              onClick={() => setShowA11yModal(true)} 
              className={cn("p-1.5 bg-transparent border rounded transition-colors flex items-center justify-center", (uiScale !== 16 || a11yMode || editorZoom !== 1) ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-[var(--border)] hover:bg-[#2a2a2a] text-[var(--text)]")}
              title="إعدادات الرؤية وسهولة الوصول"
            >
              <Monitor size={16} />
            </button>

            <button 
              onClick={() => setShowSettingsModal(true)} 
              className="p-1.5 bg-transparent text-[var(--accent)] hover:bg-[rgba(168,85,247,0.1)] rounded transition-colors"
              title="إعدادات الذكاء الاصطناعي"
            >
              <Cloud size={18} />
            </button>
            <button 
               onClick={() => setShowChatModal(true)}
               className="p-1.5 bg-transparent border border-blue-500/50 hover:bg-blue-500/10 text-blue-500 rounded transition-colors"
               title="مساعد الكاتب (AI)"
            >
              <MessageSquare size={16} />
            </button>
            <button 
               onClick={() => setShowTimelineModal(true)}
               className="p-1.5 bg-transparent hover:bg-emerald-500/10 text-emerald-500 rounded transition-colors hidden md:block"
               title="الخط الزمني المتشابك"
            >
              <Clock size={16} />
            </button>
            <button 
               onClick={() => setShowRelationshipModal(true)}
               className="p-1.5 bg-transparent hover:bg-purple-500/10 text-purple-500 rounded transition-colors hidden md:block"
               title="شبكة العلاقات"
            >
              <Network size={16} />
            </button>
            <GoalTracker project={project} updateProject={updateProject} />
            <div className="w-px h-6 bg-[var(--border)] mx-1 hidden lg:block" />
            <button
              onClick={() => setIsSplitScreen(!isSplitScreen)}
              className={cn("p-1.5 border rounded transition-colors flex items-center justify-center", isSplitScreen ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "bg-transparent border-[var(--border)] hover:bg-[#2a2a2a] text-[var(--text)]")}
              title="تقسيم الشاشة (المرجع والمسودة)"
            >
              <Columns size={16} />
            </button>
            <button
              onClick={() => setShowFindReplaceModal(true)}
              className="p-1.5 bg-transparent border border-[var(--border)] hover:bg-[#2a2a2a] text-[var(--text)] rounded transition-colors"
              title="البحث والاستبدال"
            >
              <Search size={16} />
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-1.5 bg-transparent border border-slate-500/50 hover:bg-slate-500/10 text-slate-400 rounded transition-colors"
              title="مساعدة / تعليمات"
            >
              <HelpCircle size={16} />
            </button>
            <button
              onClick={() => setShowMusicPlayer(!showMusicPlayer)}
              className={cn(
                "p-1.5 border rounded transition-colors flex items-center justify-center",
                showMusicPlayer ? "bg-orange-500 border-orange-500 text-white" : "bg-transparent border-orange-500/30 hover:bg-orange-500/10 text-orange-400"
              )}
              title="موسيقى ملهمة"
            >
              <Music size={16} />
            </button>
            <button 
              onClick={() => setIsFocusMode(!isFocusMode)} 
              className={cn("px-3 py-1.5 border rounded transition-colors flex items-center justify-center", isFocusMode ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "bg-transparent border-[var(--border)] hover:bg-[#2a2a2a] text-[var(--text)]")}
              title="وضع التركيز"
            >
              <Focus size={16} />
            </button>
            <button onClick={handleSave} title="حفظ مجمل" className="px-3 py-1.5 bg-transparent border border-[var(--border)] hover:bg-[#2a2a2a] rounded text-[var(--text)] transition-colors flex items-center justify-center">
              <Save size={16} />
            </button>
            <button onClick={() => setShowPrintModal(true)} title="طباعة" className="px-3 py-1.5 bg-transparent border border-[var(--border)] hover:bg-[#2a2a2a] rounded text-[var(--text)] transition-colors flex items-center justify-center">
              <Printer size={16} />
            </button>
            <button onClick={() => setShowExportModal(true)} title="تصدير (Word/EPUB)" className="px-3 py-1.5 bg-[var(--accent)] border border-[var(--accent)] hover:bg-purple-600 rounded text-white transition-colors flex items-center justify-center">
              <Download size={16} />
            </button>
          </div>
      </header>

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden print:block print:h-auto print:overflow-visible relative">
        
        {/* Left Toolbar */}
        {!isFocusMode && (
          <aside className="w-[70px] bg-[var(--panel)] border-l border-[var(--border)] flex flex-col items-center py-6 gap-6 z-10 flex-shrink-0 no-print animate-in slide-in-from-right-4">
            <button onClick={() => addBlock('text')} className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-dim)] hover:bg-[rgba(168,85,247,0.15)] hover:text-[var(--accent)] transition-all group relative" title="إضافة نص">
              <Type size={22} className="group-active:scale-95 transition-transform" />
            </button>
              <button onClick={() => addBlock('image')} className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-dim)] hover:bg-[rgba(168,85,247,0.15)] hover:text-[var(--accent)] transition-all group relative" title="إضافة صورة">
                <ImageIcon size={22} className="group-active:scale-95 transition-transform" />
              </button>
              <button onClick={() => addBlock('dialogue')} className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-dim)] hover:bg-[rgba(168,85,247,0.15)] hover:text-[var(--accent)] transition-all group relative" title="إضافة حوار">
                <MessageSquare size={22} className="group-active:scale-95 transition-transform" />
              </button>

              {/* Document Block */}
              <button onClick={() => addBlock('document')} className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-dim)] hover:bg-[rgba(168,85,247,0.15)] hover:text-[var(--accent)] transition-all group relative" title="يوميات / قصاصات / وثائق">
                <FilePlus size={22} className="group-active:scale-95 transition-transform" />
              </button>

              {/* Graphic Block */}
              <button onClick={() => addBlock('graphic')} className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-dim)] hover:bg-[rgba(168,85,247,0.15)] hover:text-[var(--accent)] transition-all group relative" title="رسومات / لوحة تحقيق / شجرة عائلة / خريطةمصغرة">
                <Network size={22} className="group-active:scale-95 transition-transform" />
              </button>

              <div className="w-6 h-px bg-[var(--border)] my-1" />

              {/* Structure Blocks Merged */}
              <div className="relative group/layout flex justify-center w-full">
                 <button className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-dim)] hover:bg-[rgba(168,85,247,0.15)] hover:text-[var(--accent)] transition-all w-full" title="تنسيقات هيكلية (جدول، فاصل، مربع)">
                    <LayoutTemplate size={22} className="group-active/layout:scale-95 transition-transform" />
                 </button>
                 <div className="absolute top-0 right-full mr-2 bg-[var(--panel)] border border-[var(--border)] rounded-lg shadow-xl opacity-0 invisible group-hover/layout:opacity-100 group-hover/layout:visible flex-col overflow-hidden w-40 z-50 transition-all duration-200 flex">
                    <button onClick={() => addBlock('table')} className="px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--bg)] hover:text-[var(--accent)] flex items-center gap-2 border-b border-[var(--border)] transition-colors"><Columns size={16} /> جدول قراءة</button>
                    <button onClick={() => addBlock('divider')} className="px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--bg)] hover:text-[var(--accent)] flex items-center gap-2 border-b border-[var(--border)] transition-colors"><Minus size={16} /> خط فاصل</button>
                    <button onClick={() => addBlock('callout')} className="px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--bg)] hover:text-[var(--accent)] flex items-center gap-2 transition-colors"><Square size={16} /> مربع منسق</button>
                 </div>
              </div>

              <div className="w-6 h-px bg-[var(--border)] my-1" />

              <button onClick={() => addBlock('quest')} className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-dim)] hover:bg-[rgba(168,85,247,0.15)] hover:text-[var(--accent)] transition-all group relative" title="كويست / مخزون / قدرات">
                <Target size={22} className="group-active:scale-95 transition-transform" />
              </button>
          </aside>
        )}

        {/* Viewport for Center Editor & Optional Split Screen */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Editor Canvas */}
          <section 
            className="flex-1 overflow-y-auto print:block print:h-auto print:overflow-visible bg-[#0f0f0f] print:bg-white relative flex justify-center p-4 print:p-0" 
            onClick={(e) => { if(e.target === e.currentTarget) setSelectedBlockId(null) }}
          >
            {/* Main story container */}
          <div 
            className="w-full text-black shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col h-fit min-h-full story-container transition-all duration-300 relative print:max-w-none print:w-full print:shadow-none bg-white"
            style={{ 
              backgroundColor: project.backgroundColor,
              transform: `scale(${editorZoom})`,
              transformOrigin: 'top center',
              maxWidth: 
                project.pageFormat === 'A4' ? '210mm' : 
                project.pageFormat === 'A5' ? '148mm' : 
                project.pageFormat === 'B5' ? '176mm' : 
                project.pageFormat === 'Manga' ? '130mm' :
                project.pageFormat === 'Manhwa' ? '120mm' :
                project.pageFormat === 'WebNovel' ? '240mm' :
                project.pageFormat === 'Letter' ? '216mm' : 
                `${project.pageWidth || 624}px`,
              minHeight: 
                project.pageFormat === 'A4' ? '297mm' : 
                project.pageFormat === 'A5' ? '210mm' : 
                project.pageFormat === 'B5' ? '250mm' : 
                project.pageFormat === 'Manga' ? '180mm' :
                project.pageFormat === 'Manhwa' ? '500mm' :
                project.pageFormat === 'WebNovel' ? '297mm' :
                project.pageFormat === 'Letter' ? '279mm' : 
                '100%',
              padding: `${project.pagePadding || 0}px`
            }}
            onClick={(e) => { if(e.target === e.currentTarget) setSelectedBlockId(null) }}
          >
            {/* Background Image Layer */}
            {activePage?.backgroundImage && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${activePage.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: activePage.backgroundOpacity ?? 1
                }}
              />
            )}


            <div className="relative z-10 w-full h-full">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="story-blocks">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="flex flex-col w-full h-full pb-32 print:pb-0 print:block"
                      style={{ gap: `${project.blockGap || 0}px` }}
                    >
                      {blocks.map((block, index) => {
                        // @ts-ignore
                        const DraggableCmp = Draggable as any;
                        return (
                          <DraggableCmp key={block.id} draggableId={block.id} index={index}>
                            {(provided, snapshot) => (
                            <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "relative group w-full flex-shrink-0 page-break-inside-avoid shadow-sm print:shadow-none print:break-inside-avoid",
                              snapshot.isDragging ? "shadow-[0_0_20px_rgba(0,0,0,0.2)] z-50" : "",
                              selectedBlockId === block.id ? "ring-2 ring-inset ring-[var(--accent)] block-selected" : ""
                            )}
                            onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); }}
                          >
                            {/* Block Controls */}
                            <div className={cn(
                              "absolute right-0 top-0 translate-x-[calc(100%+12px)] h-full flex flex-col justify-start pt-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print",
                              snapshot.isDragging && "opacity-0"
                            )}>
                               <div 
                                  {...provided.dragHandleProps}
                                  className="w-8 h-8 flex items-center justify-center bg-[var(--panel)] border border-[var(--border)] rounded shadow-sm hover:bg-[rgba(168,85,247,0.15)] hover:text-[var(--accent)] cursor-grab active:cursor-grabbing text-[var(--text-dim)] transition-colors"
                                  title="سحب والافلات"
                                >
                                  <GripVertical size={16} />
                               </div>
                               <button 
                                onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                                className="w-8 h-8 flex items-center justify-center bg-[var(--panel)] border border-[var(--border)] rounded shadow-sm hover:bg-red-500/20 hover:text-red-400 text-[var(--text-dim)] transition-colors"
                                title="حذف"
                              >
                                <Trash2 size={16} />
                               </button>
                            </div>
                            
                            {/* Editor Content Area */}
                            <div className={cn(
                              "bg-transparent w-full",
                              snapshot.isDragging ? "opacity-90 bg-white" : ""
                            )}>
                              {renderBlockEditor(block)}
                            </div>
                          </div>
                        )}
                      </DraggableCmp>
                    );
                  })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {blocks.length === 0 && (
              <div 
                 className="text-center text-black py-20 flex flex-col items-center no-print h-full justify-center flex-1"
                 style={{ opacity: 0.5 }}
              >
                 <div className="w-16 h-16 border-2 border-dashed border-black rounded-full flex items-center justify-center mb-4">
                    <Plus size={32} />
                 </div>
                 <p className="font-serif text-lg">الصفحة فارغة</p>
                 <p className="text-sm mt-2">أضف نصاً أو صورة من القائمة الجانبية</p>
              </div>
            )}
            </div>
          </div>
          </section>

          {/* Optional Split Screen Reference Panel */}
          {isSplitScreen && (
            <section className="w-1/2 border-r border-[#333] bg-[#1a1a1a] flex flex-col overflow-hidden animate-in slide-in-from-right no-print">
              <div className="p-4 bg-black/40 border-b border-[#333] flex justify-between items-center">
                <h3 className="font-bold text-[var(--accent)] font-serif text-lg">شاشة المرجع (Reference)</h3>
                <button onClick={() => setIsSplitScreen(false)} className="text-[var(--text-dim)] hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <PropertiesPanel 
                  block={null} 
                  onChange={() => {}} 
                  project={project}
                  updateProject={updateProject}
                  activePageId={''}
                  isExpanded={true}
                  onToggleExpand={() => {}}
                  hideSettings={true}
                />
              </div>
            </section>
          )}

        </div>

        {/* Right Sidebar */}
        {!isFocusMode && (
          <aside className={cn(
            "bg-[var(--panel)] border-r border-[var(--border)] flex flex-col overflow-hidden z-20 flex-shrink-0 no-print animate-in slide-in-from-left-4 transition-all duration-300",
            isPanelExpanded ? "absolute inset-0 w-full h-full" : "w-[320px] relative"
          )}>
              <PropertiesPanel 
                block={selectedBlock} 
                onChange={updateBlock} 
                project={project}
                updateProject={updateProject}
                activePageId={activePageId}
                isExpanded={isPanelExpanded}
                onToggleExpand={() => setIsPanelExpanded(!isPanelExpanded)}
              />
          </aside>
        )}

      </div>

      {/* Projects Modal */}
      {showProjectsModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
          <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border)]">
              <h2 className="text-xl font-bold flex items-center gap-2"><FolderClock className="text-[var(--accent)]"/> مسودة الروايات السابقة</h2>
              <button onClick={() => setShowProjectsModal(false)} className="text-[var(--text-dim)] hover:text-white"><X size={24}/></button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[60vh] flex flex-col gap-3">
               {projects.map(p => (
                 <div 
                  key={p.id} 
                  onClick={() => { setCurrentProjectId(p.id); setActivePageId(p.pages[0]?.id || ''); setShowProjectsModal(false); }}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all flex items-center justify-between group",
                    currentProjectId === p.id ? "bg-[rgba(168,85,247,0.1)] border-[var(--accent)]" : "bg-[var(--bg)] border-[var(--border)] hover:border-gray-500"
                  )}
                 >
                    <div>
                      <h3 className="font-bold text-lg">{p.name || 'مشروع بدون اسم'}</h3>
                      <p className="text-xs text-[var(--text-dim)] mt-1">{p.pages.length} صفحات • {p.characters?.length || 0} شخصيات</p>
                    </div>
                    
                    <button 
                      onClick={(e) => handleDeleteProject(p.id, e)}
                      className="hidden group-hover:block p-2 text-red-500 hover:bg-red-500/20 rounded transition-all"
                      title="حذف المشروع"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
               ))}
            </div>

            <div className="p-5 border-t border-[var(--border)] bg-[#111]">
              <button onClick={handleCreateNewProject} className="w-full bg-[var(--accent)] hover:bg-purple-600 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors">
                <Plus size={20} /> مسودة رواية جديدة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Options Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
          <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border)] relative">
              <h2 className="text-xl font-bold flex items-center gap-2"><Printer strokeWidth={2.5}/> تصدير وطباعة</h2>
              <button onClick={() => setShowPrintModal(false)} className="text-[var(--text-dim)] hover:text-white"><X size={24}/></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-[var(--text-dim)] mb-4">اختر النطاق الذي ترغب في طباعته أو حفظه كملف PDF:</p>
              
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded text-[10px] mb-4 leading-relaxed">
                💡 لحفظ الملف بصيغة PDF بعد الضغط على أحد الخيارات، اختر "حفظ بتنسيق PDF" أو "Microsoft Print to PDF" من قائمة الطابعات في النافذة التي ستظهر.
              </div>
              
              <button 
                onClick={() => executePrint(false)} 
                className="w-full bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] py-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors group"
              >
                <span className="font-bold text-lg group-hover:text-[var(--accent)] transition-colors">الصفحة الحالية فقط</span>
                <span className="text-xs text-[var(--text-dim)]">({activePage.name})</span>
              </button>

              <button 
                onClick={() => executePrint(true)} 
                className="w-full bg-[rgba(168,85,247,0.1)] border border-[var(--accent)] hover:bg-[rgba(168,85,247,0.2)] text-[var(--accent)] py-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors text-center"
              >
                <span className="font-bold text-lg">كل الصفحات</span>
                <span className="text-xs opacity-80">(سيطبع محتوى كل الصفحات تحت بعضها)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-white px-6 py-3 rounded-full shadow-lg z-[200] font-bold animate-in fade-in slide-in-from-bottom-4 no-print">
           {toastMsg}
        </div>
      )}
      </div>

      {printType !== 'none' && (
        <div className="print-only-container bg-white text-black relative flex flex-col items-center py-8" dir="rtl" style={{ minWidth: 'min-content' }}>
           <button 
             onClick={() => setPrintType('none')}
             data-html2canvas-ignore="true"
             className="no-print fixed top-6 right-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl z-[9999] font-bold text-lg"
           >
             <X className="w-6 h-6" />
             إغلاق وضع الطباعة
           </button>
           {pagesToRenderForPrint.map((page, idx) => (
             <div 
               key={page.id} 
               className="mx-auto mb-8 break-after-page shadow-md relative overflow-hidden bg-white"
               style={{ 
                 width: 
                    project.pageFormat === 'A4' ? '210mm' : 
                    project.pageFormat === 'A5' ? '148mm' : 
                    project.pageFormat === 'B5' ? '176mm' : 
                    project.pageFormat === 'Manga' ? '130mm' :
                    project.pageFormat === 'Manhwa' ? '120mm' :
                    project.pageFormat === 'WebNovel' ? '240mm' :
                    project.pageFormat === 'Letter' ? '216mm' : 
                    project.pageFormat === 'Custom' || !project.pageFormat ? `${project.pageWidth || 624}px` : '210mm',
                 minHeight: 
                    project.pageFormat === 'A4' ? '297mm' : 
                    project.pageFormat === 'A5' ? '210mm' : 
                    project.pageFormat === 'B5' ? '250mm' : 
                    project.pageFormat === 'Manga' ? '180mm' :
                    project.pageFormat === 'Manhwa' ? '500mm' :
                    project.pageFormat === 'WebNovel' ? '297mm' :
                    project.pageFormat === 'Letter' ? '279mm' : 
                    project.pageFormat === 'Custom' || !project.pageFormat ? '100vh' : '297mm',
                 padding: `${project.pagePadding || 20}px`,
                 display: 'flex',
                 flexDirection: 'column',
                 gap: `${project.blockGap || 0}px`,
                 boxSizing: 'border-box',
                 backgroundColor: project.backgroundColor || 'white'
               }}
             >
               {/* Background Image Layer for Print */}
               {page.backgroundImage && (
                 <div 
                   className="absolute inset-0 pointer-events-none z-0"
                   style={{
                     backgroundImage: `url(${page.backgroundImage})`,
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     opacity: page.backgroundOpacity ?? 1
                   }}
                 />
               )}
                {page.blocks.map(block => (
                   <PrintDisplayBlock key={block.id} block={block} />
                ))}
             </div>
           ))}
        </div>
      )}
      {/* AISettings Modal */}
      <AISettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={() => showToast('تم حفظ إعدادات AI بنجاح ✅')}
      />

      {/* Modals */}
      <TimelineModal isOpen={showTimelineModal} onClose={() => setShowTimelineModal(false)} project={project} updateProject={updateProject} />
      <RelationshipModal isOpen={showRelationshipModal} onClose={() => setShowRelationshipModal(false)} project={project} />

      {/* Accessibility Modal */}
      <AccessibilityModal
        isOpen={showA11yModal}
        onClose={() => setShowA11yModal(false)}
        uiScale={uiScale}
        setUiScale={setUiScale}
        a11yMode={a11yMode}
        setA11yMode={setA11yMode}
        editorZoom={editorZoom}
        setEditorZoom={setEditorZoom}
      />

      {/* Confirm Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex justify-center items-center no-print">
          <div className="bg-[var(--panel)] border border-[var(--border)] w-[400px] max-w-[90vw] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-white">تأكيد الإجراء</h3>
              <p className="text-[var(--text-dim)]">{confirmDialog.msg}</p>
            </div>
            <div className="p-4 bg-[var(--bg)] border-t border-[var(--border)] flex justify-end gap-3 rounded-b-xl">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded text-[var(--text)] hover:bg-[#333] transition-colors font-bold"
              >
                إلغاء
              </button>
              <button 
                onClick={() => {
                  confirmDialog.action();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-lg"
              >
                نعم، تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help / Tutorial Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex justify-center items-center no-print p-4">
          <div className="bg-[var(--panel)] border border-[var(--border)] w-full max-w-2xl max-h-[85vh] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
             <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[#111]">
                <h2 className="text-xl font-bold flex items-center gap-2"><HelpCircle className="text-slate-400"/> شرح استخدام التطبيق</h2>
                <button onClick={() => setShowHelpModal(false)} className="text-[var(--text-dim)] hover:text-white"><X size={24}/></button>
             </div>
             
             <div className="p-6 overflow-y-auto flex flex-col gap-6" dir="rtl">
                
                <section className="flex flex-col gap-2">
                   <h3 className="text-lg font-bold text-[var(--accent)] border-b border-[var(--border)] pb-1">مقدمة عن HIKAYA</h3>
                   <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                     تطبيق HIKAYA هو بيئة عمل متكاملة لبناء العوالم وكتابة الروايات. يتيح لك التطبيق تصميم صفحات كتابك، بناء قواعد العالم (World Building)، وإدارة الشخصيات وتتبع الحبكات.
                   </p>
                </section>

                <section className="flex flex-col gap-2">
                   <h3 className="text-lg font-bold text-blue-400 border-b border-[var(--border)] pb-1">أدوات بناء الصفحة (المحرر)</h3>
                   <ul className="text-sm text-[var(--text-dim)] leading-relaxed list-disc list-inside flex flex-col gap-1">
                     <li><strong>النص:</strong> يمكنك إضافة فقرات، عناوين عريضة (H1, H2)، أو اقتباسات، والتحكم بالخط والمحاذاة واللون.</li>
                     <li><strong>الصورة:</strong> رفع لقطات توضيحية أو مشاهد يمكن تصميم شكلها داخل الصفحة.</li>
                     <li><strong>الحوار:</strong> عنصر مخصص لإدراج محادثات الشخصيات مع توضيح شكل فقاعة الحوار واسم المتحدث بأسلوب القصص المصورة.</li>
                     <li><strong>صندوق التنبيه (Callout):</strong> يستخدم لإدراج ملاحظات، تحذيرات، أو ذكريات بارزة.</li>
                     <li><strong>الجدول:</strong> لعرض بيانات منظمة، مثل الجداول الزمنية أو قوائم. (يدعم حتى 4 أعمدة)</li>
                     <li><strong>الفاصل:</strong> خط يفصل بين المشاهد.</li>
                     <li><strong>إعدادات الذكاء الاصطناعي ☁️:</strong> لا تنسَ إدخال مفتاح (Gemini API Key) الخاص بك من الإعدادات لاستخدام ميزات التوليد المتوفرة (أفكار، تحسين نص).</li>
                   </ul>
                </section>

                <section className="flex flex-col gap-2">
                   <h3 className="text-lg font-bold text-amber-500 border-b border-[var(--border)] pb-1">القائمة الجانبية (بناء العالم)</h3>
                   <ul className="text-sm text-[var(--text-dim)] leading-relaxed list-disc list-inside flex flex-col gap-1">
                     <li><strong>خصائص (⚙️):</strong> التحكم بستايل الصفحة الكامل (لون الخلفية، الهوامش...).</li>
                     <li><strong>شخصيات (👥):</strong> بناء ملفات الشخصيات مفصلة تشمل الأهداف، المخاوف، القدرات... إلخ.</li>
                     <li><strong>سيناريو (📄):</strong> تخطيط خط القصة الرئيسي، وكتابة أفكار للحبكات (Twists).</li>
                     <li><strong>العالم (📖):</strong> تسجيل معلومات المواقع الجغرافية وموسوعة العالم.</li>
                     <li><strong>تخطيط ( Kanban ):</strong> ترتيب مهام الكتابة لمتابعة سير العمل والفصول.</li>
                     <li><strong>النقابات (🛡️):</strong> ربط الشخصيات بالطوائف والعائلات.</li>
                     <li><strong>القاموس (A):</strong> إنشاء لغات مبتكرة وقوائم للأديان والمعتقدات لفهم عالم الرواية.</li>
                   </ul>
                </section>

                <div className="mt-4 pt-4 border-t border-[var(--border)] w-full text-center">
                   <p className="text-sm font-bold text-[var(--text)] opacity-80 decoration-dashed underline">
                     تم عمل هذا التطبيق من قبل شاكر عيد البراك
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* AI Writer Assistant Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex justify-end p-4 animate-in fade-in sm:p-0 sm:pt-16 sm:pr-16 no-print" onClick={() => setShowChatModal(false)} dir="rtl">
           <div 
             className="bg-[var(--panel)] border-l border-t border-b border-[var(--border)] w-full max-w-md h-full rounded-r-none rounded-l-2xl sm:h-[calc(100vh-64px)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left"
             onClick={e => e.stopPropagation()}
           >
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[#111]">
                 <h2 className="font-bold flex items-center gap-2"><Sparkles className="text-blue-500" size={20} /> مساعد الكاتب الذكي</h2>
                 <button onClick={() => setShowChatModal(false)} className="text-[var(--text-dim)] hover:text-white"><X size={20} /></button>
              </div>
              <div className="bg-amber-500/10 border-b border-amber-500/30 p-2 flex justify-center">
                 <button 
                   onClick={async () => {
                     setChatMessages((prev) => [...prev, { role: 'user', content: 'اكتشف الثغرات المنطقية (Plot Holes) في حبكة قصتي، كن محامي الشيطان وانتقد الأحداث بشدة!' }]);
                     setIsChatting(true);
                     try {
                       const { generateSuggestion } = await import('../lib/aiService');
                       const prompt = 'اكتشف الثغرات المنطقية (Plot Holes) في حبكة القصة المكتوبة حتى الآن، بناء الشخصيات، وتناسق العالم. كن مثل "محامي الشيطان"، وانتقد الأحداث بشدة، واطرح أسئلة صعبة تكشف عيوب أو تناقضات القصة.';
                       const response = await generateSuggestion(prompt, 'chat', project);
                       if (response) {
                         setChatMessages(prev => [...prev, { role: 'ai', content: response }]);
                       }
                     } finally {
                       setIsChatting(false);
                     }
                   }}
                   className="flex items-center gap-2 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-2 rounded-full text-xs font-bold transition-colors border border-amber-500/30"
                 >
                   <Search size={14} /> مُحامي الشيطان: صائد الثغرات
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                 {chatMessages.length === 0 && (
                   <div className="text-center text-[var(--text-dim)] my-auto opacity-60 flex flex-col items-center gap-3">
                     <Sparkles size={40} className="text-blue-500/50" />
                     <p>أنا مساعدك في كتابة الروايات وبناء العوالم.<br/>بإمكاني اقتراح أحداث، أسماء، تصحيح الأفكار، أو مناقشة الحبكة معك.</p>
                   </div>
                 )}
                 {chatMessages.map((msg, i) => (
                    <div key={i} className={cn("max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed text-sm shadow-sm", msg.role === 'user' ? "bg-blue-600/20 text-blue-100 self-end rounded-tl-sm border border-blue-500/30" : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] self-start rounded-tr-sm")}>
                      {msg.content}
                    </div>
                 ))}
                 {isChatting && (
                   <div className="self-start bg-[var(--bg)] border border-[var(--border)] p-3 rounded-2xl rounded-tr-sm flex items-center gap-2 text-[var(--text-dim)]">
                     <Loader2 size={16} className="animate-spin" /> يكتب...
                   </div>
                 )}
              </div>
              <div className="p-4 bg-[var(--bg)] border-t border-[var(--border)]">
                 <form 
                   onSubmit={async (e) => {
                     e.preventDefault();
                     if (!chatInput.trim() || isChatting) return;
                     const query = chatInput.trim();
                     setChatInput('');
                     const newMessages = [...chatMessages, { role: 'user' as const, content: query }];
                     setChatMessages(newMessages);
                     setIsChatting(true);
                     
                     try {
                       const { generateSuggestion } = await import('../lib/aiService');
                       // pass the last few messages as context if needed, but for simplicity we just pass the query.
                       // The aiService currently takes a single string. It's smart enough.
                       // To make it conversational, we can stringify the history.
                       const historyContext = newMessages.map(m => `${m.role === 'user' ? 'الكاتب' : 'المساعد'}: ${m.content}`).join('\n');
                       
                       const response = await generateSuggestion(historyContext, 'chat', project);
                       
                       if (response) {
                         setChatMessages([...newMessages, { role: 'ai', content: response }]);
                       } else {
                         setChatMessages([...newMessages, { role: 'ai', content: 'عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.' }]);
                       }
                     } finally {
                       setIsChatting(false);
                     }
                   }}
                   className="flex gap-2"
                 >
                   <input 
                     type="text" 
                     value={chatInput}
                     onChange={e => setChatInput(e.target.value)}
                     placeholder="اسألني عن الحبكة، الشخصيات، التسميات..." 
                     className="flex-1 bg-[var(--panel)] border border-[var(--border)] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                   />
                   <button 
                     type="submit" 
                     disabled={!chatInput.trim() || isChatting}
                     className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                   >
                     <Send size={18} className="rtl:-scale-x-100 mr-1" />
                   </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      <MusicPlayer 
        isOpen={showMusicPlayer} 
        onClose={() => setShowMusicPlayer(false)} 
      />

      {showExportModal && (
        <ExportModal 
          project={project} 
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showFindReplaceModal && (
        <FindReplaceModal 
          project={project}
          updateProject={updateProject}
          onClose={() => setShowFindReplaceModal(false)}
        />
      )}

    </>
  );
}
