
import React from 'react';
import { Expert } from '../types';

interface ExpertCardProps {
  expert: Expert;
  onSelect: (expert: Expert) => void;
  isActive?: boolean;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({ expert, onSelect, isActive }) => {
  return (
    <div 
      onClick={() => onSelect(expert)}
      className={`cursor-pointer p-4 rounded-xl flex flex-col items-center transition-all mystic-card ${
        isActive ? 'ring-2 ring-rose-500 shadow-lg scale-105' : 'opacity-80 hover:opacity-100'
      }`}
    >
      <img 
        src={expert.avatar} 
        alt={expert.name} 
        className="w-16 h-16 rounded-full mb-3 border-2 border-white/20"
      />
      <h3 className="font-bold text-lg text-white">{expert.name}</h3>
      <p className="text-xs text-rose-300 mb-2">{expert.title}</p>
      <p className="text-[10px] text-gray-400 text-center line-clamp-2">{expert.description}</p>
    </div>
  );
};
