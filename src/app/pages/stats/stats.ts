import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalService } from '../../services/journal.service';
import { Chart, registerables } from 'chart.js';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, FormsModule],
  templateUrl: './stats.html',
  styleUrl: './stats.scss'
})
export class Stats implements OnInit, AfterViewInit {
  @ViewChild('moodChart') moodChartCanvas!: ElementRef;
  @ViewChild('cryChart') cryChartCanvas!: ElementRef;
  
  viewType: 'month' | 'year' = 'month';
  insights: string[] = [];

  constructor(private journalService: JournalService) {}

  ngOnInit() {
    this.generateInsights();
  }

  ngAfterViewInit() {
    this.renderCharts();
  }

  renderCharts() {
    const entries = this.journalService.entries();
    
    // Mood Chart
    new Chart(this.moodChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: entries.map((e: any) => e.date.split('-')[2]), // Just day number for clarity
        datasets: [{
          label: 'Humeur',
          data: entries.map((e: any) => this.moodToScore(e.moodEmoji)),
          borderColor: '#B3E5FC',
          backgroundColor: 'rgba(179, 229, 252, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { 
          y: { 
            min: 0, 
            max: 8, 
            ticks: { 
              stepSize: 1,
              callback: (value: any) => ['', '😡', '😔', '😴', '😐', '', '🥳', '😊'][value as number] || ''
            } 
          } 
        }
      }
    });

    // Cry Chart
    const cryCounts = { 'pas du tout': 0, 'un peu': 0, 'beaucoup': 0 };
    entries.forEach((e: any) => {
      const val = e.cried as keyof typeof cryCounts;
      if (cryCounts[val] !== undefined) cryCounts[val]++;
    });
    
    new Chart(this.cryChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Pas du tout', 'Un peu', 'Beaucoup'],
        datasets: [{
          data: Object.values(cryCounts),
          backgroundColor: ['#E1F5FE', '#F8BBD0', '#E1BEE7']
        }]
      },
      options: { 
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  moodToScore(emoji: string): number {
    const map: any = { '😊': 7, '🥳': 6, '😐': 4, '😴': 3, '😔': 2, '😫': 1, '😡': 1 };
    return map[emoji] || 4;
  }

  generateInsights() {
    const entries = this.journalService.entries();
    if (entries.length < 3) {
      this.insights = ["Continuez à remplir votre journal pour obtenir des analyses !"];
      return;
    }
    
    const happyDays = entries.filter((e: any) => this.moodToScore(e.moodEmoji) >= 6).length;
    if (happyDays > entries.length / 2) {
      this.insights.push("Tu es globalement de très bonne humeur en ce moment ! ✨");
    }
    
    const criedDays = entries.filter((e: any) => e.cried !== 'pas du tout').length;
    if (criedDays < entries.length / 4) {
      this.insights.push("Bravo, tu pleures de moins en moins. 🤍");
    }
    
    this.insights.push("Ton sommeil semble influencer ton humeur du matin. 🌙");
  }
}
