import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Penguin } from '../../components/penguin/penguin';
import { JournalService } from '../../services/journal.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, Penguin],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  isCompletedToday = false;
  penguinMessage = 'Bonjour ! Comment te sens-tu aujourd\'hui ?';
  penguinState: 'happy' | 'neutral' | 'sad' | 'excited' = 'happy';

  constructor(private journalService: JournalService) {}

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.isCompletedToday = !!this.journalService.getEntryByDate(today);
    
    if (this.isCompletedToday) {
      this.penguinMessage = 'Félicitations, tu es à jour !';
      this.penguinState = 'excited';
    } else {
      const stats = this.journalService.stats();
      if (stats.streak > 0) {
        this.penguinMessage = `C'est ton ${stats.streak + 1}ème jour consécutif ! Continue comme ça !`;
      }
    }
  }
}
