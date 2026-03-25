import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Activity, LogOut, LayoutDashboard, History, Users, Search, ShieldCheck, Mail, Calendar, Key, Lock, ChevronDown, RotateCcw, Copy, CheckCircle } from 'lucide-angular';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex min-h-screen bg-health-bg text-14">
        <!-- Sidebar -->
        <app-sidebar [isSuperuser]="isSuperuser"></app-sidebar>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
            <!-- Header -->
            <app-header [username]="username" [isSuperuser]="isSuperuser" searchPlaceholder="Search users..."></app-header>

            <!-- Content Area -->
            <div class="p-8 space-y-8">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-15 font-bold text-health-text">User Management</h2>
                        <p class="text-health-muted text-14">View and manage all registered users in the system.</p>
                    </div>
                </div>

                <!-- User Table -->
                <div class="widget-card overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b border-health-border">
                                    <th class="p-4 font-bold text-13 text-health-muted uppercase tracking-wider">User</th>
                                    <th class="p-4 font-bold text-13 text-health-muted uppercase tracking-wider">Status</th>
                                    <th class="p-4 font-bold text-13 text-health-muted uppercase tracking-wider">Joined Date</th>
                                    <th class="p-4 font-bold text-13 text-health-muted uppercase tracking-wider">ID</th>
                                    <th class="p-4 text-right font-bold text-13 text-health-muted uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-health-border">
                                <tr *ngFor="let user of users" class="hover:bg-health-bg/50 transition-colors">
                                    <td class="p-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-health-text font-bold">
                                                {{ user.username.charAt(0).toUpperCase() }}
                                            </div>
                                            <div>
                                                <div class="text-14 font-semibold text-health-text">{{ user.username }}</div>
                                                <div class="text-12 text-health-muted">Active Member</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="p-4">
                                        <span *ngIf="user.is_superuser" class="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-12 font-bold uppercase tracking-wider">
                                            <lucide-icon [img]="ShieldCheckIcon" size="12"></lucide-icon>
                                            System Admin
                                        </span>
                                        <span *ngIf="!user.is_superuser" class="inline-flex items-center gap-1.5 px-3 py-1 bg-health-lightTeal text-health-teal rounded-full text-12 font-bold uppercase tracking-wider">
                                            User
                                        </span>
                                    </td>
                                    <td class="p-4">
                                        <div class="flex items-center gap-2 text-13 text-health-text">
                                            <lucide-icon [img]="CalendarIcon" size="14" class="text-health-muted"></lucide-icon>
                                            {{ user.created_at | date:'mediumDate' }}
                                        </div>
                                    </td>
                                    <td class="p-4">
                                        <span class="text-13 font-mono text-health-muted">#{{ user.id }}</span>
                                    </td>
                                    <td class="p-4 text-right">
                                        <button (click)="openAdminResetModal(user)" 
                                            class="p-2 hover:bg-health-teal/10 text-health-teal rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                                            title="Reset Password">
                                            <lucide-icon [img]="KeyIcon" size="18"></lucide-icon>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div *ngIf="loading" class="py-20 flex flex-col items-center">
                        <div class="w-8 h-8 border-4 border-health-teal border-t-transparent rounded-full animate-spin"></div>
                        <p class="mt-4 text-13 text-health-muted">Loading registered users...</p>
                    </div>

                    <div *ngIf="!loading && users.length === 0" class="py-20 text-center">
                        <lucide-icon [img]="UsersIcon" class="mx-auto text-health-border mb-4 opacity-50" size="48"></lucide-icon>
                        <p class="text-14 text-health-muted">No users found.</p>
                    </div>
                </div>
            </div>

            <!-- Admin Password Reset Modal -->
            <div *ngIf="showAdminResetModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div class="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                    <button (click)="closeAdminResetModal()" class="absolute top-6 right-6 text-health-muted hover:text-health-text border-none bg-transparent cursor-pointer">
                        <lucide-icon [img]="ChevronDownIcon" class="rotate-180" size="24"></lucide-icon>
                    </button>
                    
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-health-lightTeal rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <lucide-icon [img]="generatedResetLink ? CheckCircleIcon : KeyIcon" class="text-health-teal" size="32"></lucide-icon>
                        </div>
                        <h3 class="text-15 font-bold text-health-text">{{ generatedResetLink ? 'Reset Link Ready' : 'Reset Password?' }}</h3>
                        <p class="text-13 text-health-muted mt-2">
                            <span *ngIf="!generatedResetLink">Confirming reset for <b>{{ selectedUser?.username }}</b>. This will generate a secure reset link.</span>
                            <span *ngIf="generatedResetLink">Please share this link with <b>{{ selectedUser?.username }}</b>. It will expire in 1 hour.</span>
                        </p>
                    </div>

                    <div class="space-y-4">
                        <!-- Step 1: Confirmation -->
                        <div *ngIf="!generatedResetLink && !adminResetLoading" class="flex flex-col gap-4 animate-in fade-in duration-300">
                            <p class="text-14 text-health-muted italic">Are you sure you want to generate a reset link for this user? This will invalidate any previous reset tokens.</p>
                            <div class="flex gap-3">
                                <button (click)="closeAdminResetModal()" class="flex-1 px-6 py-3 border border-health-border rounded-xl text-14 font-bold text-health-text hover:bg-health-bg transition-colors cursor-pointer bg-white">
                                    Cancel
                                </button>
                                <button (click)="onGenerateResetLink()" 
                                    class="flex-1 btn-primary py-3.5 shadow-lg shadow-health-teal/20">
                                    Yes, Reset
                                </button>
                            </div>
                        </div>

                        <!-- Loading State -->
                        <div *ngIf="adminResetLoading" class="py-10 text-center animate-in fade-in duration-300">
                            <div class="w-10 h-10 border-4 border-health-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p class="text-14 text-health-text font-bold">Generating Secure Link</p>
                            <p class="text-12 text-health-muted mt-1 italic">Communicating with security server...</p>
                        </div>

                        <!-- Step 2: Display Link -->
                        <div *ngIf="generatedResetLink && !adminResetLoading" class="space-y-4 animate-in zoom-in duration-300">
                            <div class="bg-health-bg p-4 rounded-2xl border border-health-border">
                                <label class="text-11 font-black text-health-muted uppercase tracking-widest mb-2 block">Your Unique Reset Link</label>
                                <div class="relative group">
                                    <input readonly [value]="generatedResetLink" 
                                        class="w-full bg-white border border-health-border rounded-xl py-3 px-4 pr-12 text-13 font-mono text-health-text focus:outline-none">
                                    <button (click)="copyLinkToClipboard()" 
                                        class="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-health-bg rounded-lg transition-colors border-none bg-transparent cursor-pointer text-health-teal">
                                        <lucide-icon [img]="linkCopied ? CheckCircleIcon : CopyIcon" size="18"></lucide-icon>
                                    </button>
                                </div>
                            </div>

                            <div *ngIf="linkCopied" class="flex items-center justify-center gap-2 text-12 font-bold text-health-teal animate-in slide-in-from-top-2">
                                <lucide-icon [img]="CheckCircleIcon" size="14"></lucide-icon>
                                Link copied to clipboard!
                            </div>
                            
                            <button (click)="closeAdminResetModal()" class="w-full btn-primary py-4 mt-2 shadow-lg shadow-health-teal/20">
                                I've saved the link
                            </button>
                        </div>

                        <div *ngIf="adminResetError" class="p-3 bg-red-50 text-red-600 rounded-xl text-13 font-medium flex items-center gap-2">
                            <div class="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                            {{ adminResetError }}
                        </div>
                    </div>
                </div>
            </div>

        </main>
    </div>
  `,
  styleUrls: ['../dashboard/dashboard.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  username = '';
  isSuperuser = false;
  loading = true;

  // Admin Reset Modal State
  showAdminResetModal = false;
  selectedUser: any = null;
  generatedResetLink = '';
  linkCopied = false;
  adminResetError = '';
  adminResetLoading = false;

  readonly UsersIcon = Users;
  readonly CalendarIcon = Calendar;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly KeyIcon = Key;
  readonly LockIcon = Lock;
  readonly ChevronDownIcon = ChevronDown;
  readonly CopyIcon = Copy;
  readonly CheckCircleIcon = CheckCircle;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.username = this.authService.getUsername() || '';
    this.isSuperuser = this.authService.isSuperUser();
    if (!this.isSuperuser) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.authService.getUsersList().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.users = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openAdminResetModal(user: any) {
    this.selectedUser = user;
    this.showAdminResetModal = true;
    this.generatedResetLink = '';
    this.linkCopied = false;
    this.adminResetError = '';
    this.cdr.detectChanges();
  }

  closeAdminResetModal() {
    this.showAdminResetModal = false;
    this.selectedUser = null;
    this.cdr.detectChanges();
  }

  onGenerateResetLink() {
    if (!this.selectedUser) return;
    
    this.adminResetLoading = true;
    this.adminResetError = '';
    
    this.authService.generateResetLink(this.selectedUser.id).pipe(
      finalize(() => {
        this.adminResetLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        const baseUrl = window.location.origin;
        this.generatedResetLink = `${baseUrl}/reset-password?token=${res.token}`;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.adminResetError = err.error?.message || 'Failed to generate reset link';
      }
    });
  }

  copyLinkToClipboard() {
    if (!this.generatedResetLink) return;
    navigator.clipboard.writeText(this.generatedResetLink).then(() => {
      this.linkCopied = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.linkCopied = false;
        this.cdr.detectChanges();
      }, 2000);
    });
  }
}
