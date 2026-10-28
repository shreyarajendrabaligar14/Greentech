import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, X, Send, Leaf, Trash2, ChevronDown,
  Bot, Sparkles, Clock
} from 'lucide-react';
import { getApiBaseUrl } from '../services/api';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: `👋 **Hello! I'm EcoBot — Your Carbon Assistant!**

I'm trained on verified emission data and can help you:
- ⚡ Understand electricity & energy emissions
- 🚗 Calculate transportation carbon costs
- ♻️ Learn waste reduction strategies
- 💡 Get personalized eco-tips
- 🏆 Navigate challenges & goals

**Try asking me:**`,
  suggestions: [
    'How can I reduce my electricity footprint?',
    'What is the carbon cost of driving vs metro?',
    'How do I start composting?',
    'Explain my carbon footprint'
  ],
  timestamp: new Date().toISOString(),
};

function renderMarkdown(text) {
  // Simple markdown-like rendering
  return text
    .split('\n')
    .map((line, i) => {
      // Bold: **text**
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic: *text*
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');

      if (line.startsWith('# ')) {
        return <h3 key={i} className="text-sm font-black text-slate-900 mt-2 mb-1" dangerouslySetInnerHTML={{ __html: line.replace('# ', '') }} />;
      }
      if (line.startsWith('## ')) {
        return <p key={i} className="text-xs font-black text-slate-800 mt-2 mb-0.5" dangerouslySetInnerHTML={{ __html: line.replace('## ', '') }} />;
      }
      if (line.match(/^[-•] /)) {
        return (
          <div key={i} className="flex gap-2 ml-1">
            <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
            <span dangerouslySetInnerHTML={{ __html: line.replace(/^[-•] /, '') }} />
          </div>
        );
      }
      if (line.match(/^\d+\. /)) {
        return (
          <div key={i} className="flex gap-2 ml-1">
            <span className="text-emerald-600 font-bold flex-shrink-0 text-xs">{line.match(/^\d+/)[0]}.</span>
            <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\. /, '') }} />
          </div>
        );
      }
      if (!line.trim()) return <div key={i} className="h-1.5" />;
      return <p key={i} dangerouslySetInnerHTML={{ __html: line }} />;
    });
}

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function EcoBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, scrollToBottom]);

  const sendMessage = useCallback(async (text) => {
    const msgText = (text || input).trim();
    if (!msgText || isTyping) return;

    setInput('');
    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: msgText,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate typing delay for realism
    await new Promise(r => setTimeout(r, 700 + Math.random() * 600));

    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg = {
          id: Date.now() + 1,
          role: 'assistant',
          text: data.response,
          suggestions: data.suggestions || [],
          timestamp: data.timestamp || new Date().toISOString(),
        };
        setMessages(prev => [...prev, botMsg]);
        if (!isOpen) setUnread(u => u + 1);
      } else {
        throw new Error('API error');
      }
    } catch {
      const fallbackMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: '⚠️ I\'m having trouble connecting right now. Please make sure the backend server is running and try again.',
        suggestions: ['How to reduce electricity?', 'Carbon footprint explained', 'Eco tips for transport'],
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setUnread(0);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Unread badge tooltip */}
        {!isOpen && unread > 0 && (
          <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
            {unread} new message{unread > 1 ? 's' : ''}
          </div>
        )}

        <button
          id="ecobot-toggle"
          onClick={() => { setIsOpen(o => !o); setIsMinimized(false); }}
          className={`relative w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? 'bg-slate-800 shadow-slate-900/50 rotate-0'
              : 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/40 hover:scale-110'
          }`}
          aria-label="Toggle EcoBot"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <>
              <Leaf className="w-6 h-6 text-white" />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-black flex items-center justify-center">
                  {unread}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat Panel */}
      <div className={`fixed bottom-24 right-6 z-50 w-[360px] sm:w-[400px] transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          style={{ height: isMinimized ? 'auto' : '540px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-black text-white">EcoBot</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />AI
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                  <p className="text-[11px] text-white/70">Your Carbon Assistant · Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(m => !m)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Leaf className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">EcoBot</span>
                      </div>
                    )}
                    <div className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed space-y-0.5 ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 text-white rounded-tr-sm'
                        : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm'
                    }`}>
                      {msg.role === 'assistant' ? renderMarkdown(msg.text) : <p>{msg.text}</p>}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-300">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(msg.timestamp)}
                    </div>

                    {/* Suggestion chips */}
                    {msg.role === 'assistant' && msg.suggestions?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(s)}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-colors text-left"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-slate-100 p-3 flex-shrink-0 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask EcoBot about carbon emissions..."
                    rows={1}
                    className="flex-1 resize-none text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 text-slate-700 placeholder-slate-400 bg-slate-50 max-h-24 leading-relaxed transition-all"
                    style={{ overflowY: 'auto' }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isTyping}
                    className="w-9 h-9 flex-shrink-0 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-500/30 hover:shadow-emerald-500/50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                  EcoBot uses verified DEFRA/CEA emission factors · Data-backed responses only
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
