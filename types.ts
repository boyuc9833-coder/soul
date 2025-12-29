
export type ExpertType = 'EMOTION' | 'ZODIAC' | 'NUMEROLOGY' | 'COUNCIL';

export interface Expert {
  id: ExpertType;
  name: string;
  title: string;
  avatar: string;
  color: string;
  description: string;
  greeting: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  expertInsights?: {
    [key in Exclude<ExpertType, 'COUNCIL'>]?: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  expertId: ExpertType; // For COUNCIL, this could be the specific expert responding within that turn
  timestamp: number;
}
