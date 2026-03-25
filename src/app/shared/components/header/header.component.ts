import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, Key, LogOut, ChevronDown, Lock, Activity, CheckCircle } from 'lucide-angular';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <header class="bg-white border-b border-health-border px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div class="relative w-full max-w-md hidden md:block">
            <lucide-icon [img]="SearchIcon" class="absolute left-3 top-1/2 -translate-y-1/2 text-health-muted"
                size="18"></lucide-icon>
            <input type="text" [placeholder]="searchPlaceholder"
                class="w-full bg-health-bg border border-transparent focus:border-health-teal/30 focus:bg-white rounded-xl py-2 pl-10 pr-4 text-14 transition-all focus:outline-none">
        </div>

        <div class="flex items-center gap-6">
            <div class="flex items-center gap-3 pl-6 border-l border-health-border relative">
                <div class="text-right hidden sm:block">
                    <p class="text-13 font-bold text-health-text">{{ username }}</p>
                    <p class="text-13 text-health-muted uppercase font-bold tracking-wider">{{ isSuperuser ? 'Administrator' : 'Premium Account' }}</p>
                </div>
                <button (click)="toggleProfileMenu()"
                    class="w-10 h-10 bg-health-lightTeal rounded-full flex items-center justify-center font-bold text-health-teal border border-health-teal/10 text-15 cursor-pointer hover:ring-2 ring-health-teal/20 transition-all">
                    {{ username.charAt(0).toUpperCase() }}
                </button>

                <!-- Profile Dropdown -->
                <div *ngIf="showProfileMenu" class="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-health-border py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div class="px-4 py-3 border-b border-health-border mb-1">
                        <p class="text-13 font-bold text-health-text">{{ username }}</p>
                        <p class="text-12 text-health-muted">{{ isSuperuser ? 'Super Admin' : 'Valued Member' }}</p>
                    </div>
                    <button (click)="openResetModal()" class="w-full flex items-center gap-3 px-4 py-2.5 text-13 text-health-text hover:bg-health-bg transition-colors border-none bg-transparent cursor-pointer text-left">
                        <lucide-icon [img]="KeyIcon" size="16" class="text-health-teal"></lucide-icon>
                        Change Password
                    </button>
                    <button (click)="onLogout()" class="w-full flex items-center gap-3 px-4 py-2.5 text-13 text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer text-left">
                        <lucide-icon [img]="LogOutIcon" size="16"></lucide-icon>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Password Reset Modal -->
    <div *ngIf="showResetModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div class="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button (click)="showResetModal = false" class="absolute top-6 right-6 text-health-muted hover:text-health-text border-none bg-transparent cursor-pointer">
                <lucide-icon [img]="ChevronDownIcon" class="rotate-180" size="24"></lucide-icon>
            </button>
            
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-health-lightTeal rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <lucide-icon [img]="LockIcon" class="text-health-teal" size="32"></lucide-icon>
                </div>
                <!-- Step 1: Initial Confirmation -->
                <div *ngIf="!resetConfirmed && !resetSuccess" class="text-center py-4 animate-in fade-in duration-300">
                    <p class="text-14 text-health-muted mb-8 italic">Are you sure you want to change your current password? You will need to use the new password for future logins.</p>
                    <div class="flex gap-3">
                        <button (click)="showResetModal = false" class="flex-1 px-6 py-3 border border-health-border rounded-xl text-14 font-bold text-health-text hover:bg-health-bg transition-colors cursor-pointer bg-white">
                            No, Cancel
                        </button>
                        <button (click)="resetConfirmed = true" class="flex-1 btn-primary py-3.5 shadow-lg shadow-health-teal/20">
                            Yes, Reset
                        </button>
                    </div>
                </div>

                <!-- Step 2: Password Input -->
                <div *ngIf="resetConfirmed && !resetSuccess" class="space-y-4 animate-in fade-in duration-300">
                    <div class="space-y-1.5">
                        <label class="text-12 font-bold text-health-muted uppercase tracking-wider ml-1 text-left block">New Password</label>
                        <div class="relative">
                            <lucide-icon [img]="KeyIcon" class="absolute left-4 top-1/2 -translate-y-1/2 text-health-muted" size="18"></lucide-icon>
                            <input [(ngModel)]="resetPasswordValue" type="password" placeholder="••••••••"
                                class="w-full bg-health-bg border border-health-border focus:border-health-teal rounded-xl py-3 pl-12 pr-4 text-14 transition-all focus:outline-none placeholder:text-health-muted/50">
                        </div>
                    </div>

                    <div *ngIf="resetError" class="p-3 bg-red-50 text-red-600 rounded-xl text-13 font-medium flex items-center gap-2">
                        <div class="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                        {{ resetError }}
                    </div>

                    <button (click)="onResetPassword()" 
                        [disabled]="resetLoading"
                        class="btn-primary w-full py-3.5 mt-2 shadow-lg shadow-health-teal/20 disabled:opacity-50">
                        {{ resetLoading ? 'Updating System...' : 'Update Password' }}
                    </button>
                </div>

                <!-- Step 3: Success View -->
                <div *ngIf="resetSuccess" class="text-center py-4 animate-in zoom-in duration-300">
                    <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <lucide-icon [img]="CheckCircleIcon" class="text-green-500" size="24"></lucide-icon>
                    </div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-11 font-bold uppercase tracking-wider mb-2">
                        Status: Complete
                    </div>
                    <h4 class="text-14 font-bold text-health-text mb-1">{{ resetMessage }}</h4>
                    <p class="text-12 text-health-muted mb-6">Your security settings have been updated.</p>
                    <button (click)="showResetModal = false" class="w-full btn-primary py-3 px-6 text-13">
                        Close
                    </button>
                </div>
        </div>
    </div>
  `
})
export class HeaderComponent {
  @Input() username = '';
  @Input() isSuperuser = false;
  @Input() searchPlaceholder = 'Search...';

  showProfileMenu = false;
  showResetModal = false;
  resetPasswordValue = '';
  resetMessage = '';
  resetError = '';
  resetLoading = false;
  resetSuccess = false;
  resetConfirmed = false;

  readonly SearchIcon = Search;
  readonly KeyIcon = Key;
  readonly LogOutIcon = LogOut;
  readonly ChevronDownIcon = ChevronDown;
  readonly LockIcon = Lock;
  readonly CheckCircleIcon = CheckCircle;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openResetModal() {
    this.showResetModal = true;
    this.showProfileMenu = false;
    this.resetMessage = '';
    this.resetError = '';
    this.resetPasswordValue = '';
    this.resetSuccess = false;
    this.resetConfirmed = false;
    this.resetLoading = false;
    this.cdr.detectChanges();
  }

  onResetPassword() {
    if (!this.resetPasswordValue) return;
    this.resetLoading = true;
    this.resetError = '';
    this.cdr.detectChanges();
    
    this.authService.changePassword(this.resetPasswordValue).pipe(
      finalize(() => {
        this.resetLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.resetSuccess = true;
        this.resetMessage = res.message || 'Password updated successfully!';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.resetError = err.error?.message || 'Failed to update password';
        this.cdr.detectChanges();
      }
    });
  }
}
