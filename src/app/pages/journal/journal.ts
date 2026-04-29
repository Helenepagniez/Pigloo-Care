import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TextFieldModule } from '@angular/cdk/text-field';
import { JournalService } from '../../services/journal.service';
import { JournalEntry } from '../../models/journal.model';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatStepperModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatSelectModule, 
    MatChipsModule, 
    MatIconModule,
    TextFieldModule
  ],
  templateUrl: './journal.html',
  styleUrl: './journal.scss'
})
export class Journal implements OnInit {
  step1Form: FormGroup;
  step2Form: FormGroup;
  step3Form: FormGroup;
  step4Form: FormGroup;

  emojis = ['😊', '😐', '😔', '😫', '😡', '😴', '🥳'];
  emotionList = ['Joyeux', 'Stressé', 'Triste', 'Motivé', 'Fatigué', 'Anxieux', 'Calme', 'Excité'];
  activities = ['Travail', 'Repos', 'Amis', 'Famille', 'Sport', 'Loisirs', 'Santé'];
  editingDate: string = '';

  constructor(
    private fb: FormBuilder,
    private journalService: JournalService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.step1Form = this.fb.group({
      water: [0],
      coffee: [0],
      soda: [0],
      sleepQuality: [''],
      mainActivity: ['']
    });

    this.step2Form = this.fb.group({
      moodEmoji: ['', Validators.required],
      emotions: [[]],
      cried: ['']
    });

    this.step3Form = this.fb.group({
      pos1: [''],
      pos2: [''],
      pos3: [''],
      neg1: [''],
      neg2: [''],
      neg3: [''],
      toImprove: ['']
    });

    this.step4Form = this.fb.group({
      gratitude: [''],
      selfMoment: [''],
      pride: ['']
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const today = new Date().toISOString().split('T')[0];
      this.editingDate = params['date'] || today;
      
      const existing = this.journalService.getEntryByDate(this.editingDate);
      if (existing) {
        this.step1Form.patchValue({
          water: existing.water,
          coffee: existing.coffee,
          soda: existing.soda,
          sleepQuality: existing.sleepQuality,
          mainActivity: existing.mainActivity
        });
        this.step2Form.patchValue({
          moodEmoji: existing.moodEmoji,
          emotions: existing.emotions,
          cried: existing.cried
        });
        this.step3Form.patchValue({
          pos1: existing.positives[0] || '',
          pos2: existing.positives[1] || '',
          pos3: existing.positives[2] || '',
          neg1: existing.negatives[0] || '',
          neg2: existing.negatives[1] || '',
          neg3: existing.negatives[2] || '',
          toImprove: existing.toImprove
        });
        this.step4Form.patchValue({
          gratitude: existing.gratitude,
          selfMoment: existing.selfMoment,
          pride: existing.pride
        });
      }
    });
  }

  quit() {
    this.router.navigate(['/home']);
  }

  increment(field: string) {
    const current = this.step1Form.get(field)?.value || 0;
    this.step1Form.get(field)?.setValue(current + 1);
  }

  decrement(field: string) {
    const current = this.step1Form.get(field)?.value || 0;
    if (current > 0) {
      this.step1Form.get(field)?.setValue(current - 1);
    }
  }

  toggleEmotion(emotion: string) {
    const current = this.step2Form.get('emotions')?.value as string[];
    if (current.includes(emotion)) {
      this.step2Form.get('emotions')?.setValue(current.filter((e: string) => e !== emotion));
    } else {
      this.step2Form.get('emotions')?.setValue([...current, emotion]);
    }
  }

  submit() {
    if (this.step1Form.valid && this.step2Form.valid && this.step3Form.valid && this.step4Form.valid) {
      const entry: JournalEntry = {
        date: this.editingDate,
        ...this.step1Form.value,
        ...this.step2Form.value,
        positives: [this.step3Form.value.pos1, this.step3Form.value.pos2, this.step3Form.value.pos3],
        negatives: [this.step3Form.value.neg1, this.step3Form.value.neg2, this.step3Form.value.neg3],
        toImprove: this.step3Form.value.toImprove,
        ...this.step4Form.value
      };
      
      this.journalService.saveEntry(entry);
      this.router.navigate(['/home']);
    }
  }
}
