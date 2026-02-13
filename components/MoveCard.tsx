import React, { useState } from 'react';
import { Move, MoveType, Okizeme } from '../types';
import { Icons } from './Icons';
import { getStrategyAdvice } from '../services/geminiService';

interface MoveCardProps {
  move: Move;
  index: number;
  characterName: string;
  okizemeList: Okizeme[];
  onEdit: (move: Move) => void;
  onDelete: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  initiallyEditing?: boolean;
  masterTags?: string[];
}

export const MoveCard: React.FC<MoveCardProps> = ({ 
  move, 
  index,
  characterName, 
  okizemeList,
  onEdit, 
  onDelete, 
  onDragStart,
  onDragEnter,
  onDragEnd,
  initiallyEditing = false, 
  masterTags = [] 
}) => {
  const [isEditing, setIsEditing] = useState(initiallyEditing);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [expanded, setExpanded] = useState(initiallyEditing);
  const [isDragging, setIsDragging] = useState(false);

  // Edit State
  const [editData, setEditData] = useState<Move>(move);

  // Oki Suggestions
  const hasDownTag = move.tags.includes('ダウン') || move.tags.includes('Down');
  const advantage = typeof move.frames.onHit === 'number' ? move.frames.onHit : parseInt(move.frames.onHit as string);
  const suggestions = !isNaN(advantage) && hasDownTag 
    ? okizemeList.filter(o => advantage >= o.minAdvantage && advantage <= o.maxAdvantage)
    : [];

  const handleGetAdvice = async () => {
    if (advice) return;
    setLoadingAdvice(true);
    const text = await getStrategyAdvice('move', move, characterName);
    setAdvice(text);
    setLoadingAdvice(false);
  };

  const handleSave = () => {
    onEdit(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(move);
    setIsEditing(false);
    if (initiallyEditing && !move.name) {
      onDelete(move.id); // Cancel creation
    }
  };

  const toggleTag = (tag: string) => {
    if (editData.tags.includes(tag)) {
        setEditData({...editData, tags: editData.tags.filter(t => t !== tag)});
    } else {
        setEditData({...editData, tags: [...editData.tags, tag]});
    }
  };

  const getFrameColor = (val: number | string) => {
    if (typeof val === 'string') return 'text-sf-subtext';
    if (val > 0) return 'text-sf-success';
    if (val < -4) return 'text-sf-danger';
    if (val < 0) return 'text-sf-warning';
    return 'text-sf-subtext';
  };

  const moveTypeOptions: {value: MoveType, label: string}[] = [
    { value: 'normal', label: '通常技' },
    { value: 'special', label: '必殺技' },
    { value: 'super', label: 'SA' },
    { value: 'throw', label: '投げ' },
    { value: 'common', label: '共通' },
  ];

  if (isEditing) {
    return (
      <div className="bg-sf-card border border-sf-accent rounded-lg p-4 mb-3 shadow-md">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-sf-input border border-sf-border rounded p-2 text-sf-text"
              placeholder="技名"
              value={editData.name}
              onChange={e => setEditData({...editData, name: e.target.value})}
            />
            <input 
              className="w-24 bg-sf-input border border-sf-border rounded p-2 text-sf-text font-mono"
              placeholder="コマンド"
              value={editData.command}
              onChange={e => setEditData({...editData, command: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
             <select 
               className="bg-sf-input border border-sf-border rounded p-2 text-sf-text"
               value={editData.type}
               onChange={e => setEditData({...editData, type: e.target.value as MoveType})}
             >
               {moveTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
             </select>
             <input 
               type="number"
               className="w-24 bg-sf-input border border-sf-border rounded p-2 text-sf-text"
               placeholder="ダメージ"
               value={editData.damage}
               onChange={e => setEditData({...editData, damage: Number(e.target.value)})}
             />
          </div>
          
          <div className="grid grid-cols-4 gap-2">
             {['startup', 'active', 'onHit', 'onBlock'].map((key) => (
                <div key={key}>
                  <label className="text-xs text-sf-subtext block capitalize">{key === 'onHit' ? 'Hit' : key === 'onBlock' ? 'Block' : key}</label>
                  <input 
                    className="w-full bg-sf-input border border-sf-border rounded p-1 text-center text-sm font-mono text-sf-text"
                    value={editData.frames[key as keyof typeof editData.frames]}
                    onChange={e => setEditData({
                      ...editData, 
                      frames: {
                        ...editData.frames, 
                        [key]: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)
                      }
                    })}
                  />
                </div>
             ))}
          </div>

          <div>
             <label className="text-xs text-sf-subtext block mb-1">タグ選択</label>
             <div className="flex flex-wrap gap-2">
                {masterTags.map(tag => (
                    <button 
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                            editData.tags.includes(tag) 
                            ? 'bg-sf-accent text-white border-sf-accent' 
                            : 'bg-sf-input text-sf-subtext border-sf-border hover:border-sf-accent'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
                {masterTags.length === 0 && <span className="text-xs text-sf-subtext">タグ管理メニューでタグを追加してください</span>}
             </div>
          </div>

          <div>
             <label className="text-xs text-sf-subtext block">備考</label>
             <textarea 
               className="w-full bg-sf-input border border-sf-border rounded p-2 text-sf-text text-sm"
               rows={2}
               value={editData.notes}
               onChange={e => setEditData({...editData, notes: e.target.value})}
             />
          </div>

          <div className="flex justify-end gap-2 pt-2">
             <button onClick={handleCancel} className="px-3 py-1 text-sm bg-gray-200 rounded text-gray-700 hover:bg-gray-300">キャンセル</button>
             <button onClick={handleSave} className="px-3 py-1 text-sm bg-sf-success rounded text-white font-bold hover:bg-green-600">保存</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
        className={`bg-sf-card border border-sf-border rounded-lg p-4 mb-3 shadow-sm hover:border-sf-accent transition-all duration-200 relative group ${isDragging ? 'opacity-50 border-dashed border-sf-accent' : ''}`}
        draggable
        onDragStart={(e) => {
            setIsDragging(true);
            onDragStart(index);
            // Firefox requires dataTransfer to be set
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', index.toString());
        }}
        onDragEnter={() => onDragEnter(index)}
        onDragEnd={() => {
            setIsDragging(false);
            onDragEnd();
        }}
        onDragOver={(e) => e.preventDefault()}
    >
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
            className="p-1.5 bg-sf-input rounded hover:bg-sf-accent hover:text-white text-sf-subtext transition-colors"
        >
          <Icons.Edit size={14} />
        </button>
        <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); if(confirm('削除しますか？')) onDelete(move.id); }} 
            className="p-1.5 bg-sf-input rounded hover:bg-sf-danger hover:text-white text-sf-subtext transition-colors"
        >
          <Icons.Delete size={14} />
        </button>
      </div>

      <div className="flex items-start" onClick={() => setExpanded(!expanded)}>
        {/* Drag Handle */}
        <div 
            className="mr-3 mt-1 text-sf-border group-hover:text-sf-subtext cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
                // Allow drag start from handle
            }}
        >
            <Icons.Drag size={20} />
        </div>

        <div className="flex-1 cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-bold rounded text-white ${
              move.type === 'normal' ? 'bg-slate-500' : 
              move.type === 'special' ? 'bg-indigo-500' : 'bg-amber-500'
            }`}>
              {moveTypeOptions.find(o => o.value === move.type)?.label || move.type}
            </span>
            <h3 className="text-lg font-bold text-sf-text">{move.name}</h3>
            <span className="text-sm font-mono text-sf-accent bg-sf-input px-2 py-0.5 rounded border border-sf-border">{move.command}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-2">
             {!expanded && move.tags.map(tag => (
                 <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-200">#{tag}</span>
             ))}
          </div>

          <div className="grid grid-cols-4 gap-2 mt-2 text-center text-sm">
            <div className="bg-sf-input rounded p-1 border border-sf-border">
              <span className="block text-xs text-sf-subtext">発生</span>
              <span className="font-mono font-bold text-sf-text">{move.frames.startup}</span>
            </div>
            <div className="bg-sf-input rounded p-1 border border-sf-border">
              <span className="block text-xs text-sf-subtext">持続</span>
              <span className="font-mono font-bold text-sf-text">{move.frames.active}</span>
            </div>
            <div className="bg-sf-input rounded p-1 border border-sf-border">
              <span className="block text-xs text-sf-subtext">Hit</span>
              <span className={`font-mono font-bold ${getFrameColor(move.frames.onHit)}`}>{move.frames.onHit}</span>
            </div>
            <div className="bg-sf-input rounded p-1 border border-sf-border">
              <span className="block text-xs text-sf-subtext">Guard</span>
              <span className={`font-mono font-bold ${getFrameColor(move.frames.onBlock)}`}>{move.frames.onBlock}</span>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-sf-border space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-wrap gap-2">
            {move.tags.map(tag => (
              <span key={tag} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">#{tag}</span>
            ))}
          </div>
          
          <div className="text-sm text-sf-text bg-sf-input p-2 rounded border-l-4 border-sf-accent">
            <span className="font-bold block text-xs text-sf-subtext mb-1">備考</span>
            <span className="whitespace-pre-wrap">{move.notes || "備考なし"}</span>
          </div>

          {/* Oki Suggestions for Normal Moves */}
          {suggestions.length > 0 && (
             <div className="bg-green-50 rounded p-3 border border-green-100">
                 <p className="text-xs text-green-700 font-bold mb-2 flex items-center gap-1">
                     <Icons.Status size={12} /> 起き攻めサジェスト (Hit: {advantage}F)
                 </p>
                 <div className="flex flex-wrap gap-2">
                     {suggestions.map(oki => (
                         <span key={oki.id} className="text-xs bg-white text-green-600 border border-green-200 px-2 py-1 rounded shadow-sm">
                             {oki.name}
                         </span>
                     ))}
                 </div>
             </div>
          )}

          <div className="bg-fuchsia-50 rounded p-3 border border-fuchsia-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold text-fuchsia-600 flex items-center gap-1">
                <Icons.AI size={14} /> AI アドバイス
              </h4>
              <button 
                onClick={(e) => { e.stopPropagation(); handleGetAdvice(); }}
                disabled={loadingAdvice}
                className="text-xs bg-white border border-fuchsia-200 hover:bg-fuchsia-100 text-fuchsia-700 px-2 py-1 rounded transition-colors shadow-sm"
              >
                {loadingAdvice ? '思考中...' : advice ? '更新' : 'Geminiに聞く'}
              </button>
            </div>
            {advice ? (
              <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {advice}
              </div>
            ) : (
              <p className="text-xs text-fuchsia-400 italic">この技の効果的な使い方をAIに聞くことができます。</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};