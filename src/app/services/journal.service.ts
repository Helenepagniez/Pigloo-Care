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
    // Force recalculation on load to ensure consistency
    const entries = this.loadEntries();
    const stats = this.recalculateStats(entries);
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    return stats;
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

    this.updateStats();
  }

  deleteEntry(date: string) {
    const currentEntries = this.entries().filter((e: JournalEntry) => e.date !== date);
    this.entries.set(currentEntries);
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(currentEntries));

    this.updateStats();
  }

  private updateStats() {
    const oldStats = this.stats();
    const newStats = this.recalculateStats(this.entries());

    // Check for new badges to notify
    newStats.badges.forEach(badgeId => {
      if (!oldStats.badges.includes(badgeId)) {
        const badge = AVAILABLE_BADGES.find((b: any) => b.id === badgeId);
        if (badge) this.rewardsService.notify(badge);
      }
    });

    this.stats.set(newStats);
    localStorage.setItem(this.STATS_KEY, JSON.stringify(newStats));
  }

  private recalculateStats(entries: JournalEntry[]): UserStats {
    const uniqueDates = Array.from(new Set(entries.map(e => e.date)));
    const today = new Date().toISOString().split('T')[0];
    
    const getPrevDay = (dateStr: string) => {
      const date = new Date(dateStr + 'T12:00:00Z');
      date.setDate(date.getDate() - 1);
      return date.toISOString().split('T')[0];
    };

    const yesterday = getPrevDay(today);

    let streak = 0;
    let hasToday = uniqueDates.includes(today);
    let hasYesterday = uniqueDates.includes(yesterday);

    let checkDateStr = '';
    if (hasToday) {
      checkDateStr = today;
    } else if (hasYesterday) {
      checkDateStr = yesterday;
    }

    if (checkDateStr) {
      while (uniqueDates.includes(checkDateStr)) {
        streak++;
        checkDateStr = getPrevDay(checkDateStr);
      }
    }

    const badges: string[] = [];
    if (entries.some(e => e.cried === 'Pas du tout')) {
      badges.push('1-day-no-cry');
    }
    if (streak >= 7) badges.push('streak-7');
    if (streak >= 15) badges.push('streak-15');
    if (streak >= 30) badges.push('streak-30');

    return {
      streak,
      badges,
      lastEntryDate: hasToday ? today : (hasYesterday ? yesterday : undefined)
    };
  }

  exportData(): string {
    const data = {
      entries: this.entries(),
      stats: this.stats()
    };
    return JSON.stringify(data, null, 2);
  }
}
