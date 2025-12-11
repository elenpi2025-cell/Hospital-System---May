import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { GeminiService } from './services/geminiService';
import { Message, Sender, ToolCallLog, AgentType } from './types';

// Initialize Gemini Service outside component to avoid recreation
const geminiService = new GeminiService();

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello, I am the Hospital System Coordinator (HSC). How can I assist you today? I can help with patient registration, appointments, medical records, or billing inquiries.",
      sender: Sender.BOT,
      timestamp: new Date(),
      activeAgent: AgentType.HSC
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toolLogs, setToolLogs] = useState<ToolCallLog[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);

  const handleToolCall = useCallback((agent: AgentType, action: string) => {
    setActiveAgent(agent);
    setToolLogs(prev => [...prev, {
      agent,
      action,
      status: 'pending',
      timestamp: new Date()
    }]);
    
    // Reset active agent after a short delay for visual effect
    setTimeout(() => {
       // We keep the card highlighted if needed, but for now we just show activity
    }, 2000);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: Sender.USER,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setActiveAgent(AgentType.HSC); // Default to coordinator analyzing

    try {
      // Prepare history for API
      const historyForApi = messages.map(m => ({
        role: m.sender === Sender.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await geminiService.sendMessage(
        historyForApi,
        userMsg.text,
        handleToolCall
      );

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || "I processed that request.",
        sender: Sender.BOT,
        timestamp: new Date(),
        activeAgent: response.agent,
        groundingUrls: response.urls
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered a system error processing your request. Please check your API Key or try again.",
        sender: Sender.BOT,
        timestamp: new Date(),
        activeAgent: AgentType.HSC
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setActiveAgent(null);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - Logs & Status */}
      <Sidebar logs={toolLogs} activeAgent={activeAgent} />
      
      {/* Main Chat Area */}
      <ChatInterface 
        messages={messages} 
        input={input} 
        setInput={setInput} 
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;
