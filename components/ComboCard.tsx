import React, { useState } from 'react';
import { Combo, CharacterData, Okizeme } from '../types';
import { Icons } from './Icons';

interface ComboCardProps {
  combo: Combo;
  character: CharacterData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const ComboCard: React.FC<ComboCardProps> = ({ combo, character, onEdit, onDelete, onToggleFavorite }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to find Oki suggestions
  const suggestions = character.okizeme.filter(o => 
     combo.endSituationAdvantage >= o.minAdvantage && combo.endSituationAdvantage <= o.maxAdvantage
  );

  const hasDownTag = combo.tags.includes('ダウン') || combo.tags.includes('Down');

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`コンボレシピ「${combo.name}」を削除しますか？\nこの操作は取り消せません。`)) {
      onDelete(combo.id);
    }
  };

  return (
    <div 
      className={`bg-sf-card border p-4 rounded-lg hover:border-sf-accent transition-all shadow-sm group cursor-pointer ${combo.isFavorite ? 'border-amber-200 bg-amber-50/20' : 'border-sf-border'}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
        <div className="flex justify-between items-start mb-2 pr-10 relative">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <button 
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(combo.id); }}
                        className={`transition-colors ${combo.isFavorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}
                    >
                        <Icons.Star size={18} fill={combo.isFavorite ? "currentColor" : "none"} />
                    </button>
                    <h3 className="font-bold text-lg text-sf-text">{combo.name}</h3>
                </div>
                <div className="flex flex-wrap gap-1 mt-1 pl-6">
                     {!isExpanded && combo.tags.map(tag => (
                         <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-200">#{tag}</span>
                     ))}
                </div>
            </div>
            
            <div className="absolute top-0 right-[-10px] flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onEdit(combo.id); }} 
                    className="p-1.5 bg-sf-input rounded hover:bg-sf-accent hover:text-white text-sf-subtext"
                >
                    <Icons.Edit size={14} />
                </button>
                <button 
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={handleDelete} 
                    className="p-1.5 bg-sf-input rounded hover:bg-sf-danger hover:text-white text-sf-subtext"
                >
                    <Icons.Delete size={14} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <span className={`text-sm px-2 py-1 rounded font-mono font-bold border ${combo.endSituationAdvantage > 0 ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {combo.endSituationAdvantage > 0 ? '+' : ''}{combo.endSituationAdvantage}F
                </span>
                {isExpanded ? <Icons.Down size={20} className="text-sf-subtext" /> : <Icons.Right size={20} className="text-sf-subtext" />}
            </div>
        </div>
        
        <div className="flex items-center gap-2 mb-3 text-sm text-sf-subtext flex-wrap pl-6">
            <div className="flex items-center gap-1 bg-sf-input px-2 py-1 rounded border border-sf-border">
                <Icons.Attack size={14} className="text-sf-warning" /> <span className="font-bold text-sf-text">{combo.totalDamage}</span>
            </div>
            <div className="flex items-center gap-1 bg-sf-input px-2 py-1 rounded border border-sf-border">
                <Icons.Meter size={14} className="text-blue-500" /> <span className="font-bold text-sf-text">{combo.meterCost} 本</span>
            </div>
        </div>

        {/* Combo Steps Visualization - Concise View with Names */}
        <div className="flex flex-wrap items-center gap-1 text-sm mb-2 pl-6">
            {(() => {
                const starter = character.moves.find(m => m.id === combo.starterId);
                return <span className="text-sf-accent font-bold text-xs bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{starter?.name || '???'}</span>
            })()}
            
            {combo.steps.map((step, idx) => {
                const move = character.moves.find(m => m.id === step.moveId);
                // Only show up to 5 steps in collapsed view
                if (!isExpanded && idx > 4) return null; 
                return (
                    <React.Fragment key={idx}>
                        <Icons.Right size={12} className="text-sf-subtext" />
                        <span className="text-sf-text font-bold text-xs">{move?.name || '???'}</span>
                    </React.Fragment>
                );
            })}
            {!isExpanded && combo.steps.length > 5 && <span className="text-xs text-sf-subtext ml-1">...</span>}
        </div>

        {isExpanded && (
             <div className="mt-4 pt-4 border-t border-sf-border animate-in fade-in duration-200 cursor-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-wrap gap-2 mb-4">
                     {combo.tags.map(tag => (
                         <span key={tag} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">#{tag}</span>
                     ))}
                </div>

                <div className="mb-4">
                    <h4 className="text-xs font-bold text-sf-subtext mb-2">コンボレシピ詳細</h4>
                    <ul className="space-y-1">
                        {(() => {
                             const starter = character.moves.find(m => m.id === combo.starterId);
                             return (
                                <li className="text-sm text-sf-text flex items-center gap-2">
                                    <span className="w-16 font-mono text-sf-accent font-bold">{starter?.command}</span>
                                    <span>{starter?.name}</span>
                                    <span className="text-xs text-sf-subtext bg-sf-input px-1 rounded">始動</span>
                                </li>
                             )
                        })()}
                         {combo.steps.map((step, idx) => {
                            const move = character.moves.find(m => m.id === step.moveId);
                            return (
                                <li key={idx} className="text-sm text-sf-text flex items-center gap-2">
                                    <Icons.Down size={12} className="text-sf-subtext ml-2" />
                                    <span className="w-16 font-mono text-sf-text font-bold">{move?.command}</span>
                                    <span>{move?.name}</span>
                                </li>
                            );
                         })}
                    </ul>
                </div>

                {combo.notes && (
                    <div className="text-sm text-sf-text bg-sf-input p-3 rounded mb-4">
                        <span className="block text-xs font-bold text-sf-subtext mb-1">備考</span>
                        {combo.notes}
                    </div>
                )}

                {/* Suggested Oki - ONLY if tag "Down" exists */}
                {hasDownTag && (
                    <div className="bg-green-50 rounded p-3 border border-green-100">
                        <p className="text-xs text-green-700 font-bold mb-2 flex items-center gap-1">
                            <Icons.Status size={12} /> 起き攻めサジェスト ({combo.endSituationAdvantage}F 有利)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.length > 0 ? suggestions.map(oki => (
                                <span key={oki.id} className="text-xs bg-white text-green-600 border border-green-200 px-2 py-1 rounded shadow-sm">
                                    {oki.name}
                                </span>
                            )) : (
                                <span className="text-xs text-green-600/70">この状況に一致する登録済みのセットプレイはありません</span>
                            )}
                        </div>
                    </div>
                )}
             </div>
        )}
    </div>
  );
};