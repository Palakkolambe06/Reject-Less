import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatContext } from '../../types/chat';
import { geminiChatService } from '../../services/ai/geminiChatService';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInput } from './ChatInput';
import {
  Sparkles,
  X,
  Maximize2,
  Trash2,
  AlertTriangle,
  Bot,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface ChatWidgetProps {
  activeContext?: ChatContext;
  onNavigate?: (path: string) => void;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  text: "Hi! I'm your RejectLess waste assistant. I can help you understand waste categories, preparation requirements, recipient matching and recovery options.",
  timestamp: new Date().toISOString(),
};

const SUGGESTED_QUESTIONS = [
  'How should I prepare cardboard for recycling?',
  'Why might a recipient reject my waste batch?',
  'What information do I need before offering a batch?',
  'Explain the current status of my batch.',
  'How do I find a suitable recipient?',
  'What is the difference between reuse and recycling?',
];

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  activeContext,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend configuration on mount
  useEffect(() => {
    geminiChatService.checkStatus().then((res) => {
      setIsConfigured(res.configured);
    });
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await geminiChatService.sendMessage(
        userText,
        messages,
        activeContext
      );

      if (response.success && response.text) {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          text: response.text,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (response.configured !== undefined) setIsConfigured(response.configured);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text:
            response.error ||
            'Unable to communicate with the Gemini AI model. Please verify your GEMINI_API_KEY.',
          timestamp: new Date().toISOString(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
        if (response.configured === false) setIsConfigured(false);
      }
    } catch (err: unknown) {
      const error = err as Error;
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `Network failure: ${error.message || 'Could not reach server'}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setShowClearConfirm(false);
  };

  return (
    <>
      {/* Floating Assistant Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full p-3.5 sm:px-4 sm:py-3 shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2 group hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Open RejectLess AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-emerald-200" />
            <span className="w-2 h-2 rounded-full bg-emerald-300 absolute -top-0.5 -right-0.5 animate-ping" />
          </div>
          <span className="font-semibold text-xs tracking-tight hidden sm:inline">
            Ask AI Assistant
          </span>
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-5 right-5 z-50 w-96 max-w-[calc(100vw-1.5rem)] h-[560px] max-h-[85vh] bg-slate-50 rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150"
          role="dialog"
          aria-label="RejectLess AI Assistant Chat Panel"
        >
          {/* Header */}
          <div className="bg-emerald-950 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                  RejectLess AI Assistant
                </h3>
                <span className="text-[10px] text-emerald-300 font-mono flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gemini 3.8 Flash Online</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-emerald-200">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('/assistant');
                  }}
                  className="p-1 hover:text-white hover:bg-emerald-900 rounded cursor-pointer transition-colors"
                  title="Expand to full page"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="p-1 hover:text-white hover:bg-emerald-900 rounded cursor-pointer transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white hover:bg-emerald-900 rounded cursor-pointer transition-colors"
                title="Minimize assistant"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Banner if active */}
          {activeContext?.materialCategory && (
            <div className="bg-emerald-50/90 border-b border-emerald-100 px-3 py-1.5 text-[10px] text-emerald-950 flex items-center justify-between shrink-0 font-mono">
              <span className="truncate">
                Context: {activeContext.materialCategory} ({activeContext.quantity}{' '}
                {activeContext.unit})
              </span>
              <span className="text-emerald-700 font-bold">
                {activeContext.status}
              </span>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onRetry={() => {
                  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                  if (lastUserMsg) handleSendMessage(lastUserMsg.text);
                }}
              />
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 w-fit shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span className="font-mono text-[11px]">Consulting Gemini...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Carousel */}
          {messages.length <= 3 && !loading && (
            <div className="px-3 py-2 border-t border-slate-200 bg-white shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1.5">
                Suggested Questions:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="text-[11px] bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 text-slate-700 border border-slate-200 px-2 py-1 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
          </div>

          {/* Clear Confirmation Modal */}
          {showClearConfirm && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-xl p-4 shadow-xl border border-slate-200 space-y-3 max-w-xs text-center">
                <h4 className="text-xs font-bold text-slate-900">
                  Clear conversation history?
                </h4>
                <p className="text-[11px] text-slate-500">
                  This will reset the current session chat messages.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg cursor-pointer shadow-2xs"
                  >
                    Clear Chat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
