import React, { useState } from 'react';
import { Icons } from './Icons';

interface TagManagerProps {
  tags: string[];
  onUpdateTags: (tags: string[]) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ tags, onUpdateTags }) => {
  const [newTag, setNewTag] = useState('');

  const handleAdd = () => {
    if (newTag && !tags.includes(newTag)) {
      onUpdateTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleDelete = (tagToDelete: string) => {
    if (confirm(`タグ「${tagToDelete}」を削除しますか？`)) {
      onUpdateTags(tags.filter(t => t !== tagToDelete));
    }
  };

  return (
    <div className="bg-sf-card border border-sf-border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold text-sf-text mb-4 flex items-center gap-2">
        <Icons.Tag className="text-sf-accent" /> タグ管理
      </h2>
      <p className="text-sm text-sf-subtext mb-6">
        キャラクター固有のタグを管理します。ここで登録したタグは各作成画面で選択できるようになります。
      </p>

      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          className="flex-1 bg-sf-input border border-sf-border rounded p-2 text-sf-text outline-none focus:border-sf-accent"
          placeholder="新しいタグ名 (例: セットプレイ)"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button 
          onClick={handleAdd}
          className="bg-sf-accent text-white px-4 py-2 rounded font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2"
        >
          <Icons.Add size={18} /> 追加
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {tags.map(tag => (
          <div key={tag} className="flex items-center gap-2 bg-sf-input border border-sf-border px-3 py-1.5 rounded-full group hover:border-sf-accent transition-colors">
            <span className="text-sf-text font-bold text-sm">#{tag}</span>
            <button 
              onClick={() => handleDelete(tag)}
              className="text-sf-subtext hover:text-sf-danger p-0.5 rounded-full transition-colors"
            >
              <Icons.Close size={14} />
            </button>
          </div>
        ))}
        {tags.length === 0 && (
          <div className="text-sf-subtext text-sm italic py-2">タグが登録されていません。</div>
        )}
      </div>
    </div>
  );
};