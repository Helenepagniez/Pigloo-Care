import { Injectable, signal } from '@angular/core';
import { Badge } from '../models/journal.model';

@Injectable({
  providedIn: 'root'
})
export class RewardsService {
  private queue: Badge[] = [];
  newBadge = signal<Badge | null>(null);

  notify(badge: Badge) {
    this.queue.push(badge);
    if (!this.newBadge()) {
      this.showNext();
    }
  }

  clear() {
    this.newBadge.set(null);
    if (this.queue.length > 0) {
      setTimeout(() => this.showNext(), 300);
    }
  }

  private showNext() {
    if (this.queue.length > 0) {
      this.newBadge.set(this.queue.shift() || null);
    }
  }
}
