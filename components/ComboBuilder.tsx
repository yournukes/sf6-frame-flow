import React, { useState, useEffect } from 'react';
import { Combo, Move, CharacterData, Okizeme } from '../types';
import { Icons } from './Icons';
import { getStrategyAdvice } from '../services/geminiService';

interface ComboBuilderProps {
  character: CharacterData;
  initialCombo?: Combo;
  onSave: (combo: Combo) => void;
  onCancel: () => void;
}

export const ComboBuilder: React.FC<ComboBuilderProps> = ({ character, initialCombo, onSave, onCancel }) => {
  const [comboName, setComboName] = useState(initialCombo?.name || '');
  const [starterId, setStarterId] = useState<string>(initialCombo?.starterId || '');
  const [steps, setSteps] = useState<string[]>(initialCombo?.steps.map(s => s.moveId) || []);
  const [endAdvantage, setEndAdvantage] = useState<number>(initialCombo?.endSituationAdvantage || 0);
  const [meterCost, setMeterCost] = useState<number>(initialCombo?.meterCost || 0);
  const [totalDamage, setTotalDamage] = useState<number>(initialCombo?.totalDamage || 0);
  const [notes, setNotes] = useState(initialCombo?.notes || '');
  const [tags, setTags] = useState<string[]>(initialCombo?.tags || []);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const availableMoves = character.moves;

  const handleAddStep = (moveId: string) => {
    setSteps([...steps, moveId]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
        setTags(tags.filter(t => t !== tag));
    } else {
        setTags([...tags, tag]);
    }
  };

  const hasDownTag = tags.includes('ダウン') || tags.includes('Down');

  const getMatchingOki = (): Okizeme[] => {
    return character.okizeme.filter(oki => 
      endAdvantage >= oki.minAdvantage && endAdvantage <= oki.maxAdvantage
    );
  };

  const handleSave = () => {
    if (!comboName || !starterId) return;
    
    const newCombo: Combo = {
      id: initialCombo?.id || Date.now().toString(),
      name: comboName,
      starterId,
      steps: steps.map(id => ({ moveId: id })),
      totalDamage: totalDamage,
      meterCost,
      endSituationAdvantage: endAdvantage,
      tags: tags,
      notes
    };
    onSave(newCombo);
  };

  const starterMove = availableMoves.find(m => m.id === starterId);

  return (
    <div className="space-y-6">
      <div className="bg-sf-card p-6 rounded-lg border border-sf-border shadow-md">
        <h2 className="text-xl font-bold text-sf-text mb-4 flex items-center gap-2 border-b border-sf-border pb-2">
          <Icons.Combo className="text-sf-accent" /> {initialCombo ? 'コンボ編集' : '新規コンボ作成'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-sf-subtext mb-1">コンボ名</label>
            <input 
              type="text" 
              className="w-full bg-sf-input border border-sf-border rounded p-2 text-sf-text focus:border-sf-accent outline-none"
              value={comboName}
              onChange={(e) => setComboName(e.target.value)}
              placeholder="例: 中央基本コンボ"
            />
          </div>
          <div>
            <label className="block text-sm text-sf-subtext mb-1">始動技</label>
            <select 
              className="w-full bg-sf-input border border-sf-border rounded p-2 text-sf-text outline-none"
              value={starterId}
              onChange={(e) => setStarterId(e.target.value)}
            >
              <option value="">選択してください...</option>
              {availableMoves.map(m => (
                <option key={m.id} value={m.id}>[{m.command}] {m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual Flow */}
        <div className="bg-sf-base p-4 rounded-lg min-h-[100px] border border-sf-border mb-4 flex flex-wrap items-center gap-2">
          {starterId ? (
            <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded border border-indigo-200 flex items-center gap-2 shadow-sm">
               <span className="font-mono text-sm font-bold">{starterMove?.command}</span>
               <span>{starterMove?.name}</span>
            </div>
          ) : (
            <span className="text-sf-subtext italic">始動技を選択してください...</span>
          )}

          {steps.map((stepId, idx) => {
            const move = availableMoves.find(m => m.id === stepId);
            return (
              <React.Fragment key={idx}>
                <Icons.Right size={16} className="text-sf-subtext" />
                <div className="group relative bg-white text-sf-text px-3 py-1 rounded border border-sf-border hover:border-sf-danger cursor-pointer flex items-center gap-2 shadow-sm">
                  <span className="font-mono text-sm font-bold text-sf-accent">{move?.command}</span>
                  <span>{move?.name}</span>
                  <button 
                    onClick={() => handleRemoveStep(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-white shadow-sm"
                  >
                    <Icons.Delete size={10} />
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="mb-4">
          <label className="block text-sm text-sf-subtext mb-1">次の技を追加</label>
          <select 
            className="w-full bg-sf-input border border-sf-border rounded p-2 text-sf-text outline-none"
            onChange={(e) => {
              if(e.target.value) {
                 handleAddStep(e.target.value);
                 e.target.value = "";
              }
            }}
          >
             <option value="">+ 技を追加...</option>
             {availableMoves.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.command})</option>
              ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-sf-input p-3 rounded border border-sf-border">
            <label className="block text-xs text-sf-subtext uppercase">総ダメージ (手動入力)</label>
            <div className="flex items-center gap-2 text-sf-warning">
               <Icons.Attack size={18} /> 
               <input 
                 type="number" 
                 className="bg-transparent text-xl font-mono font-bold w-full outline-none text-sf-warning"
                 value={totalDamage}
                 onChange={(e) => setTotalDamage(Number(e.target.value))}
                 placeholder="0"
               />
            </div>
          </div>
          <div className="bg-sf-input p-3 rounded border border-sf-border">
             <label className="block text-xs text-sf-subtext uppercase">使用ゲージ (本)</label>
             <input 
               type="number" 
               className="bg-transparent text-xl font-mono text-blue-500 font-bold w-full outline-none"
               value={meterCost}
               onChange={(e) => setMeterCost(Number(e.target.value))}
               min={0}
               max={6}
             />
          </div>
          <div className="bg-sf-input p-3 rounded border border-sf-border">
             <label className="block text-xs text-sf-subtext uppercase">終了後状況 (+/- F)</label>
             <input 
               type="number" 
               className={`bg-transparent text-xl font-mono font-bold w-full outline-none ${endAdvantage > 0 ? 'text-green-500' : 'text-red-500'}`}
               value={endAdvantage}
               onChange={(e) => setEndAdvantage(Number(e.target.value))}
             />
          </div>
        </div>

        <div className="mb-4">
             <label className="text-sm text-sf-subtext block mb-2">タグ設定 (「ダウン」を設定すると起き攻めがサジェストされます)</label>
             <div className="flex flex-wrap gap-2">
                {character.masterTags.map(tag => (
                    <button 
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                            tags.includes(tag) 
                            ? 'bg-sf-accent text-white border-sf-accent' 
                            : 'bg-sf-input text-sf-subtext border-sf-border hover:border-sf-accent'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
                {character.masterTags.length === 0 && <span className="text-xs text-sf-subtext">タグ管理メニューでタグを追加してください</span>}
             </div>
        </div>

        <div>
            <label className="block text-sm text-sf-subtext mb-1">備考</label>
            <textarea 
               className="w-full bg-sf-input border border-sf-border rounded p-2 text-sf-text text-sm"
               rows={2}
               value={notes}
               onChange={e => setNotes(e.target.value)}
            />
        </div>
        
        {/* Oki Suggestions */}
        {hasDownTag && endAdvantage > 0 && (
            <div className="mb-4 bg-green-50 p-3 rounded border border-green-200 mt-4">
                <h3 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                    <Icons.Status size={14} /> 起き攻めチャンス ({endAdvantage}F)
                </h3>
                <div className="flex flex-wrap gap-2">
                    {getMatchingOki().length > 0 ? getMatchingOki().map(oki => (
                        <div key={oki.id} className="text-xs bg-white text-green-600 border border-green-200 px-2 py-1 rounded shadow-sm">
                            {oki.name} ({oki.minAdvantage}-{oki.maxAdvantage}F)
                        </div>
                    )) : (
                        <span className="text-xs text-green-600/70">このフレームで使える登録済みのセットプレイはありません。</span>
                    )}
                </div>
            </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-sf-border">
            <button 
                onClick={async () => {
                    const tempCombo: Combo = {
                        id: 'temp', name: comboName || 'Combo', starterId, steps: steps.map(id => ({moveId: id})), 
                        totalDamage: totalDamage, meterCost, endSituationAdvantage: endAdvantage, tags: tags, notes
                    };
                    const advice = await getStrategyAdvice('combo', tempCombo, character.name);
                    setAiAdvice(advice);
                }}
                className="px-4 py-2 bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200 rounded text-sm font-bold flex items-center gap-2 transition-colors border border-fuchsia-200"
            >
                <Icons.AI size={16} /> AI分析
            </button>

            <div className="flex gap-2">
                <button 
                    onClick={onCancel}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 font-bold"
                >
                    キャンセル
                </button>
                <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-sf-accent hover:bg-indigo-600 rounded text-white font-bold flex items-center gap-2 shadow-sm"
                >
                    <Icons.Save size={18} /> コンボ保存
                </button>
            </div>
        </div>
        
        {aiAdvice && (
            <div className="mt-4 p-4 bg-fuchsia-50 border border-fuchsia-200 rounded text-sm text-slate-700 whitespace-pre-line">
                <h4 className="font-bold text-fuchsia-600 mb-2">分析結果</h4>
                {aiAdvice}
            </div>
        )}
      </div>
    </div>
  );
};