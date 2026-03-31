'use client';

import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ tags, onChange, placeholder = 'Add...' }: TagInputProps) {
  const [input, setInput] = useState('');

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      const value = input.trim();
      if (!tags.includes(value)) {
        onChange([...tags, value]);
      }
      setInput('');
    }
    if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="tag-wrap">
      {tags.map(tag => (
        <div key={tag} className="tag">
          {tag}
          <button
            className="tag-remove"
            onClick={() => onChange(tags.filter(t => t !== tag))}
            type="button"
          >
            &times;
          </button>
        </div>
      ))}
      <input
        className="tag-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
}
