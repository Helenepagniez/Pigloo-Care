import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { ThemeService } from './services/theme.service';
import { RewardsService } from './services/rewards.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, CommonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  constructor(
    public themeService: ThemeService,
    public rewardsService: RewardsService
  ) {}
}
