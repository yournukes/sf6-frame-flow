import React, { useState, useEffect } from 'react';
import { INITIAL_DATA } from './constants';
import { AppState, CharacterData, Move, Combo, Situation, Okizeme } from './types';
import { MoveCard } from './components/MoveCard';
import { ComboBuilder } from './components/ComboBuilder';
import { ComboCard } from './components/ComboCard';
import { OkizemeCard } from './components/OkizemeCard';
import { TagManager } from './components/TagManager';
import { Icons } from './components/Icons';

function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('sf6-flow-app-v3'); // Increment version
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration support for masterTags if missing
        parsed.characters.forEach((c: any) => {
            if (!c.masterTags) c.masterTags = [];
        });
        return parsed;
      } catch (e) {
        return { characters: INITIAL_DATA, activeCharacterId: INITIAL_DATA[0].id };
      }
    }
    return { characters: INITIAL_DATA, activeCharacterId: INITIAL_DATA[0].id };
  });

  const [activeTab, setActiveTab] = useState<'moves' | 'combos' | 'oki' | 'tags'>('moves');
  const [showComboBuilder, setShowComboBuilder] = useState(false);
  const [editingComboId, setEditingComboId] = useState<string | null>(null);

  // Drag and Drop State
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('sf6-flow-app-v3', JSON.stringify(state));
  }, [state]);

  const activeChar = state.characters.find(c => c.id === state.activeCharacterId) || state.characters[0];

  const updateCharacter = (updater: (char: CharacterData) => CharacterData) => {
    setState(prev => ({
      ...prev,
      characters: prev.characters.map(c => c.id === activeChar.id ? updater(c) : c)
    }));
  };

  // --- CRUD Handlers ---

  // Character
  const handleAddCharacter = () => {
    const name = prompt("追加するキャラクター名を入力してください:");
    if (name) {
        const newChar: CharacterData = {
            id: Date.now().toString(),
            name,
            masterTags: ['ダウン', '有利', '暴れ'], // Defaults
            moves: [],
            combos: [],
            situations: [],
            okizeme: []
        };
        setState(prev => ({
            ...prev,
            characters: [...prev.characters, newChar],
            activeCharacterId: newChar.id
        }));
    }
  };

  const handleDeleteCharacter = () => {
    if (state.characters.length <= 1) {
        alert("最後のキャラクターは削除できません。");
        return;
    }
    if (confirm(`${activeChar.name}を削除しますか？この操作は元に戻せません。`)) {
        const newChars = state.characters.filter(c => c.id !== activeChar.id);
        setState({
            characters: newChars,
            activeCharacterId: newChars[0].id
        });
    }
  };

  // Tags
  const handleUpdateTags = (newTags: string[]) => {
    updateCharacter(char => ({ ...char, masterTags: newTags }));
  };

  // Moves
  const handleAddMove = () => {
    const newMove: Move = {
      id: Date.now().toString(),
      name: '',
      command: '',
      type: 'normal',
      damage: 0,
      frames: { startup: 0, active: 0, onHit: 0, onBlock: 0 },
      tags: [],
      notes: ''
    };
    updateCharacter(char => ({ ...char, moves: [newMove, ...char.moves] }));
  };

  const handleEditMove = (updatedMove: Move) => {
    updateCharacter(char => ({
      ...char,
      moves: char.moves.map(m => m.id === updatedMove.id ? updatedMove : m)
    }));
  };

  const handleDeleteMove = (id: string) => {
    updateCharacter(char => ({ ...char, moves: char.moves.filter(m => m.id !== id) }));
  };

  // DnD Handlers
  const handleMoveDragStart = (index: number) => {
    setDragItem(index);
  };

  const handleMoveDragEnter = (index: number) => {
    setDragOverItem(index);
  };

  const handleMoveDragEnd = () => {
    if (dragItem === null || dragOverItem === null || dragItem === dragOverItem) {
        setDragItem(null);
        setDragOverItem(null);
        return;
    }

    const newMoves = [...activeChar.moves];
    const draggedMoveContent = newMoves[dragItem];
    newMoves.splice(dragItem, 1);
    newMoves.splice(dragOverItem, 0, draggedMoveContent);

    updateCharacter(char => ({ ...char, moves: newMoves }));
    setDragItem(null);
    setDragOverItem(null);
  };

  // Combos
  const handleSaveCombo = (combo: Combo) => {
    updateCharacter(char => {
      const exists = char.combos.find(c => c.id === combo.id);
      if (exists) {
        return { ...char, combos: char.combos.map(c => c.id === combo.id ? combo : c) };
      }
      return { ...char, combos: [...char.combos, combo] };
    });
    setShowComboBuilder(false);
    setEditingComboId(null);
  };

  const handleDeleteCombo = (id: string) => {
    updateCharacter(char => ({ ...char, combos: char.combos.filter(c => c.id !== id) }));
  };

  const handleToggleFavoriteCombo = (id: string) => {
    updateCharacter(char => ({
        ...char,
        combos: char.combos.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c)
    }));
  };

  // Okizeme
  const handleAddOkizeme = () => {
      const newOki: Okizeme = {
          id: Date.now().toString(),
          name: '',
          type: 'okizeme',
          minAdvantage: 0,
          maxAdvantage: 0,
          description: '',
          afterAdvantage: 0,
          tags: []
      };
      updateCharacter(char => ({ ...char, okizeme: [newOki, ...char.okizeme] }));
  };

  const handleEditOkizeme = (updated: Okizeme) => {
      updateCharacter(char => ({
          ...char,
          okizeme: char.okizeme.map(o => o.id === updated.id ? updated : o)
      }));
  };

  const handleDeleteOkizeme = (id: string) => {
      updateCharacter(char => ({ ...char, okizeme: char.okizeme.filter(o => o.id !== id) }));
  };


  const renderContent = () => {
    if (activeTab === 'moves') {
      return (
        <div>
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-sf-text">マスタデータ ({activeChar.moves.length})</h2>
              <button 
                onClick={handleAddMove}
                className="bg-white text-sm px-3 py-1 rounded text-sf-accent border border-sf-border hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2 shadow-sm"
              >
                 <Icons.Add size={16} /> 技を追加
              </button>
           </div>
           {activeChar.moves.map((move, idx) => (
             <MoveCard 
                key={move.id} 
                move={move} 
                index={idx}
                characterName={activeChar.name} 
                okizemeList={activeChar.okizeme}
                onEdit={handleEditMove}
                onDelete={handleDeleteMove}
                onDragStart={handleMoveDragStart}
                onDragEnter={handleMoveDragEnter}
                onDragEnd={handleMoveDragEnd}
                initiallyEditing={!move.name}
                masterTags={activeChar.masterTags}
             />
           ))}
        </div>
      );
    }

    if (activeTab === 'combos') {
      // Sort combos: Favorites first
      const sortedCombos = [...activeChar.combos].sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return 0;
      });

      return (
        <div>
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-sf-text">コンボレシピ</h2>
              {!showComboBuilder && (
                  <button 
                    onClick={() => {
                        setEditingComboId(null);
                        setShowComboBuilder(true);
                    }}
                    className="bg-sf-accent px-4 py-2 rounded text-white font-bold flex items-center gap-2 hover:bg-indigo-600 transition-colors shadow-sm"
                  >
                     <Icons.Add size={18} /> 新規ルート作成
                  </button>
              )}
           </div>
           
           {showComboBuilder && (
             <div className="mb-8">
               <ComboBuilder 
                 character={activeChar} 
                 initialCombo={editingComboId ? activeChar.combos.find(c => c.id === editingComboId) : undefined}
                 onSave={handleSaveCombo} 
                 onCancel={() => {
                     setShowComboBuilder(false);
                     setEditingComboId(null);
                 }}
               />
             </div>
           )}

           <div className="space-y-4">
              {activeChar.combos.length === 0 && !showComboBuilder && (
                <div className="text-center py-10 text-sf-subtext">コンボが登録されていません。「新規ルート作成」から追加してください。</div>
              )}
              {!showComboBuilder && sortedCombos.map(combo => (
                <ComboCard 
                    key={combo.id}
                    combo={combo}
                    character={activeChar}
                    onEdit={(id) => {
                        setEditingComboId(id);
                        setShowComboBuilder(true);
                    }}
                    onDelete={handleDeleteCombo}
                    onToggleFavorite={handleToggleFavoriteCombo}
                />
              ))}
           </div>
        </div>
      );
    }

    if (activeTab === 'oki') {
      return (
        <div>
           <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-sf-text">起き攻め・セットプレイ</h2>
               <button 
                onClick={handleAddOkizeme}
                className="bg-white text-sm px-3 py-1 rounded text-sf-accent border border-sf-border hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2 shadow-sm"
              >
                 <Icons.Add size={16} /> 状況を追加
              </button>
           </div>
           <div className="grid gap-4">
              {activeChar.okizeme.length === 0 && (
                  <div className="text-center py-10 text-sf-subtext">起き攻めパターンが登録されていません。</div>
              )}
              {activeChar.okizeme.map(oki => (
                <OkizemeCard 
                    key={oki.id} 
                    oki={oki} 
                    characterName={activeChar.name}
                    onEdit={handleEditOkizeme}
                    onDelete={handleDeleteOkizeme}
                    initiallyEditing={!oki.name}
                    masterTags={activeChar.masterTags}
                />
              ))}
           </div>
        </div>
      );
    }

    if (activeTab === 'tags') {
        return (
            <TagManager 
                tags={activeChar.masterTags} 
                onUpdateTags={handleUpdateTags} 
            />
        );
    }
  };

  return (
    <div className="min-h-screen text-sf-text font-sans bg-sf-base">
      {/* Sidebar / Layout */}
      <div className="flex h-screen flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-sf-border flex flex-col shadow-sm z-10">
          <div className="p-6 border-b border-sf-border bg-slate-50">
            <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">
              FRAME FLOW
            </h1>
            <p className="text-xs text-slate-500 mt-1">SF6 Tech Keeper</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                 <h3 className="text-xs font-bold text-slate-400 uppercase">キャラクター</h3>
                 <button onClick={handleAddCharacter} className="text-indigo-500 hover:text-indigo-700" title="キャラ追加"><Icons.Add size={14} /></button>
              </div>
              <div className="flex gap-2">
                <select 
                    className="flex-1 bg-slate-50 text-slate-700 p-2 rounded border border-slate-200 outline-none focus:border-indigo-500 transition-colors"
                    value={state.activeCharacterId}
                    onChange={(e) => setState(prev => ({...prev, activeCharacterId: e.target.value}))}
                >
                    {state.characters.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <button 
                    onClick={handleDeleteCharacter}
                    className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
                    title="キャラ削除"
                >
                    <Icons.Delete size={16} />
                </button>
              </div>
            </div>

            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('moves')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all ${activeTab === 'moves' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <Icons.Frame size={18} /> マスタデータ
              </button>
              <button 
                onClick={() => setActiveTab('combos')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all ${activeTab === 'combos' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <Icons.Combo size={18} /> コンボレシピ
              </button>
              <button 
                onClick={() => setActiveTab('oki')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all ${activeTab === 'oki' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <Icons.Status size={18} /> 起き攻め管理
              </button>
              <button 
                onClick={() => setActiveTab('tags')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all ${activeTab === 'tags' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <Icons.Tag size={18} /> タグ管理
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-sf-border text-xs text-slate-400 text-center bg-slate-50">
             v3.0.0 &bull; Light Theme
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-slate-50 overflow-y-auto relative">
           {/* Background decorative elements */}
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-40">
              <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-fuchsia-200/30 rounded-full blur-[100px]"></div>
           </div>

           <div className="relative z-10 p-6 md:p-10 max-w-5xl mx-auto">
              {renderContent()}
           </div>
        </main>
      </div>
    </div>
  );
}

export default App;