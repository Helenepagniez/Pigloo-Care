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

  private initialOldBadges: string[] = [];

  constructor(private rewardsService: RewardsService) {
    this.checkInitialBadges();
  }

  private checkInitialBadges() {
    const currentBadges = this.stats().badges;
    currentBadges.forEach(badgeId => {
      if (!this.initialOldBadges.includes(badgeId)) {
        const badge = AVAILABLE_BADGES.find((b: any) => b.id === badgeId);
        if (badge) this.rewardsService.notify(badge);
      }
    });
    this.initialOldBadges = [];
  }

  private loadEntries(): JournalEntry[] {
    const data = localStorage.getItem(this.ENTRIES_KEY);
    return data ? JSON.parse(data) : [];
  }

  private loadStats(): UserStats {
    // Force recalculation on load to ensure consistency
    const entries = this.loadEntries();

    const oldData = localStorage.getItem(this.STATS_KEY);
    if (oldData) {
      this.initialOldBadges = JSON.parse(oldData).badges || [];
    }

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

    const getNextDay = (dateStr: string) => {
      const date = new Date(dateStr + 'T12:00:00Z');
      date.setDate(date.getDate() + 1);
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

    const currentStreaks = {
      cryLess: 0,
      noCry: 0,
      glassWater: 0,
      carafeWater: 0,
      sodaLess: 0,
      sodaLessLess: 0,
      noSoda: 0
    };

    const maxStreaks = {
      cryLess: 0,
      noCry: 0,
      glassWater: 0,
      carafeWater: 0,
      sodaLess: 0,
      sodaLessLess: 0,
      noSoda: 0
    };

    if (uniqueDates.length > 0) {
      const sortedDates = uniqueDates.sort();
      let iterDateStr = sortedDates[0];
      const lastDateStr = sortedDates[sortedDates.length - 1];

      while (iterDateStr <= lastDateStr) {
        const entry = entries.find(e => e.date === iterDateStr);

        if (entry) {
          if (entry.cried !== 'Beaucoup') currentStreaks.cryLess++; else currentStreaks.cryLess = 0;
          if (entry.cried === 'Pas du tout') currentStreaks.noCry++; else currentStreaks.noCry = 0;
          if (entry.water >= 1) currentStreaks.glassWater++; else currentStreaks.glassWater = 0;
          if (entry.water >= 2) currentStreaks.carafeWater++; else currentStreaks.carafeWater = 0;
          if (entry.soda < 6) currentStreaks.sodaLess++; else currentStreaks.sodaLess = 0;
          if (entry.soda < 3) currentStreaks.sodaLessLess++; else currentStreaks.sodaLessLess = 0;
          if (entry.soda === 0) currentStreaks.noSoda++; else currentStreaks.noSoda = 0;
        } else {
          currentStreaks.cryLess = 0;
          currentStreaks.noCry = 0;
          currentStreaks.glassWater = 0;
          currentStreaks.carafeWater = 0;
          currentStreaks.sodaLess = 0;
          currentStreaks.sodaLessLess = 0;
          currentStreaks.noSoda = 0;
        }

        maxStreaks.cryLess = Math.max(maxStreaks.cryLess, currentStreaks.cryLess);
        maxStreaks.noCry = Math.max(maxStreaks.noCry, currentStreaks.noCry);
        maxStreaks.glassWater = Math.max(maxStreaks.glassWater, currentStreaks.glassWater);
        maxStreaks.carafeWater = Math.max(maxStreaks.carafeWater, currentStreaks.carafeWater);
        maxStreaks.sodaLess = Math.max(maxStreaks.sodaLess, currentStreaks.sodaLess);
        maxStreaks.sodaLessLess = Math.max(maxStreaks.sodaLessLess, currentStreaks.sodaLessLess);
        maxStreaks.noSoda = Math.max(maxStreaks.noSoda, currentStreaks.noSoda);

        iterDateStr = getNextDay(iterDateStr);
      }
    }

    if (maxStreaks.cryLess >= 1) badges.push('cry-less-1');
    if (maxStreaks.cryLess >= 5) badges.push('cry-less-5');
    if (maxStreaks.cryLess >= 10) badges.push('cry-less-10');
    if (maxStreaks.cryLess >= 15) badges.push('cry-less-15');
    if (maxStreaks.cryLess >= 30) badges.push('cry-less-30');

    if (maxStreaks.noCry >= 1) badges.push('no-cry-1');
    if (maxStreaks.noCry >= 3) badges.push('no-cry-3');
    if (maxStreaks.noCry >= 7) badges.push('no-cry-7');
    if (maxStreaks.noCry >= 10) badges.push('no-cry-10');
    if (maxStreaks.noCry >= 15) badges.push('no-cry-15');
    if (maxStreaks.noCry >= 20) badges.push('no-cry-20');

    if (maxStreaks.glassWater >= 1) badges.push('glass-water-1');
    if (maxStreaks.glassWater >= 3) badges.push('glass-water-3');
    if (maxStreaks.glassWater >= 7) badges.push('glass-water-7');
    if (maxStreaks.glassWater >= 15) badges.push('glass-water-15');
    if (maxStreaks.glassWater >= 30) badges.push('glass-water-30');

    if (maxStreaks.carafeWater >= 1) badges.push('carafe-water-1');
    if (maxStreaks.carafeWater >= 3) badges.push('carafe-water-3');
    if (maxStreaks.carafeWater >= 7) badges.push('carafe-water-7');
    if (maxStreaks.carafeWater >= 15) badges.push('carafe-water-15');
    if (maxStreaks.carafeWater >= 30) badges.push('carafe-water-30');

    if (maxStreaks.sodaLess >= 1) badges.push('soda-less-1');
    if (maxStreaks.sodaLess >= 3) badges.push('soda-less-3');
    if (maxStreaks.sodaLess >= 7) badges.push('soda-less-7');
    if (maxStreaks.sodaLess >= 15) badges.push('soda-less-15');

    if (maxStreaks.sodaLessLess >= 1) badges.push('soda-less-less-1');
    if (maxStreaks.sodaLessLess >= 3) badges.push('soda-less-less-3');
    if (maxStreaks.sodaLessLess >= 7) badges.push('soda-less-less-7');
    if (maxStreaks.sodaLessLess >= 15) badges.push('soda-less-less-15');

    if (maxStreaks.noSoda >= 1) badges.push('no-soda-1');
    if (maxStreaks.noSoda >= 3) badges.push('no-soda-3');
    if (maxStreaks.noSoda >= 7) badges.push('no-soda-7');
    if (maxStreaks.noSoda >= 15) badges.push('no-soda-15');
    if (maxStreaks.noSoda >= 30) badges.push('no-soda-30');

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
