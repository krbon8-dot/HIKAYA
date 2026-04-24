import React, { useMemo } from 'react';
import { ProjectData } from '../types';
import { X, Network } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
}

export function RelationshipModal({ isOpen, onClose, project }: Props) {
  if (!isOpen) return null;

  // Compute a simple directed graph layout or force-directed graph.
  // Since we don't have d3 installed by default or a heavy graph library, we'll build a neat CSS grid or radial layout.
  // Actually, we can use a cool pseudo-random or circular layout using math.

  const characters = project.characters || [];
  const relations = project.relations || [];

  const radius = 200;
  const cx = 350;
  const cy = 250;

  const positions = useMemo(() => {
    const coords: Record<string, { x: number, y: number }> = {};
    const total = characters.length;
    characters.forEach((char, i) => {
      const angle = (i / total) * Math.PI * 2;
      coords[char.id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    });
    return coords;
  }, [characters]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex justify-center items-center no-print" dir="rtl">
      <div className="bg-[#121212] border border-[#333] w-[800px] max-w-[95vw] h-[80vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#1a1a1a]">
          <h3 className="font-bold text-white flex items-center gap-2 text-xl">
            <Network className="text-purple-500" />
            شبكة العلاقات الديناميكية
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#0a0a0a] relative">
           
           {characters.length === 0 ? (
             <div className="text-slate-500 text-lg">لا توجد شخصيات مضافة بعد لتكوين الشبكة.</div>
           ) : (
             <div className="relative w-[700px] h-[500px] border border-[#222] rounded-3xl bg-[#111] overflow-hidden shadow-inner">
               <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <defs>
                   <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="10" refY="3" orient="auto">
                     <polygon points="0 0, 6 3, 0 6" fill="#6b7280" />
                   </marker>
                 </defs>
                 {relations.map(rel => {
                   const start = positions[rel.char1Id];
                   const end = positions[rel.char2Id];
                   if (!start || !end) return null;
                   
                   // Find mid point for text
                   const midX = (start.x + end.x) / 2;
                   const midY = (start.y + end.y) / 2;

                   return (
                     <g key={rel.id}>
                       <line 
                         x1={start.x} y1={start.y} 
                         x2={end.x} y2={end.y} 
                         stroke="#4b5563" strokeWidth="2" strokeDasharray="4"
                       />
                       <rect x={midX - 30} y={midY - 10} width="60" height="20" fill="#222" rx="4" />
                       <text x={midX} y={midY + 4} fill="#9ca3af" fontSize="10" textAnchor="middle" fontWeight="bold">
                         {rel.type}
                       </text>
                     </g>
                   );
                 })}
               </svg>

               {characters.map(char => {
                 const pos = positions[char.id];
                 if (!pos) return null;
                 return (
                   <div 
                     key={char.id}
                     className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                     style={{ left: pos.x, top: pos.y }}
                   >
                     <div className="w-14 h-14 rounded-full border-2 border-purple-500 bg-black overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:scale-110 group-hover:border-white transition-all z-10 relative">
                        {char.avatarUrl ? <img src={char.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-slate-800 text-slate-300">{char.name[0]}</div>}
                     </div>
                     <span className="mt-2 text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded shadow whitespace-nowrap z-20">
                       {char.name}
                     </span>
                   </div>
                 );
               })}
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
