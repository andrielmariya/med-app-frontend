import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Lock, Key, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-angular';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
  template: `
    <div class="min-h-screen bg-health-bg flex items-center justify-center p-6 relative overflow-hidden">
        <!-- Abstract Background Shapes -->
        <div class="absolute top-0 left-0 w-96 h-96 bg-health-teal/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-health-teal/5 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl"></div>

        <div class="w-full max-w-md relative z-10">
            <!-- Logo Section -->
            <div class="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <div class="bg-white p-4 rounded-3xl shadow-xl shadow-health-teal/10 mb-6 group hover:scale-105 transition-transform">
                    <div class="bg-health-teal p-3 rounded-2xl">
                        <lucide-icon [img]="LockIcon" class="text-white" size="32"></lucide-icon>
                    </div>
                </div>
                <h1 class="text-24 font-black text-health-text tracking-tight uppercase">Set New Password</h1>
                <p class="text-health-muted text-14 mt-2 font-medium">Please enter your new secure password</p>
            </div>

            <!-- Form Card -->
            <div class="bg-white rounded-[32px] p-10 shadow-2xl shadow-health-teal/5 border border-white animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div *ngIf="!resetSuccess; else successMessage" class="space-y-6">
                    <div class="space-y-2">
                        <label class="text-12 font-bold text-health-muted uppercase tracking-wider ml-1">New Password</label>
                        <div class="relative">
                            <lucide-icon [img]="KeyIcon" class="absolute left-4 top-1/2 -translate-y-1/2 text-health-muted transition-colors group-focus-within:text-health-teal" size="20"></lucide-icon>
                            <input [(ngModel)]="newPassword" type="password" placeholder="••••••••"
                                class="w-full bg-health-bg border border-transparent focus:border-health-teal/30 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-14 transition-all focus:outline-none placeholder:text-health-muted/50 font-medium">
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-12 font-bold text-health-muted uppercase tracking-wider ml-1">Confirm Password</label>
                        <div class="relative">
                            <lucide-icon [img]="KeyIcon" class="absolute left-4 top-1/2 -translate-y-1/2 text-health-muted transition-colors group-focus-within:text-health-teal" size="20"></lucide-icon>
                            <input [(ngModel)]="confirmPassword" type="password" placeholder="••••••••"
                                class="w-full bg-health-bg border border-transparent focus:border-health-teal/30 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-14 transition-all focus:outline-none placeholder:text-health-muted/50 font-medium">
                        </div>
                    </div>

                    <div *ngIf="errorMessage" class="p-4 bg-red-50 text-red-600 rounded-2xl text-13 font-bold flex items-center gap-3 animate-in shake duration-500">
                        <lucide-icon [img]="AlertCircleIcon" size="18"></lucide-icon>
                        {{ errorMessage }}
                    </div>

                    <button (click)="onReset()" 
                        [disabled]="isLoading"
                        class="w-full bg-health-teal text-white font-bold py-4 rounded-2xl shadow-xl shadow-health-teal/20 hover:bg-health-teal/90 hover:-translate-y-0.5 active:translate-y-0 transition-all text-15 disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isLoading ? 'Updating Password...' : 'Reset Password' }}
                    </button>
                    
                    <button routerLink="/login" class="w-full py-4 text-health-muted font-bold text-14 hover:text-health-text transition-colors flex items-center justify-center gap-2">
                        <lucide-icon [img]="ArrowLeftIcon" size="16"></lucide-icon>
                        Back to Login
                    </button>
                </div>

                <ng-template #successMessage>
                    <div class="text-center py-6 animate-in zoom-in duration-500">
                        <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <lucide-icon [img]="CheckCircleIcon" class="text-green-500" size="40"></lucide-icon>
                        </div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-12 font-bold uppercase tracking-wider mb-4">
                            <div class="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                            Status: Success
                        </div>
                        <h2 class="text-20 font-bold text-health-text mb-2">Password Updated!</h2>
                        <p class="text-health-muted text-14 mb-8">{{ resetMessage || 'Your password has been reset successfully. You can now log in with your new credentials.' }}</p>
                        <button routerLink="/login" class="btn-primary w-full py-4 shadow-lg shadow-health-teal/20">
                            Navigate to Login
                        </button>
                    </div>
                </ng-template>
            </div>
        </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-in { animation: animate-in 0.5s ease-out fill-mode: both; }
    @keyframes animate-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;
  resetSuccess = false;
  resetMessage = '';

  readonly LockIcon = Lock;
  readonly KeyIcon = Key;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly ArrowLeftIcon = ArrowLeft;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token.';
    }
  }

  onReset() {
    if (!this.token) return;
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.authService.resetPasswordWithToken(this.token, this.newPassword)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.resetSuccess = true;
          this.resetMessage = res.message;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to reset password. The link may be invalid or expired.';
          this.cdr.detectChanges();
        }
      });
  }
}
