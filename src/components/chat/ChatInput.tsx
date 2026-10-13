import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Ask about waste categories, preparation, or matching...',
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
      <div className="relative flex-1 bg-white rounded-xl border border-slate-300 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-all shadow-2xs">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="w-full pl-3 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent resize-none focus:outline-none max-h-32 leading-relaxed"
        />

        <div className="absolute right-2 bottom-2 text-[10px] text-slate-400 hidden sm:flex items-center gap-0.5 pointer-events-none font-mono">
          <span>Enter</span>
          <CornerDownLeft className="w-2.5 h-2.5" />
        </div>
      </div>

      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-2xs ${
          text.trim() && !disabled
            ? 'bg-emerald-800 hover:bg-emerald-900 text-white hover:scale-105'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
        title="Send message (Enter)"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};
