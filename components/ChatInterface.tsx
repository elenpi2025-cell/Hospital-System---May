import React, { useRef, useEffect } from 'react';
import { Message, Sender, AgentType } from '../types';
import { Send, User, Bot, ExternalLink, Cpu } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  input, 
  setInput, 
  onSend, 
  isLoading 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 shadow-sm flex items-center justify-between z-10">
            <div>
                <h1 className="text-xl font-bold text-slate-800">MedCore Control Center</h1>
                <p className="text-sm text-slate-500">Secure AI Coordinator Access</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                System Online
            </div>
        </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 ${
              msg.sender === Sender.USER ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.sender === Sender.USER 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white border border-slate-200 text-blue-600 shadow-sm'
            }`}>
              {msg.sender === Sender.USER ? <User size={20} /> : <Bot size={20} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[70%] flex flex-col ${msg.sender === Sender.USER ? 'items-end' : 'items-start'}`}>
                {/* Agent Label if Bot */}
                {msg.sender === Sender.BOT && msg.activeAgent && msg.activeAgent !== AgentType.HSC && (
                    <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
                        Handled by {msg.activeAgent}
                    </span>
                )}

                <div
                    className={`rounded-2xl p-4 shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === Sender.USER
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                    }`}
                >
                    {msg.text}
                </div>

                {/* Grounding Sources */}
                {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                    <div className="mt-2 bg-white border border-slate-200 rounded-lg p-2 text-xs w-full">
                        <p className="font-semibold text-slate-500 mb-1 flex items-center gap-1">
                            <ExternalLink size={10} />
                            Sources found:
                        </p>
                        <div className="flex flex-col gap-1">
                            {msg.groundingUrls.map((url, idx) => (
                                <a 
                                    key={idx} 
                                    href={url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-blue-500 hover:underline truncate"
                                >
                                    {url}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
            <div className="flex items-start gap-4 animate-pulse">
                 <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                    <Cpu size={20} className="animate-spin" />
                 </div>
                 <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                     <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                     </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto flex items-center gap-3 relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the coordinator (e.g., 'Schedule an appointment with Dr. Chen for next Monday')..."
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 text-sm shadow-inner"
            />
            <button
                onClick={onSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
                <Send size={20} />
            </button>
        </div>
        <p className="text-center text-slate-400 text-xs mt-2">
            MedCore System Prototype v1.0 • Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
