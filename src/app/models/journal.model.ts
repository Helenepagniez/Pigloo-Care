export interface JournalEntry {
  date: string; // ISO format YYYY-MM-DD
  water: number;
  coffee: number;
  soda: number;
  sleepQuality: 'Très bien' | 'Plutôt bien' | 'Pas assez' | 'Très mal';
  activities: string[];
  mainActivity?: string; // For migration
  moodEmoji: string; // Now stores icon name
  emotions: string[];
  cried: 'Pas du tout' | 'Un peu' | 'Beaucoup';
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
  //-- Pleurer () --//
  { id: 'cry-less-1', name: 'Petit pas', description: 'Premier jour sans trop pleurer', icon: 'sentiment_satisfied' },
  { id: 'cry-less-5', name: 'Élan', description: '5 jours de suite sans trop pleurer', icon: 'trending_up' },
  { id: 'cry-less-10', name: 'Ressaisissement', description: '10 jours de suite sans trop pleurer', icon: 'self_improvement' },
  { id: 'cry-less-15', name: 'Volonté de fer', description: '15 jours de suite sans trop pleurer', icon: 'fitness_center' },
  { id: 'cry-less-30', name: 'Cœur léger', description: '30 jours de suite sans trop pleurer', icon: 'favorite' },

  { id: 'no-cry-1', name: 'Rayon de soleil', description: 'Premier jour sans pleurer', icon: 'wb_sunny' },
  { id: 'no-cry-3', name: 'Arc-en-ciel', description: '3 jours de suite sans pleurer', icon: 'filter_vintage' },
  { id: 'no-cry-7', name: 'Ciel bleu', description: '7 jours de suite sans pleurer', icon: 'cloud_queue' },
  { id: 'no-cry-10', name: 'Sérénité', description: '10 jours de suite sans pleurer', icon: 'spa' },
  { id: 'no-cry-15', name: 'Paix intérieure', description: '15 jours de suite sans pleurer', icon: 'self_improvement' },
  { id: 'no-cry-20', name: 'Joie profonde', description: '20 jours de suite sans pleurer', icon: 'sentiment_very_satisfied' },

  //-- Eau --//
  { id: 'glass-water-1', name: 'Survie', description: 'Premier verre d\'eau', icon: 'water_drop' },
  { id: 'glass-water-3', name: 'Hydratation timide', description: '3 jours de suite à boire 1 verre d\'eau', icon: 'opacity' },
  { id: 'glass-water-7', name: 'Bonne habitude', description: '7 jours de suite à boire 1 verre d\'eau', icon: 'local_drink' },
  { id: 'glass-water-15', name: 'Routine installée', description: '15 jours de suite à boire 1 verre d\'eau', icon: 'emoji_nature' },
  { id: 'glass-water-30', name: 'Hydratation ancrée', description: '30 jours de suite à boire 1 verre d\'eau', icon: 'waves' },

  { id: 'carafe-water-1', name: 'Double effort', description: 'Premier jour à boire au moins 2 verres d\'eau', icon: 'water' },
  { id: 'carafe-water-3', name: 'Ça coule', description: '3 jours de suite à boire au moins 2 verres d\'eau', icon: 'opacity' },
  { id: 'carafe-water-7', name: 'Hydratation solide', description: '7 jours de suite à boire au moins 2 verres d\'eau', icon: 'local_drink' },
  { id: 'carafe-water-15', name: 'Corps reconnaissant', description: '15 jours de suite à boire au moins 2 verres d\'eau', icon: 'spa' },
  { id: 'carafe-water-30', name: 'Équilibre vital', description: '30 jours de suite à boire au moins 2 verres d\'eau', icon: 'favorite' },

  //-- Sodas --//
  { id: 'soda-less-1', name: 'Frein léger', description: 'Moins de 6 verres de soda par jour', icon: 'trending_down' },
  { id: 'soda-less-3', name: 'Effort visible', description: 'Moins de 6 verres de soda pendant 3 jours', icon: 'show_chart' },
  { id: 'soda-less-7', name: 'Cap maintenu', description: 'Moins de 6 verres de soda pendant une semaine', icon: 'timeline' },
  { id: 'soda-less-15', name: 'Résistance', description: 'Moins de 6 verres de soda pendant 2 semaines', icon: 'insights' },

  { id: 'soda-less-less-1', name: 'Vrai déclic', description: 'Moins de 3 verres de soda par jour', icon: 'bolt' },
  { id: 'soda-less-less-3', name: 'Contrôle', description: 'Moins de 3 verres de soda pendant 3 jours', icon: 'tune' },
  { id: 'soda-less-less-7', name: 'Maîtrise', description: 'Moins de 3 verres de soda pendant une semaine', icon: 'verified' },
  { id: 'soda-less-less-15', name: 'Libération', description: 'Moins de 3 verres de soda pendant 2 semaines', icon: 'emoji_events' },

  { id: 'no-soda-1', name: 'Pause', description: 'Un jour sans soda', icon: 'block' },
  { id: 'no-soda-3', name: 'Respiration', description: 'Trois jours sans soda', icon: 'air' },
  { id: 'no-soda-7', name: 'Nouveau rythme', description: 'Une semaine sans soda', icon: 'autorenew' },
  { id: 'no-soda-15', name: 'Détachement', description: 'Deux semaines sans soda', icon: 'self_improvement' },
  { id: 'no-soda-30', name: 'Liberté', description: 'Un mois sans soda', icon: 'military_tech' },
];
