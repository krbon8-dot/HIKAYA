import React from 'react';
import { CalloutBlock } from '../../types';
import { cn } from '../../lib/utils';
import { Info, AlertTriangle, BookOpen, Quote } from 'lucide-react';

interface Props {
  block: CalloutBlock;
  onChange: (updates: Partial<CalloutBlock>) => void;
  onClick?: () => void;
}

export default function CalloutEditor({ block, onChange, onClick }: Props) {
  
  const getStyleClasses = () => {
    switch (block.calloutType) {
      case 'flashback': return "bg-gray-100 border-gray-400 text-gray-800 italic";
      case 'warning': return "bg-red-50 border-red-300 text-red-900";
      case 'info': return "bg-blue-50 border-blue-300 text-blue-900";
      case 'quote': return "bg-amber-50 border-amber-300 text-amber-900 font-serif";
      case 'note':
      default: return "bg-yellow-50 border-yellow-300 text-yellow-900";
    }
  };

  const getIcon = () => {
    switch (block.calloutType) {
      case 'flashback': return <BookOpen size={20} className="mb-2 opacity-60" />;
      case 'warning': return <AlertTriangle size={20} className="mb-2 text-red-500 opacity-80" />;
      case 'info': return <Info size={20} className="mb-2 text-blue-500 opacity-80" />;
      case 'quote': return <Quote size={20} className="mb-2 opacity-60" />;
      case 'note':
      default: return null;
    }
  };

  return (
    <div 
      className={cn("w-full p-4 transition-colors")} 
      onClick={onClick}
    >
        <div 
          className={cn(
             "w-full rounded-xl border p-5 relative font-sans text-lg leading-relaxed shadow-sm flex flex-col",
             getStyleClasses()
          )}
          style={block.backgroundColor ? { backgroundColor: block.backgroundColor, color: block.textColor } : {}}
          dir="rtl"
        >
          {getIcon()}
          <textarea
             value={block.content}
             onChange={e => onChange({ content: e.target.value })}
             className="w-full bg-transparent resize-y min-h-[80px] focus:outline-none"
             placeholder="اكتب هنا..."
             style={{ color: 'inherit' }}
          />
        </div>
    </div>
  );
}
