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
  hasDataForPeriod: boolean = true;

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

    this.hasDataForPeriod = entries.length > 0;

    const existingMoodChart = Chart.getChart(this.moodChartCanvas.nativeElement);
    if (existingMoodChart) existingMoodChart.destroy();

    const existingCryChart = Chart.getChart(this.cryChartCanvas.nativeElement);
    if (existingCryChart) existingCryChart.destroy();

    if (!this.hasDataForPeriod) {
      return;
    }

    setTimeout(() => {
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
              font: { family: 'Outfit', size: 14 },
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
              font: { family: 'Outfit', size: 14 },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'rectRounded'
            }
          }
        },
        cutout: '70%'
      }
    });
    }, 0);
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
    if (entries.length < 2) {
      this.insights = ["Continue de remplir ton journal chaque soir pour débloquer de nouvelles analyses sur tes journées !"];
      return;
    }

    this.insights = [];
    const totalEntries = entries.length;

    // 1. Humeur globale
    const happyDays = entries.filter((e: any) => this.moodToScore(e.moodEmoji) >= 4).length;
    const badDays = entries.filter((e: any) => this.moodToScore(e.moodEmoji) <= 2).length;

    if (happyDays > totalEntries / 2) {
      this.insights.push("Tu as passé de très belles journées récemment, ta dynamique positive est bien présente ! ✨");
    } else if (badDays > totalEntries / 2) {
      this.insights.push("Cette période semble te demander beaucoup d'énergie. N'oublie pas de t'accorder de la douceur. 🤍");
    }

    // 2. Sommeil et humeur générale
    const goodSleepEntries = entries.filter((e: any) => e.sleepQuality === 'Très bien' || e.sleepQuality === 'Plutôt bien');
    const badSleepEntries = entries.filter((e: any) => e.sleepQuality === 'Pas assez' || e.sleepQuality === 'Très mal');

    const avgMoodGoodSleep = goodSleepEntries.reduce((acc: number, e: any) => acc + this.moodToScore(e.moodEmoji), 0) / (goodSleepEntries.length || 1);
    const avgMoodBadSleep = badSleepEntries.reduce((acc: number, e: any) => acc + this.moodToScore(e.moodEmoji), 0) / (badSleepEntries.length || 1);

    if (goodSleepEntries.length > 0 && badSleepEntries.length > 0 && avgMoodGoodSleep > avgMoodBadSleep + 0.5) {
      this.insights.push("Il y a un lien clair : les nuits où tu te reposes bien, l'ensemble de ta journée est nettement plus lumineuse. Ton sommeil est ton meilleur allié ! 🌙");
    } else if (badSleepEntries.length > totalEntries / 2) {
      this.insights.push("Ton sommeil semble perturbé dernièrement, ce qui peut te rendre plus vulnérable en journée. Essaye d'alléger tes soirées. 🛌");
    }

    // 3. Sommeil et émotions négatives (Stress/Anxiété)
    const stressedEntries = entries.filter((e: any) => e.emotions?.includes('Stress') || e.emotions?.includes('Anxiété') || e.emotions?.includes('Fatigue'));
    const badSleepInStressed = stressedEntries.filter((e: any) => e.sleepQuality === 'Pas assez' || e.sleepQuality === 'Très mal').length;

    if (stressedEntries.length > 2 && badSleepInStressed > stressedEntries.length / 2) {
      this.insights.push("Tes journées marquées par le stress font souvent suite à un manque de sommeil. Reposer ton esprit t'aiderait à aborder tes journées plus sereinement. 🔋");
    }

    // 4. Activités et bien-être
    const allActivitiesOnHappyDays = entries
      .filter((e: any) => this.moodToScore(e.moodEmoji) >= 4)
      .flatMap((e: any) => e.activities || []);

    if (allActivitiesOnHappyDays.length > 0) {
      const activityCounts: Record<string, number> = {};
      allActivitiesOnHappyDays.forEach((a: string) => activityCounts[a] = (activityCounts[a] || 0) + 1);
      const topActivity = Object.keys(activityCounts).reduce((a, b) => activityCounts[a] > activityCounts[b] ? a : b);

      if (activityCounts[topActivity] >= 2) {
        this.insights.push(`L'activité "${topActivity}" semble être un vrai moteur : tu la pratiques souvent lors de tes meilleures journées ! 🎨`);
      }
    }

    // 5. Libération émotionnelle (Pleurs)
    const criedDays = entries.filter((e: any) => e.cried !== 'Pas du tout').length;
    if (criedDays === 0 && totalEntries >= 5) {
      this.insights.push("Aucune larme récemment ! Tu sembles traverser tes journées avec un bel équilibre émotionnel. ☀️");
    } else if (criedDays < totalEntries / 4 && totalEntries > 5) {
      this.insights.push("Tu pleures de moins en moins. C'est le signe que tu as trouvé plus d'apaisement dans ton quotidien. 🌱");
    } else if (criedDays >= totalEntries / 2) {
      this.insights.push("Tu as beaucoup pleuré dernièrement. Libérer ces tensions en fin de journée est sain, sois indulgente avec toi-même. 🌧️");
    }

    // 6. Gratitude et introspection
    const gratitudeCount = entries.filter((e: any) => e.gratitude && e.gratitude.trim() !== '').length;
    if (gratitudeCount > totalEntries / 2) {
      this.insights.push("Tu prends souvent le temps de clôturer ta journée en notant de la gratitude. Cette habitude t'aide à retenir le positif quoiqu'il arrive ! 🙏");
    }

    const momentsForSelf = entries.filter((e: any) => e.selfMoment && e.selfMoment.trim() !== '').length;
    if (momentsForSelf > totalEntries / 2) {
      this.insights.push("Tu arrives à dédier des moments rien que pour toi régulièrement. C'est un excellent ancrage pour traverser tes journées. 🧘‍♀️");
    }

    // 7. Hydratation et énergie
    const avgWater = entries.reduce((acc: number, e: any) => acc + (e.water || 0), 0) / totalEntries;
    if (avgWater >= 4) {
      this.insights.push("Ton hydratation est au top ! Boire suffisamment d'eau t'aide clairement à maintenir ton niveau d'énergie du matin au soir. 💧");
    } else if (avgWater < 2) {
      this.insights.push("Une meilleure hydratation pourrait t'aider à te sentir plus en forme et à éviter d'éventuelles baisses de régime en journée. 🚰");
    }

    // 8. Résilience et fierté
    const hasPrideInBadDays = entries.filter((e: any) => this.moodToScore(e.moodEmoji) <= 3 && e.pride && e.pride.trim() !== '').length;
    if (hasPrideInBadDays >= 2) {
      this.insights.push("Même lors de journées plus maussades, tu parviens à trouver des motifs de fierté. C'est une immense force de caractère ! 💪");
    }

    // 9. Consommation (Café/Soda)
    const avgCoffee = entries.reduce((acc: number, e: any) => acc + (e.coffee || 0), 0) / totalEntries;
    if (avgCoffee > 3) {
      this.insights.push("Ta consommation de café est assez élevée sur tes journées. Attention à ce que ça ne génère pas de fatigue nerveuse. ☕");
    }

    const avgSoda = entries.reduce((acc: number, e: any) => acc + (e.soda || 0), 0) / totalEntries;
    if (avgSoda < 1 && totalEntries > 5) {
      this.insights.push("Bravo ! Tu as su maintenir une consommation de soda très basse au quotidien, ton corps te dit merci. 🥤");
    }

    // Fill up if there's less than 5
    if (this.insights.length < 5) {
      this.insights.push("Chaque journée résumée ici est un pas de plus vers une meilleure compréhension de tes ressentis. 📖");
      if (this.insights.length < 5) {
        this.insights.push("Continue de détailler tes émotions et activités pour que je puisse t'offrir des analyses encore plus fines. 🔍");
      }
    }

    // Garder un nombre raisonnable d'insights (max 3) pour ne pas surcharger la page
    this.insights = this.insights.slice(0, 3);
  }
}
