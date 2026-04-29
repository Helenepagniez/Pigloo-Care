import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-penguin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './penguin.html',
  styleUrl: './penguin.scss'
})
export class Penguin {
  @Input() state: 'happy' | 'neutral' | 'sad' | 'excited' = 'happy';
  @Input() message: string = 'Coucou ! Je suis Pigloo.';
}
