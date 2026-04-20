import React from 'react';
import { TableBlock } from '../../types';
import { generateId, cn } from '../../lib/utils';
import { Plus, Minus, Type, Layers } from 'lucide-react';

interface Props {
  block: TableBlock;
  onChange: (updates: Partial<TableBlock>) => void;
  onClick?: () => void;
}

export default function TableEditor({ block, onChange, onClick }: Props) {
  const handleCellChange = (rIndex: number, cIndex: number, val: string) => {
    const newRows = [...block.rows];
    newRows[rIndex] = [...newRows[rIndex]];
    newRows[rIndex][cIndex] = val;
    onChange({ rows: newRows });
  };

  const addRow = () => {
    onChange({ rows: [...block.rows, new Array(block.columns).fill('')] });
  };

  const removeRow = (rIndex: number) => {
    const newRows = [...block.rows];
    newRows.splice(rIndex, 1);
    onChange({ rows: newRows.length ? newRows : [['']] });
  };

  return (
    <div 
      className={cn("w-full p-6 transition-colors min-h-[100px] font-sans relative group")} 
      onClick={onClick}
    >
      <div className={cn(
        "max-w-full overflow-x-auto",
        block.align === 'center' ? 'mx-auto' : block.align === 'left' ? 'ml-0 mr-auto' : 'ml-auto mr-0'
      )}>
        <table className="w-full border-collapse border border-[var(--border)] bg-white text-black min-w-[300px] shadow-sm rounded-lg overflow-hidden">
          <tbody>
            {block.rows.map((row, rIndex) => (
              <tr key={rIndex} className={rIndex === 0 ? "bg-gray-100 font-bold" : "border-t border-gray-200"}>
                {row.map((cell, cIndex) => (
                  <td key={cIndex} className="p-0 align-top border-r border-gray-200 last:border-0 relative group/cell">
                    <textarea
                      value={cell}
                      onChange={(e) => handleCellChange(rIndex, cIndex, e.target.value)}
                      placeholder={rIndex === 0 ? "عنوان العمود" : "نص خلية"}
                      className="w-full h-full min-h-[60px] p-3 resize-y bg-transparent focus:outline-none focus:bg-blue-50/50"
                      dir="rtl"
                    />
                  </td>
                ))}
                <td className="w-8 p-0 border-0 align-middle text-center opacity-0 group-hover:opacity-100 transition-opacity no-print">
                   <button 
                     onClick={() => removeRow(rIndex)} 
                     className="p-1 text-red-500 hover:bg-red-50 rounded"
                     title="حذف الصف"
                   >
                     <Minus size={14} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
         <button onClick={addRow} className="flex items-center gap-1 text-xs text-[var(--accent)] hover:bg-[rgba(168,85,247,0.1)] px-3 py-1.5 rounded uppercase mt-2">
           <Plus size={14} /> إضافة صف
         </button>
      </div>
    </div>
  );
}
