import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalService } from '../../services/journal.service';
import { MatIconModule } from '@angular/material/icon';
import { AVAILABLE_BADGES } from '../../models/journal.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  streak = 0;
  unlockedBadges: string[] = [];
  allBadges = AVAILABLE_BADGES;

  constructor(
    private journalService: JournalService
  ) {}

  ngOnInit() {
    const stats = this.journalService.stats();
    this.streak = stats.streak;
    this.unlockedBadges = stats.badges;
  }

  isUnlocked(id: string): boolean {
    return this.unlockedBadges.includes(id);
  }

  exportData() {
    const data = this.journalService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pigloo-care-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
