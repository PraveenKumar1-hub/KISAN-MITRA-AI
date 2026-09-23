import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage } from '../services/aiService';
import type { ChatMessage } from '../types/ai';
import {
  Bot,
  User as UserIcon,
  Send,
  Trash2,
  Sparkles,
  MapPin,
  Sprout,
  Droplets,
  Layers,
  AlertCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

const QUICK_QUESTIONS = [
  'What crop is suitable for my farm?',
  'Should I irrigate today?',
  'What does the current weather mean for my crop?',
  'How can I improve my soil?',
  'My plant looks unhealthy. What should I check?'
];

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageCounter = useRef<number>(0);

  // Initialize conversation with contextual welcome greeting
  useEffect(() => {
    if (messages.length === 0) {
      const farmerName = user?.full_name?.split(' ')[0] || 'Farmer';
      const crop = user?.primary_crop || 'your crops';
      const location = user?.location ? ` in ${user.location}` : '';

      const initialGreeting: ChatMessage = {
        id: 'welcome-msg',
        sender: 'assistant',
        text: `Namaste ${farmerName}. I am your Kisan Mitra Agricultural Assistant. I am familiar with your farm setup${location} and your primary crop (${crop}). How can I assist your field operations today? You can ask in English, Hindi, or Hinglish.`,
        language: 'English',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialGreeting]);
    }
  }, [user, messages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    if (query.length > 2000) {
      setErrorNotice('Message exceeds 2000 characters limit. Please shorten your question.');
      return;
    }

    setErrorNotice(null);
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageCounter.current += 1;

    const newUserMsg: ChatMessage = {
      id: `user-${messageCounter.current}`,
      sender: 'user',
      text: query,
      timestamp: userTimestamp
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await sendChatMessage(query);
      const assistantTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      messageCounter.current += 1;

      if (res.success) {
        const assistantMsg: ChatMessage = {
          id: `ai-${messageCounter.current}`,
          sender: 'assistant',
          text: res.answer,
          language: res.language,
          timestamp: assistantTimestamp,
          sources: res.sources || []
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `ai-err-${messageCounter.current}`,
          sender: 'assistant',
          text: res.answer || 'AI Assistant is temporarily unavailable. Please try again.',
          language: res.language || 'English',
          timestamp: assistantTimestamp,
          isError: true
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const assistantTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      messageCounter.current += 1;
      let errorText = 'AI Assistant is temporarily unavailable. Please try again.';
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errorText = 'Your session has expired. Please log in again to consult the AI Assistant.';
        } else if (err.response?.data?.answer) {
          errorText = err.response.data.answer;
        } else if (typeof err.response?.data?.detail === 'string') {
          errorText = err.response.data.detail;
        }
      }
      const errorMsg: ChatMessage = {
        id: `ai-err-${messageCounter.current}`,
        sender: 'assistant',
        text: errorText,
        language: 'English',
        timestamp: assistantTimestamp,
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearConversation = () => {
    const farmerName = user?.full_name?.split(' ')[0] || 'Farmer';
    const crop = user?.primary_crop || 'your crops';
    const resetMsg: ChatMessage = {
      id: `reset-${Date.now()}`,
      sender: 'assistant',
      text: `Conversation cleared. Namaste ${farmerName}, ask me any agricultural question about ${crop}, soil preparation, weather, or irrigation scheduling.`,
      language: 'English',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([resetMsg]);
    setErrorNotice(null);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-8">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                AI Agricultural Assistant
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Ask questions about your farm, crops, weather, irrigation, and plant health.
              </p>
            </div>
          </div>
        </div>

        {/* Clear Conversation Action */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleClearConversation}
            title="Clear conversation messages"
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-2xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Clear Chat
          </button>
        </div>
      </div>

      {/* 2. Farm Context Indicator Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-700 flex items-center mr-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 mr-1" />
          Active Farm Context:
        </span>
        {user?.primary_crop && (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-800">
            <Sprout className="w-3 h-3 text-emerald-600 mr-1" />
            {user.primary_crop}
          </span>
        )}
        {user?.location && (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-800">
            <MapPin className="w-3 h-3 text-slate-500 mr-1" />
            {user.location}
          </span>
        )}
        {user?.soil_type && (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-800">
            <Layers className="w-3 h-3 text-amber-600 mr-1" />
            {user.soil_type} Soil
          </span>
        )}
        {user?.irrigation_type && (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-800">
            <Droplets className="w-3 h-3 text-blue-600 mr-1" />
            {user.irrigation_type}
          </span>
        )}
        <span className="ml-auto text-[11px] text-slate-400 font-medium">
          Multilingual (English / Hindi / Hinglish)
        </span>
      </div>

      {/* 3. Quick Questions Carousel / Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Suggested Questions:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={loading}
              onClick={() => handleSendMessage(q)}
              className="text-left px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-xs font-medium text-slate-700 transition-colors shadow-2xs disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Chat Message Display Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-[520px] sm:h-[580px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                    isUser
                      ? 'bg-primary-600 text-white'
                      : msg.isError
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble Container */}
                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-primary-600 text-white rounded-tr-xs shadow-xs'
                        : msg.isError
                        ? 'bg-amber-50/90 border border-amber-200 text-slate-800 rounded-tl-xs'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Metadata Row */}
                  <div
                    className={`flex items-center space-x-2 text-[10px] text-slate-400 px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.language && (
                      <span className="font-semibold text-slate-500 uppercase tracking-wider">
                        &bull; {msg.language}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-150" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-300" />
                  <span className="text-xs text-slate-500 ml-1.5 font-medium">
                    Consulting agricultural intelligence...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 5. Input Area */}
        <div className="border-t border-slate-200 p-3 sm:p-4 bg-slate-50/60 space-y-2">
          {errorNotice && (
            <div className="flex items-center text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5">
              <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={2}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about wheat irrigation, fertilizer dosage, weather impact, or plant symptoms..."
                maxLength={2000}
                className="w-full pl-3.5 pr-14 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder:text-slate-400 shadow-2xs resize-none"
              />
              <span className="absolute right-3 bottom-2 text-[10px] text-slate-400 font-mono">
                {inputMessage.length}/2000
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim() || inputMessage.length > 2000}
              id="send-chat-btn"
              title="Send question"
              className="p-3 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 h-[48px] w-[48px] flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
            <div className="flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>Advisory only. Always verify critical chemical applications with local Krishi Vigyan Kendra.</span>
            </div>
            <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
