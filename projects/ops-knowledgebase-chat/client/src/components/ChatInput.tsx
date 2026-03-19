import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { FileAutocomplete } from './FileAutocomplete';

interface ChatInputProps {
  onSend: (message: string) => void;
  onUpload: (files: FileList) => void;
  onInterrupt: () => void;
  isStreaming: boolean;
  disabled: boolean;
  filesList: string[];
}

export function ChatInput({ onSend, onUpload, onInterrupt, isStreaming, disabled, filesList }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
    setShowAutocomplete(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (showAutocomplete && ['ArrowDown', 'ArrowUp', 'Enter', 'Tab'].includes(e.key)) {
        return; // Let FileAutocomplete handle these
      }
      if (showAutocomplete && e.key === 'Escape') {
        e.preventDefault();
        setShowAutocomplete(false);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onInterrupt();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }
    },
    [handleSend, onInterrupt, showAutocomplete],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onUpload(e.target.files);
        e.target.value = '';
      }
    },
    [onUpload],
  );

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';

    // Check for @ autocomplete trigger
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1 && (atIndex === 0 || textBeforeCursor[atIndex - 1] === ' ')) {
      setShowAutocomplete(true);
      setAutocompleteQuery(textBeforeCursor.slice(atIndex + 1));
    } else {
      setShowAutocomplete(false);
    }
  }, []);

  const handleAutocompleteSelect = useCallback((filePath: string) => {
    const cursorPos = textareaRef.current?.selectionStart || input.length;
    const textBeforeCursor = input.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    if (atIndex === -1) return;

    const before = input.slice(0, atIndex);
    const after = input.slice(cursorPos);
    setInput(`${before}@${filePath}${after}`);
    setShowAutocomplete(false);
  }, [input]);

  const isSlash = input.startsWith('/');

  return (
    <div className="border-t border-default bg-surface-1 px-5 py-3">
      <div className="chat-input-inner relative">
        {showAutocomplete && (
          <FileAutocomplete
            query={autocompleteQuery}
            files={filesList}
            onSelect={handleAutocompleteSelect}
            onDismiss={() => setShowAutocomplete(false)}
          />
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-icon"
          title="Upload files (Ctrl+U)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Ctrl+Enter to send)"
          disabled={disabled}
          rows={1}
          className={`chat-input ${isSlash ? 'chat-input--slash' : ''}`}
        />
        {isStreaming ? (
          <button
            onClick={onInterrupt}
            className="btn-icon text-accent-red hover:text-accent-red-hover"
            title="Stop (Esc)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="btn-primary disabled:opacity-30"
            title="Send (Ctrl+Enter)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </div>
      <div className="chat-input-hint">
        ctrl+enter send · ctrl+u upload · esc stop
      </div>
    </div>
  );
}
