import React, { useState, useEffect, useRef } from 'react';
import { DemoUser } from '../types/user';
import { ChatMessage, ChatContext } from '../types/chat';
import { geminiChatService } from '../services/ai/geminiChatService';
import { ChatMessageItem } from '../components/chat/ChatMessageItem';
import { ChatInput } from '../components/chat/ChatInput';
import {
  Sparkles,
  Bot,
  Trash2,
  AlertTriangle,
  Layers,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  Info,
} from 'lucide-react';

interface AssistantPageProps {
  activeUser: DemoUser;
  onNavigate: (path: string) => void;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-page',
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

export const AssistantPage: React.FC<AssistantPageProps> = ({
  activeUser,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    geminiChatService.checkStatus().then((res) => {
      setIsConfigured(res.configured);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const context: ChatContext = {
      role: activeUser.role,
    };

    try {
      const response = await geminiChatService.sendMessage(userText, messages, context);

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
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `Network failure: ${error.message || 'Could not reach server'}`,
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            <span>RejectLess AI Waste Assistant</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time guidance on recyclable material streams, 6-point readiness criteria, and recycler eligibility
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMessages([DEFAULT_WELCOME_MESSAGE])}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Conversation Canvas (Col 1 & 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-[650px] overflow-hidden">
          {/* Channel Bar */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-semibold text-slate-800">
                Live Assistant Session
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({activeUser.role} workspace context enabled)
              </span>
            </div>

            <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-semibold">
              gemini-3.8-flash
            </div>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
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

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 w-fit shadow-2xs">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="font-mono text-xs">Generating response via Gemini...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-white">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-1.5">
              Suggested Inquiries:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="text-xs bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-4 bg-white border-t border-slate-200">
            <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
          </div>
        </div>

        {/* Sidebar Knowledge & Capabilities (Col 3) */}
        <div className="space-y-4">
          {/* Circular Rules Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>AI Ethical Principles</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>
                  <strong>AI suggests, humans confirm:</strong> Vision and chatbot outputs are advisory; dock weight and cleanliness inspections are authoritative.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>
                  <strong>Deterministic rules engine:</strong> Recipient eligibility is checked via exact thresholds, never guessed by an LLM.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>
                  <strong>Data boundary protection:</strong> Private facility contracts and driver credentials are never shared outside authorized roles.
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Platform Links Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Layers className="w-4 h-4 text-teal-700" />
              <span>Related Workflows</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onNavigate('/ai-triage')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-800">Vision Material Triage</div>
                  <div className="text-[11px] text-slate-500">Classify photo via ViT model</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/readiness')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-800">6-Point Readiness Gate</div>
                  <div className="text-[11px] text-slate-500">Quality verification before dispatch</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/map')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-800">Geospatial Recipient Map</div>
                  <div className="text-[11px] text-slate-500">Explore paper mills & polymer plants</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
