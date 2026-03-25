import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HealthService } from '../../../core/services/health.service';
import { LucideAngularModule, Loader2, Activity } from 'lucide-angular';

@Component({
  selector: 'app-health-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './health-form.html'
})
export class HealthFormComponent {
  @Output() success = new EventEmitter<void>();

  symptoms = '';
  details = '';
  modelType = 'gemini'; // Default to gemini
  loading = false;
  error = '';
  readonly Loader2Icon = Loader2;
  readonly ActivityIcon = Activity;

  constructor(private healthService: HealthService) { }

  onSubmit() {
    this.loading = true;
    this.error = '';

    const payload = { 
      symptoms: this.symptoms, 
      details: this.details,
      model_type: this.modelType 
    };

    this.healthService.createHealthRecord(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success.emit();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to submit health record';
      }
    });
  }
}
