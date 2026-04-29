import { Injectable, signal } from '@angular/core';
import { Badge } from '../models/journal.model';

@Injectable({
  providedIn: 'root'
})
export class RewardsService {
  newBadge = signal<Badge | null>(null);

  notify(badge: Badge) {
    this.newBadge.set(badge);
  }

  clear() {
    this.newBadge.set(null);
  }
}
