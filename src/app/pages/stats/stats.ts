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

  emotionGroupsData = [
    { label: 'Positives', color: '#A5D6A7', emotions: ['Joie', 'Motivation', 'Excitation', 'Fierté', 'Confiance', 'Espoir', 'Sérénité'] },
    { label: 'Tristesse & Mélancolie', color: '#90CAF9', emotions: ['Tristesse', 'Mélancolie', 'Nostalgie', 'Solitude', 'Ennui', 'Flemme'] },
    { label: 'Négatives intenses', color: '#EF9A9A', emotions: ['Colère', 'Irritation', 'Dégoût', 'Honte', 'Culpabilité', 'Peur'] },
    { label: 'Stress & Anxiété', color: '#FFCC80', emotions: ['Stress', 'Anxiété', 'Fatigue'] },
    { label: 'Autres', color: '#CE93D8', emotions: ['Surprise', 'Envie', 'Calme'] }
  ];

  renderCharts() {
    let entries = this.journalService.entries();
    const now = new Date();

    if (this.viewType === 'month') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      entries = entries.filter((e: any) => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    } else {
      const currentYear = now.getFullYear();
      entries = entries.filter((e: any) => {
        const d = new Date(e.date);
        return d.getFullYear() === currentYear;
      });
    }

    const existingMoodChart = Chart.getChart(this.moodChartCanvas.nativeElement);
    if (existingMoodChart) existingMoodChart.destroy();

    const existingCryChart = Chart.getChart(this.cryChartCanvas.nativeElement);
    if (existingCryChart) existingCryChart.destroy();

    // Emotion Pie Chart
    const emotionCounts = {
      'Positives': 0,
      'Tristesse & Mélancolie': 0,
      'Négatives intenses': 0,
      'Stress & Anxiété': 0,
      'Autres': 0
    };

    entries.forEach((e: any) => {
      if (e.emotions && Array.isArray(e.emotions)) {
        e.emotions.forEach((em: string) => {
          const group = this.emotionGroupsData.find(g => g.emotions.includes(em));
          if (group) {
            emotionCounts[group.label as keyof typeof emotionCounts]++;
          }
        });
      }
    });

    const emotionLabels = Object.keys(emotionCounts);
    const emotionData = Object.values(emotionCounts);
    const emotionColors = this.emotionGroupsData.map(g => g.color);

    new Chart(this.moodChartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: emotionLabels,
        datasets: [{
          data: emotionData,
          backgroundColor: emotionColors,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'var(--text-color)',
              font: { family: 'Outfit', size: 12 },
              padding: 10,
              usePointStyle: true,
              pointStyle: 'rectRounded'
            }
          },
          tooltip: {
            backgroundColor: '#005cbb',
            titleFont: { family: 'Outfit' },
            bodyFont: { family: 'Outfit' },
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const dataset = context.dataset.data as number[];
                const total = dataset.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${percentage}% (${value})`;
              }
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
          backgroundColor: ['#A5D6A7', '#FFCC80', '#EF9A9A'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'var(--text-color)',
              font: { family: 'Outfit', size: 12 },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'rectRounded'
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

    const happyDays = entries.filter((e: any) => this.moodToScore(e.moodEmoji) >= 4).length;
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
