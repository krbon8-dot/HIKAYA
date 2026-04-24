import React, { useState } from 'react';
import { X, Download, FileText, BookOpen, Loader2 } from 'lucide-react';
import { ProjectData } from '../types';
import { saveAs } from 'file-saver';

// html-to-docx and epub-gen-memory cause browser bundle crashes because they rely on node streams.
// We will generate a .doc containing HTML (Word opens it natively) and 
// for EPUB we will either generate a raw HTML or basic ZIP if available.

interface ExportModalProps {
  project: ProjectData;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'docx' | 'epub'>('docx');

  const generateHTML = () => {
    let html = `<html><head><meta charset="utf-8"><title>${project.name}</title></head><body>`;
    html += `<h1>${project.name}</h1>`;
    
    // add pages
    project.pages.forEach(page => {
      html += `<h2>${page.name}</h2>`;
      page.blocks.forEach(block => {
        if (block.type === 'text') {
          html += `<div>${block.content || ''}</div>`;
        } else if (block.type === 'dialogue') {
          html += `<p><b>${(block as any).character || 'شخصية'}:</b> ${(block as any).content || ''}</p>`;
        } else if (block.type === 'chat') {
          const chat = block as any;
          html += `<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;"><h3>${chat.title || 'محادثة'}</h3>`;
          chat.messages.forEach((msg: any) => {
             html += `<div style="margin-bottom: 5px; text-align: ${msg.isSelf ? 'left' : 'right'};"><b style="color: blue;">${msg.isSelf ? 'أنا' : msg.sender}:</b> ${msg.content}</div>`;
          });
          html += `</div>`;
        } else if (block.type === 'quest') {
          const quest = block as any;
          html += `<div style="border: 2px dashed orange; padding: 10px; margin: 10px 0;">
             <h3 style="color: orange;">مهمة: ${quest.title}</h3>
             <p><b>وصف:</b> ${quest.description}</p>
             <p><b>الهدف:</b> ${quest.objective}</p>
             <p><b>المكافأة:</b> ${quest.reward}</p>
             <p><b>الحالة:</b> ${quest.status}</p>
          </div>`;
        }
      });
      html += '<br style="page-break-before: always; clear: both" />';
    });
    
    html += `</body></html>`;
    return html;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const htmlContent = generateHTML();
      
      if (exportType === 'docx') {
        // Simple HTML-based Word document. Word parses this as a document flawlessly.
        const blob = new Blob(['\\ufeff', htmlContent], {
          type: 'application/msword;charset=utf-8'
        });
        saveAs(blob, `${project.name}.doc`);
      } else if (exportType === 'epub') {
        // Fallback to HTML for EPUB option since Node.js EPUB generators crash the browser. 
        // In a real browser app, we'd use jszip to build the epub structure.
        // For now, we provide the compiled HTML which is useful for e-readers.
        const blob = new Blob(['\\ufeff', htmlContent], {
          type: 'text/html;charset=utf-8'
        });
        saveAs(blob, `${project.name}_compiled.html`);
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء التصدير');
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-[var(--border)] bg-black/20">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold text-sm">تصدير المشروع</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[var(--text-dim)] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setExportType('docx')}
              className={`flex flex-col items-center gap-3 p-4 border rounded-xl transition-all ${exportType === 'docx' ? 'bg-blue-500/20 border-blue-500' : 'bg-[var(--bg)] border-[var(--border)] hover:bg-[#333]'}`}
            >
              <FileText size={40} className={exportType === 'docx' ? 'text-blue-400' : 'text-[var(--text-dim)]'} />
              <div className="text-center">
                <span className="block font-bold text-sm">Word (.doc)</span>
                <span className="text-[10px] text-[var(--text-dim)]">للمنصات ودور النشر</span>
              </div>
            </button>

            <button 
              onClick={() => setExportType('epub')}
              className={`flex flex-col items-center gap-3 p-4 border rounded-xl transition-all ${exportType === 'epub' ? 'bg-orange-500/20 border-orange-500' : 'bg-[var(--bg)] border-[var(--border)] hover:bg-[#333]'}`}
            >
              <BookOpen size={40} className={exportType === 'epub' ? 'text-orange-400' : 'text-[var(--text-dim)]'} />
              <div className="text-center">
                <span className="block font-bold text-sm">ملف HTML</span>
                <span className="text-[10px] text-[var(--text-dim)]">للقراءة والمراجعة</span>
              </div>
            </button>
          </div>

          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-[var(--accent)] hover:bg-purple-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isExporting ? 'جاري تصدير الملف...' : 'تصدير الآن'}
          </button>
        </div>
      </div>
    </div>
  );
};
