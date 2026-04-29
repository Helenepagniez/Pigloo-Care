import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalService } from '../../services/journal.service';
import { JournalEntry } from '../../models/journal.model';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class Calendar implements OnInit {
  currentDate = new Date();
  days: Date[] = [];
  entries: JournalEntry[] = [];
  selectedEntry: JournalEntry | null = null;
  showDeleteConfirm = false;

  constructor(
    private journalService: JournalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.generateCalendar();
    this.entries = this.journalService.entries();
  }

  generateCalendar() {
    const start = startOfMonth(this.currentDate);
    const end = endOfMonth(this.currentDate);
    this.days = eachDayOfInterval({ start, end });
  }

  getEntryForDay(day: Date): JournalEntry | undefined {
    const dateStr = format(day, 'yyyy-MM-dd');
    return this.entries.find((e: JournalEntry) => e.date === dateStr);
  }

  selectDay(day: Date) {
    this.selectedEntry = this.getEntryForDay(day) || null;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return format(parseISO(dateStr), 'dd-MM-yyyy');
  }

  getMonthName() {
    const name = format(this.currentDate, 'MMMM yyyy', { locale: fr });
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  getMoodColor(mood: string): string {
    const map: any = {
      '🥳': '#A5D6A7', // Green
      '😊': '#A5D6A7', // Green
      '😐': '#90CAF9', // Blue
      '😴': '#90CAF9', // Blue
      '😔': '#FFCC80', // Orange
      '😫': '#FFCC80', // Orange
      '😡': '#EF9A9A'  // Red
    };
    return map[mood] || 'transparent';
  }

  deleteEntry() {
    if (this.selectedEntry) {
      this.journalService.deleteEntry(this.selectedEntry.date);
      this.entries = this.journalService.entries();
      this.selectedEntry = null;
      this.showDeleteConfirm = false;
    }
  }

  editEntry() {
    if (this.selectedEntry) {
      this.router.navigate(['/journal'], { queryParams: { date: this.selectedEntry.date } });
    }
  }
}
