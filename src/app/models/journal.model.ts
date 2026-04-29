export interface JournalEntry {
  date: string; // ISO format YYYY-MM-DD
  water: number;
  coffee: number;
  soda: number;
  sleepQuality: 'mauvais' | 'moyen' | 'bon' | 'excellent';
  mainActivity: string;
  moodEmoji: string;
  emotions: string[];
  cried: 'pas du tout' | 'un peu' | 'beaucoup';
  positives: string[];
  negatives: string[];
  toImprove: string;
  gratitude: string;
  selfMoment: string;
  pride: string;
}

export interface UserStats {
  streak: number;
  lastEntryDate?: string;
  badges: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const AVAILABLE_BADGES: Badge[] = [
  { id: '1-day-no-cry', name: 'Sourire Retrouvé', description: 'Un jour sans pleurer', icon: 'sentiment_very_satisfied' },
  { id: 'streak-7', name: 'Régularité', description: '7 jours consécutifs', icon: 'auto_awesome' },
  { id: 'streak-15', name: 'Persévérance', description: '15 jours consécutifs', icon: 'workspace_premium' },
  { id: 'streak-30', name: 'Maître de Soi', description: '30 jours consécutifs', icon: 'military_tech' },
];
