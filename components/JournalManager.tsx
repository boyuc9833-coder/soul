
import React, { useState } from 'react';
import { JournalEntry, ExpertType } from '../types';
import { getJournalInsight } from '../services/geminiService';

interface JournalManagerProps {
  onSave: (entry: JournalEntry) => void;
  entries: JournalEntry[];
}

export const JournalManager: React.FC<JournalManagerProps> = ({ onSave, entries }) => {
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('😊');
  const [loadingInsights, setLoadingInsights] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoadingInsights(true);
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('zh-TW'),
      title: title || '無標題隨筆',
      content,
      mood,
      expertInsights: {}
    };

    // Get insights from all experts
    const expertTypes: ExpertType[] = ['EMOTION', 'ZODIAC', 'NUMEROLOGY'];
    const insightsPromises = expertTypes.map(type => getJournalInsight(type, content));
    const results = await Promise.all(insightsPromises);
    
    expertTypes.forEach((type, idx) => {
      if (results[idx]) {
        newEntry.expertInsights![type] = results[idx] as string;
      }
    });

    onSave(newEntry);
    setLoadingInsights(false);
    setIsWriting(false);
    setTitle('');
    setContent('');
    setMood('😊');
  };

  return (
    <div className="space-y-6">
      {!isWriting ? (
        <button 
          onClick={() => setIsWriting(true)}
          className="w-full py-4 bg-gradient-to-r from-rose-600 to-indigo-600 rounded-2xl font-bold text-white shadow-lg hover:shadow-rose-500/20 transition-all flex items-center justify-center space-x-2"
        >
          <i className="fas fa-feather-alt"></i>
          <span>紀錄今日心情</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mystic-card p-6 rounded-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold gold-glow">撰寫心靈隨筆</h3>
            <button type="button" onClick={() => setIsWriting(false)} className="text-gray-400 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="flex space-x-4 items-center">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="給這段回憶起個名字..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500"
            />
            <select 
              value={mood} 
              onChange={(e) => setMood(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white outline-none"
            >
              <option value="😊">😊 愉快</option>
              <option value="😔">😔 憂鬱</option>
              <option value="🤔">🤔 思考</option>
              <option value="😡">😡 憤怒</option>
              <option value="🌟">🌟 充滿能量</option>
              <option value="😴">😴 疲憊</option>
            </select>
          </div>

          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="今天發生了什麼事？有什麼感受？"
            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-rose-500 resize-none"
          />

          <button 
            type="submit" 
            disabled={loadingInsights}
            className="w-full py-3 bg-rose-600 rounded-xl font-bold text-white disabled:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
          >
            {loadingInsights ? (
              <><i className="fas fa-spinner animate-spin"></i><span>專家正在研讀中...</span></>
            ) : (
              <span>保存紀錄並尋求專家指引</span>
            )}
          </button>
        </form>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b border-white/10 pb-2">過去的紀錄</h3>
        {entries.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <i className="fas fa-book-open text-4xl mb-4 block"></i>
            還沒有任何紀錄，開始寫下你的第一篇吧。
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="mystic-card p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-rose-400">{entry.date}</span>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    {entry.mood} {entry.title}
                  </h4>
                </div>
                <div className="flex space-x-1">
                  {Object.keys(entry.expertInsights || {}).map(type => (
                    <span key={type} className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-300 line-clamp-2 italic">"{entry.content}"</p>
              
              {entry.expertInsights && (
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {entry.expertInsights.EMOTION && (
                    <div className="text-[10px] bg-rose-900/20 p-2 rounded-lg border border-rose-500/20">
                      <span className="font-bold text-rose-400 block mb-1">Luna 的寬慰：</span>
                      {entry.expertInsights.EMOTION}
                    </div>
                  )}
                  {entry.expertInsights.ZODIAC && (
                    <div className="text-[10px] bg-indigo-900/20 p-2 rounded-lg border border-indigo-500/20">
                      <span className="font-bold text-indigo-400 block mb-1">Astro 的星語：</span>
                      {entry.expertInsights.ZODIAC}
                    </div>
                  )}
                  {entry.expertInsights.NUMEROLOGY && (
                    <div className="text-[10px] bg-amber-900/20 p-2 rounded-lg border border-amber-500/20">
                      <span className="font-bold text-amber-400 block mb-1">大師的玄機：</span>
                      {entry.expertInsights.NUMEROLOGY}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
