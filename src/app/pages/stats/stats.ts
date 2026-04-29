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

  constructor(private journalService: JournalService) { }

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
        labels: entries.map((e: any) => e.date.split('-')[2]),
        datasets: [{
          label: 'Humeur',
          data: entries.map((e: any) => this.moodToScore(e.moodEmoji)),
          borderColor: '#005cbb', // Deep blue
          backgroundColor: 'rgba(179, 229, 252, 0.4)', // Primary pastel with transparency
          pointBackgroundColor: '#81D4FA',
          pointBorderColor: '#FFFFFF',
          pointRadius: 5,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#005cbb',
            titleFont: { family: 'Outfit' },
            bodyFont: { family: 'Outfit' }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 6,
            grid: { color: 'rgba(179, 229, 252, 0.2)' },
            ticks: {
              color: '#005cbb',
              stepSize: 1,
              font: { family: 'Outfit', weight: 'bold' },
              callback: (value: any) => ['', '😡', '😔', '😐', '😊', '🥳'][value as number] || ''
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#005cbb',
              font: { family: 'Outfit' }
            }
          }
        }
      }
    });

    // Cry Chart
    const cryCounts = { 'Pas du tout': 0, 'Un peu': 0, 'Beaucoup': 0 };
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
          backgroundColor: ['#E1F5FE', '#B3E5FC', '#81D4FA'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#005cbb',
              font: { family: 'Outfit', size: 12, weight: 'bold' },
              padding: 20
            }
          }
        },
        cutout: '70%'
      }
    });
  }

  moodToScore(icon: string): number {
    const map: any = {
      'celebration': 5,
      'sentiment_very_satisfied': 4,
      'sentiment_neutral': 3,
      'bedtime': 3,
      'sentiment_dissatisfied': 2,
      'sentiment_very_dissatisfied': 1,
      'mood_bad': 1,
      // Fallback for old emojis
      '😊': 4, '🥳': 5, '😐': 3, '😴': 3, '😔': 2, '😫': 1, '😡': 1
    };
    return map[icon] || 3;
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

    const criedDays = entries.filter((e: any) => e.cried !== 'Pas du tout').length;
    if (criedDays < entries.length / 4) {
      this.insights.push("Bravo, tu pleures de moins en moins. 🤍");
    }

    this.insights.push("Ton sommeil semble influencer ton humeur du matin. 🌙");
  }
}
