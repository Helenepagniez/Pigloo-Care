import { Injectable, signal } from '@angular/core';
import { JournalEntry, UserStats, AVAILABLE_BADGES } from '../models/journal.model';
import { RewardsService } from './rewards.service';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private readonly ENTRIES_KEY = 'pigloo_journal_entries';
  private readonly STATS_KEY = 'pigloo_user_stats';

  entries = signal<JournalEntry[]>(this.loadEntries());
  stats = signal<UserStats>(this.loadStats());

  constructor(private rewardsService: RewardsService) { }

  private loadEntries(): JournalEntry[] {
    const data = localStorage.getItem(this.ENTRIES_KEY);
    return data ? JSON.parse(data) : [];
  }

  private loadStats(): UserStats {
    const data = localStorage.getItem(this.STATS_KEY);
    return data ? JSON.parse(data) : { streak: 0, badges: [] };
  }

  getEntryByDate(date: string): JournalEntry | undefined {
    return this.entries().find((e: JournalEntry) => e.date === date);
  }

  saveEntry(entry: JournalEntry) {
    const currentEntries = [...this.entries()];
    const index = currentEntries.findIndex((e: JournalEntry) => e.date === entry.date);
    
    if (index >= 0) {
      currentEntries[index] = entry;
    } else {
      currentEntries.push(entry);
    }

    this.entries.set(currentEntries);
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(currentEntries));
    
    this.updateStats(entry);
  }

  deleteEntry(date: string) {
    const currentEntries = this.entries().filter((e: JournalEntry) => e.date !== date);
    this.entries.set(currentEntries);
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(currentEntries));
  }

  private updateStats(newEntry: JournalEntry) {
    const currentStats = { ...this.stats() };
    const today = new Date().toISOString().split('T')[0];
    
    // Streak logic
    if (currentStats.lastEntryDate) {
      const lastDate = new Date(currentStats.lastEntryDate);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStats.streak += 1;
      } else if (diffDays > 1) {
        currentStats.streak = 1;
      }
    } else {
      currentStats.streak = 1;
    }
    
    currentStats.lastEntryDate = today;

    // Check Badges
    const newBadges: string[] = [...currentStats.badges];
    
    const checkBadge = (id: string) => {
      if (!newBadges.includes(id)) {
        newBadges.push(id);
        const badge = AVAILABLE_BADGES.find((b: any) => b.id === id);
        if (badge) this.rewardsService.notify(badge);
      }
    };

    if (newEntry.cried === 'pas du tout') {
      checkBadge('1-day-no-cry');
    }
    
    if (currentStats.streak >= 7) checkBadge('streak-7');
    if (currentStats.streak >= 15) checkBadge('streak-15');
    if (currentStats.streak >= 30) checkBadge('streak-30');

    currentStats.badges = newBadges;
    this.stats.set(currentStats);
    localStorage.setItem(this.STATS_KEY, JSON.stringify(currentStats));
  }

  exportData(): string {
    const data = {
      entries: this.entries(),
      stats: this.stats()
    };
    return JSON.stringify(data, null, 2);
  }
}
