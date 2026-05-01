import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-penguin',
  imports: [CommonModule, MatIcon],
  templateUrl: './penguin.html',
  styleUrl: './penguin.scss'
})
export class Penguin {
  @Input() state: 'happy' | 'neutral' | 'sad' | 'excited' = 'happy';
  @Input() message: string = 'Coucou ! Je suis Pigloo.';
  imagePath: string = environment.imagePath;
}
