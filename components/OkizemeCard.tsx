import React, { useState } from 'react';
import { Okizeme, OkizemeType } from '../types';
import { Icons } from './Icons';
import { getStrategyAdvice } from '../services/geminiService';

interface OkizemeCardProps {
  oki: Okizeme;
  characterName: string;
  onEdit: (oki: Okizeme) => void;
  onDelete: (id: string) => void;
  initiallyEditing?: boolean;
  masterTags?: string[];
}

export const OkizemeCard: React.FC<OkizemeCardProps> = ({ oki, characterName, onEdit, onDelete, initiallyEditing = false, masterTags = [] }) => {
  const [isEditing, setIsEditing] = useState(initiallyEditing);
  const [isExpanded, setIsExpanded] = useState(initiallyEditing);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [editData, setEditData] = useState<Okizeme>({
      ...oki,
      type: oki.type || 'okizeme', // Default for migration
      afterAdvantage: oki.afterAdvantage || 0 // Default
  });

  const handleGetAdvice = async () => {
    if (advice) return;
    setLoadingAdvice(true);
    const adviceText = await getStrategyAdvice('situation', {
        id: oki.id,
        name: oki.name,
        description: oki.description,
        advantage: oki.minAdvantage, 
        tags: oki.tags
    }, characterName);
    setAdvice(adviceText);
    setLoadingAdvice(false);
  };

  const handleSave = () => {
    onEdit(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(oki);
    setIsEditing(false);
    if (initiallyEditing && !oki.name) {
      onDelete(oki.id);
    }
  };

  const toggleTag = (tag: string) => {
    if (editData.tags.includes(tag)) {
        setEditData({...editData, tags: editData.tags.filter(t => t !== tag)});
    } else {
        setEditData({...editData, tags: [...editData.tags, tag]});
    }
  };

  if (isEditing) {
    return (
      <div className="bg-sf-card border border-sf-accent rounded-lg p-4 shadow-md">
        <div className="space-y-4">
          <input 
            className="w-full bg-sf-input border border-sf-border rounded p-2 text-sf-text font-bold"
            placeholder="状況名 (例: 詐欺飛びルート)"
            value={editData.name}
            onChange={e => setEditData({...editData, name: e.target.value})}
          />
          
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[140px]">
                <label className="text-xs text-sf-subtext block mb-1">種類</label>
                <select 
                    className="w-full bg-sf-input border border-sf-border rounded p-2 text-sf-text"
                    value={editData.type}
                    onChange={e => setEditData({...editData, type: e.target.value as OkizemeType})}
                >
                    <option value="okizeme">起き攻め</option>
                    <option value="frame-kill">フレーム消費</option>
                </select>
            </div>

            <div>
                 <label className="text-xs text-sf-subtext block mb-1">始動有利F</label>
                 <div className="flex items-center gap-2">
                    <input 
                    type="number"
                    className="w-16 bg-sf-input border border-sf-border rounded p-2 text-center text-sf-text"
                    value={editData.minAdvantage}
                    onChange={e => setEditData({...editData, minAdvantage: Number(e.target.value)})}
                    />
                    <span className="text-sf-subtext">~</span>
                    <input 
                    type="number"
                    className="w-16 bg-sf-input border border-sf-border rounded p-2 text-center text-sf-text"
                    value={editData.maxAdvantage}
                    onChange={e => setEditData({...editData, maxAdvantage: Number(e.target.value)})}
                    />
                 </div>
            </div>

            <div>
                <label className="text-xs text-sf-subtext block mb-1">行動後有利F</label>
                <input 
                   type="number"
                   className="w-20 bg-sf-input border border-sf-border rounded p-2 text-center text-sf-text font-bold"
                   value={editData.afterAdvantage}
                   onChange={e => setEditData({...editData, afterAdvantage: Number(e.target.value)})}
                />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-sf-subtext block mb-1">説明・レシピ</label>
            <textarea 
               className="w-full bg-sf-input border border-sf-border rounded p-2 text-sf-text text-sm"
               rows={2}
               value={editData.description}
               onChange={e => setEditData({...editData, description: e.target.value})}
            />
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
             </div>
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
        className="bg-sf-card border border-sf-border rounded-lg shadow-sm hover:border-sf-accent transition-all duration-200 overflow-hidden cursor-pointer relative group"
        onClick={() => setIsExpanded(!isExpanded)}
    >
        <div className="p-4 relative">
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
                    className="p-1.5 bg-sf-input rounded hover:bg-sf-accent hover:text-white text-sf-subtext"
                >
                    <Icons.Edit size={14} />
                </button>
                <button 
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); if(confirm('削除しますか？')) onDelete(oki.id); }} 
                    className="p-1.5 bg-sf-input rounded hover:bg-sf-danger hover:text-white text-sf-subtext"
                >
                    <Icons.Delete size={14} />
                </button>
            </div>

            <div className="flex items-center justify-between mb-2 pr-16">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        {oki.type === 'frame-kill' && <Icons.Frame size={16} className="text-sf-subtext" />}
                        {oki.type === 'okizeme' && <Icons.Type size={16} className="text-sf-accent" />}
                        <h3 className="font-bold text-lg text-sf-text">{oki.name}</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono border border-indigo-100 font-bold">
                            始動: {oki.minAdvantage}F ~ {oki.maxAdvantage}F
                        </span>
                        <Icons.Right size={12} className="text-sf-subtext" />
                        <span className={`text-xs px-2 py-0.5 rounded font-mono border font-bold ${oki.afterAdvantage > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            行動後: {oki.afterAdvantage > 0 ? '+' : ''}{oki.afterAdvantage}F
                        </span>
                    </div>
                </div>
                <div>
                   {isExpanded ? <Icons.Down size={20} className="text-sf-subtext" /> : <Icons.Right size={20} className="text-sf-subtext" />}
                </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
                {oki.tags.map((tag, i) => (
                     <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-200">#{tag}</span>
                ))}
            </div>
        </div>

        {isExpanded && (
            <div className="px-4 pb-4 animate-in fade-in duration-200 border-t border-sf-border pt-4 bg-sf-base/30">
                <div className="mb-4">
                    <p className="text-sf-text text-sm whitespace-pre-wrap leading-relaxed">{oki.description}</p>
                </div>

                <div className="bg-fuchsia-50 rounded p-3 mt-2 border border-fuchsia-100">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="text-xs font-bold text-fuchsia-600 flex items-center gap-1">
                            <Icons.AI size={14} /> AI アドバイス
                        </h4>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleGetAdvice(); }}
                            disabled={loadingAdvice}
                            className="text-xs text-fuchsia-500 hover:text-fuchsia-700 underline decoration-dotted"
                        >
                            {loadingAdvice ? '思考中...' : advice ? '再生成' : 'アイデアを聞く'}
                        </button>
                    </div>
                    {advice && <p className="text-xs text-slate-700 whitespace-pre-line mt-2">{advice}</p>}
                </div>
            </div>
        )}
    </div>
  );
};