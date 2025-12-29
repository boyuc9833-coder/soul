
import React, { useState, useEffect } from 'react';
import { EXPERTS } from './constants';
import { Expert, JournalEntry } from './types';
import { ExpertCard } from './components/ExpertCard';
import { ChatInterface } from './components/ChatInterface';
import { JournalManager } from './components/JournalManager';

const App: React.FC = () => {
  const [selectedExpert, setSelectedExpert] = useState<Expert>(EXPERTS[0]); // Default is COUNCIL now
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'journal' | 'chat'>('journal');

  // Load journals from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('soul_oracle_journals');
    if (saved) {
      try {
        setJournals(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load journals", e);
      }
    }
  }, []);

  // Save journals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('soul_oracle_journals', JSON.stringify(journals));
  }, [journals]);

  const handleSaveJournal = (entry: JournalEntry) => {
    setJournals(prev => [entry, ...prev]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-indigo-400 to-amber-500 gold-glow mb-4">
          SoulOracle <span className="text-2xl font-light">靈魂啟示錄</span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-base">
          在這裡，每一滴情緒都有共鳴，每一顆星辰都有寓意。
          向專家尋求智慧，或開啟<b>「命運議會」</b>獲取全方位啟示。
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Expert Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center space-x-2 mb-4">
             <div className="h-px flex-1 bg-white/10"></div>
             <span className="text-xs text-gray-500 uppercase tracking-widest">指引來源</span>
             <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {EXPERTS.map(expert => (
              <ExpertCard 
                key={expert.id} 
                expert={expert} 
                onSelect={(e) => {
                  setSelectedExpert(e);
                  setActiveTab('chat');
                }}
                isActive={selectedExpert.id === expert.id}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white/5 p-1 rounded-xl mb-4 border border-white/5">
            <button 
              onClick={() => setActiveTab('journal')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'journal' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <i className="fas fa-book-open mr-2"></i>心靈隨筆
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'chat' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <i className="fas fa-comments mr-2"></i>
              {selectedExpert.id === 'COUNCIL' ? '議會對話' : `與 ${selectedExpert.name} 對話`}
            </button>
          </div>

          <div className="min-h-[600px]">
            {activeTab === 'journal' ? (
              <JournalManager onSave={handleSaveJournal} entries={journals} />
            ) : (
              <div className="animate-in slide-in-from-right duration-500">
                <ChatInterface expert={selectedExpert} />
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-20 text-center text-gray-600 text-xs py-8 border-t border-white/5">
        <p>© 2024 SoulOracle - 連結心靈與星辰的橋樑</p>
        <p className="mt-2 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          由 Gemini AI 驅動的命運演算法
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        </p>
      </footer>
    </div>
  );
};

export default App;
