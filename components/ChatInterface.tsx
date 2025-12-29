
import React, { useState, useRef, useEffect } from 'react';
import { Expert, Message, ExpertType } from '../types';
import { getExpertResponse } from '../services/geminiService';
import { EXPERTS } from '../constants';

interface ChatInterfaceProps {
  expert: Expert;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ expert }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage when expert changes
  useEffect(() => {
    const storageKey = `soul_oracle_chat_${expert.id}`;
    const savedHistory = localStorage.getItem(storageKey);
    
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
        resetToGreeting();
      }
    } else {
      resetToGreeting();
    }
  }, [expert]);

  // Save history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = `soul_oracle_chat_${expert.id}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, expert.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const resetToGreeting = () => {
    setMessages([{
      id: 'greeting',
      role: 'model',
      text: expert.greeting,
      expertId: expert.id,
      timestamp: Date.now()
    }]);
  };

  const clearHistory = () => {
    if (window.confirm(`確定要清除與 ${expert.name} 的對話記憶嗎？`)) {
      const storageKey = `soul_oracle_chat_${expert.id}`;
      localStorage.removeItem(storageKey);
      resetToGreeting();
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      expertId: expert.id,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    // Prepare history for Gemini (limit to last 20 messages to keep context clean)
    const history = newMessages.slice(-20).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getExpertResponse(expert.id, inputText, history);
    
    if (expert.id === 'COUNCIL') {
      try {
        const parsed = JSON.parse(response || '{}');
        const councilReplies: Message[] = [
          { id: Date.now().toString() + '1', role: 'model', text: parsed.emotion, expertId: 'EMOTION', timestamp: Date.now() },
          { id: Date.now().toString() + '2', role: 'model', text: parsed.zodiac, expertId: 'ZODIAC', timestamp: Date.now() },
          { id: Date.now().toString() + '3', role: 'model', text: parsed.numerology, expertId: 'NUMEROLOGY', timestamp: Date.now() },
        ];
        
        let currentMsgs = [...newMessages];
        for(let i = 0; i < councilReplies.length; i++) {
            await new Promise(r => setTimeout(r, 600));
            currentMsgs = [...currentMsgs, councilReplies[i]];
            setMessages(currentMsgs);
        }
      } catch (e) {
        console.error("Failed to parse council response", e);
      }
    } else {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response || '發生錯誤',
        expertId: expert.id,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    }
    
    setIsTyping(false);
  };

  const getExpertInfo = (id: ExpertType) => EXPERTS.find(e => e.id === id) || expert;

  return (
    <div className="flex flex-col h-[600px] mystic-card rounded-2xl overflow-hidden shadow-2xl">
      <div className={`p-4 ${expert.color} flex items-center justify-between shadow-lg z-10`}>
        <div className="flex items-center space-x-3">
          <div className="relative">
             <img src={expert.avatar} className="w-10 h-10 rounded-full border border-white/40" alt="" />
             {expert.id === 'COUNCIL' && <div className="absolute -bottom-1 -right-1 bg-amber-400 text-[8px] px-1 rounded-full text-black font-bold">VIP</div>}
          </div>
          <div>
            <h4 className="font-bold text-white">{expert.name}</h4>
            <p className="text-xs text-white/80">{expert.title}</p>
          </div>
        </div>
        <button 
          onClick={clearHistory}
          className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white/70 hover:bg-black/40 hover:text-white transition-all"
          title="清除記憶"
        >
          <i className="fas fa-trash-alt text-xs"></i>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-black/40 scroll-smooth">
        {messages.map((msg) => {
          const info = getExpertInfo(msg.expertId);
          return (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start animate-in slide-in-from-left duration-500'}`}>
              {msg.role === 'model' && expert.id === 'COUNCIL' && msg.id !== 'greeting' && (
                <span className="text-[10px] font-bold mb-1 ml-11 text-gray-400 uppercase tracking-tighter">
                  {info.name} • {info.title}
                </span>
              )}
              <div className={`flex items-end space-x-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {msg.role === 'model' && (
                   <img src={info.avatar} className="w-8 h-8 rounded-full border border-white/20 mb-1" alt="" />
                )}
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-rose-600 text-white rounded-tr-none' 
                    : `text-gray-200 rounded-tl-none border border-white/5 ${
                        msg.expertId === 'EMOTION' ? 'bg-rose-900/40 border-rose-500/20' :
                        msg.expertId === 'ZODIAC' ? 'bg-indigo-900/40 border-indigo-500/20' :
                        msg.expertId === 'NUMEROLOGY' ? 'bg-amber-900/40 border-amber-500/20' :
                        'bg-white/10'
                      }`
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start space-x-2 animate-pulse">
            <div className="w-8 h-8 bg-white/10 rounded-full"></div>
            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none text-gray-400 text-xs">
              正在研議中...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/5 border-t border-white/10 flex space-x-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={expert.id === 'COUNCIL' ? "向命運議會尋求全方位指引..." : `向 ${expert.name} 諮詢...`}
          className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 text-white"
        />
        <button 
          onClick={handleSend}
          disabled={isTyping}
          className="bg-rose-600 hover:bg-rose-500 disabled:bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};
