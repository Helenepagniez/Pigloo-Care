import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Journal } from './pages/journal/journal';
import { Calendar } from './pages/calendar/calendar';
import { Stats } from './pages/stats/stats';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'journal', component: Journal },
  { path: 'calendar', component: Calendar },
  { path: 'stats', component: Stats },
  { path: 'profile', component: Profile },
];
