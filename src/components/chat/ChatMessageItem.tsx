import React, { useState } from 'react';
import { ChatMessage } from '../../types/chat';
import { Copy, Check, Sparkles, User, AlertCircle, RotateCcw } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format simple markdown into JSX paragraphs, bullet points and bolding
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed my-0.5">
            {formatBold(content)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line.trim())) {
        const content = line.trim().replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="ml-4 list-decimal text-xs leading-relaxed my-0.5">
            {formatBold(content)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs leading-relaxed my-0.5">
          {formatBold(line)}
        </p>
      );
    });
  };

  const formatBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`flex gap-2.5 ${
        isAssistant ? 'items-start' : 'items-start flex-row-reverse'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-2xs ${
          isAssistant
            ? 'bg-emerald-800 text-white'
            : 'bg-slate-800 text-white'
        }`}
      >
        {isAssistant ? <Sparkles className="w-3.5 h-3.5 text-emerald-200" /> : <User className="w-3.5 h-3.5" />}
      </div>

      {/* Message Bubble Container */}
      <div
        className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-2xs relative group ${
          isAssistant
            ? message.isError
              ? 'bg-rose-50 border border-rose-200 text-rose-900'
              : 'bg-white border border-slate-200/90 text-slate-800'
            : 'bg-emerald-900 text-white rounded-tr-xs'
        }`}
      >
        {message.isError && (
          <div className="flex items-center gap-1.5 font-bold text-rose-700 mb-1 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Assistant Notice</span>
          </div>
        )}

        <div className="space-y-1">
          {renderFormattedText(message.text)}
        </div>

        {/* Footer timestamp & Actions */}
        <div
          className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[10px] ${
            isAssistant
              ? message.isError
                ? 'border-rose-100 text-rose-500'
                : 'border-slate-100 text-slate-400'
              : 'border-emerald-800 text-emerald-200'
          }`}
        >
          <span className="font-mono">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          <div className="flex items-center gap-1">
            {isAssistant && !message.isError && (
              <button
                type="button"
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-slate-700 rounded cursor-pointer"
                title="Copy response"
              >
                {copied ? (
                  <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                    <Check className="w-3 h-3" />
                    <span>Copied</span>
                  </span>
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            )}

            {message.isError && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1 text-rose-700 hover:text-rose-900 font-semibold cursor-pointer underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
