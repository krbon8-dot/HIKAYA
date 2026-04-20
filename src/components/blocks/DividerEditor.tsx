import React from 'react';
import { DividerBlock } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  block: DividerBlock;
  onChange: (updates: Partial<DividerBlock>) => void;
  onClick?: () => void;
}

export default function DividerEditor({ block, onChange, onClick }: Props) {
  const getStyleParams = () => {
    const s = block.style;
    const c = block.color || '#d1d5db'; // text-gray-300 default equivalent in light mode
    const t = block.thickness || 2;
    // We map wavy to a background image or just a specific border. Native wavy is hard for HR. We use border-style
    if (s === 'wavy') {
       return { borderTop: `${t}px solid ${c}` }; // we'll use a hack or just simple border if CSS isn't supporting wavy on HR
    }
    return { borderTop: `${t}px ${s} ${c}` };
  };

  return (
    <div 
      className={cn("w-full py-6 transition-colors group cursor-pointer")} 
      onClick={onClick}
    >
        <div className="w-full flex items-center justify-center p-2 opacity-50 group-hover:opacity-100 transition-opacity">
           {block.style === 'wavy' ? (
              <div 
                style={{ 
                  height: block.thickness || 4, 
                  width: '80%', 
                  background: `linear-gradient(45deg, transparent, transparent 49%, ${block.color || '#d1d5db'} 49%, transparent 51%)`
                }} 
              /> // Simple placeholder for wavy if needed, but let's just use regular border for simplicity for now
           ) : null}
           <hr style={block.style !== 'wavy' ? getStyleParams() : { borderTop: `${block.thickness||2}px dashed ${block.color||'#ccc'}`}} className="w-4/5 mx-auto" />
        </div>
    </div>
  );
}
