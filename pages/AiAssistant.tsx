import React, { useState, useRef, useEffect } from 'react';
import { generateTabletResponse } from '../services/geminiService';
import { useData } from '../contexts/DataContext';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const AiAssistant: React.FC = () => {
  const { tablets } = useData();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hello! I am DrawTabDB AI. Ask me anything about our database of drawing tablets. I can compare models, check specs, or help you find the right tool.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      // Pass the current dynamic tablets data to the service
      const responseText = await generateTabletResponse(userMsg.text, history, tablets);
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: 'Sorry, something went wrong. Please check your API key.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-4rem)]">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            AI Assistant <Sparkles className="text-primary-400" size={24} />
          </h2>
          <p className="text-slate-400 mt-1">Powered by Google Gemini. Querying {tablets.length} models.</p>
        </div>
      </header>

      <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-600' : 'bg-primary-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-slate-700 text-white rounded-tr-none' 
                  : 'bg-primary-900/30 border border-primary-500/20 text-slate-200 rounded-tl-none'
              }`}>
                {/* Simple Markdown Rendering Replacement */}
                <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.text.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className="text-primary-300">{part}</strong> : part
                    )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-primary-900/30 border border-primary-500/20 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-700">
          <div className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about specific tablets, compare models, or ask for recommendations..."
              className="w-full bg-slate-800 text-white rounded-xl border border-slate-700 p-3 pr-12 focus:outline-none focus:border-primary-500 resize-none max-h-32 min-h-[50px]"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            AI can make mistakes. Please check the catalog for exact specifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;