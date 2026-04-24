import React, { useState } from 'react';
import { Search, X, CheckCircle, Replace } from 'lucide-react';
import { ProjectData } from '../types';

interface FindReplaceModalProps {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
  onClose: () => void;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({ project, updateProject, onClose }) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [counts, setCounts] = useState(-1);
  const [replaced, setReplaced] = useState(false);

  const handleSearch = () => {
    if (!findText) return;
    let occurrences = 0;
    const regex = new RegExp(findText, matchCase ? 'g' : 'gi');

    project.pages.forEach(pg => {
      pg.blocks.forEach(b => {
        if (b.type === 'text' || b.type === 'dialogue') {
          const matches = (b.content || '').match(regex);
          if (matches) occurrences += matches.length;
        }
      });
    });
    setCounts(occurrences);
    setReplaced(false);
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const regex = new RegExp(findText, matchCase ? 'g' : 'gi');
    let replacedCount = 0;

    const newPages = project.pages.map(pg => ({
      ...pg,
      blocks: pg.blocks.map(b => {
        if (b.type === 'text' || b.type === 'dialogue') {
          const content = b.content || '';
          const matches = content.match(regex);
          if (matches) replacedCount += matches.length;
          return { ...b, content: content.replace(regex, replaceText) };
        }
        return b;
      })
    }));

    updateProject({ pages: newPages });
    setCounts(replacedCount);
    setReplaced(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-[var(--border)] bg-black/20">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold text-sm">البحث والاستبدال الشامل</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[var(--text-dim)] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--text-dim)]">البحث عن</label>
            <input 
              type="text" 
              value={findText}
              onChange={e => setFindText(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]"
              placeholder="الكلمة المراد البحث عنها..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--text-dim)]">استبدال بـ</label>
            <input 
              type="text" 
              value={replaceText}
              onChange={e => setReplaceText(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-[var(--accent)]"
              placeholder="الكلمة الجديدة..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="matchCase"
              checked={matchCase}
              onChange={e => setMatchCase(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            <label htmlFor="matchCase" className="text-xs">تطابق حالة الأحرف</label>
          </div>

          <div className="flex gap-2 mt-2">
            <button 
              onClick={handleSearch}
              className="flex-1 bg-[#2a2a2a] hover:bg-[#333] border border-[var(--border)] text-white py-2 rounded-lg text-sm font-bold transition-colors"
            >
              بحث
            </button>
            <button 
              onClick={handleReplaceAll}
              disabled={!findText}
              className="flex-1 bg-[var(--accent)] hover:bg-purple-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Replace size={16} />
              استبدال الكل
            </button>
          </div>

          {counts >= 0 && (
            <div className={`mt-2 p-3 rounded-lg text-sm flex items-center gap-2 ${replaced ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
              <CheckCircle size={16} />
              <span>
                {replaced ? `تم استبدال ${counts} كلمة بنجاح عبر المشروع.` : `تم العثور على ${counts} نتيجة في المشروع.`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
