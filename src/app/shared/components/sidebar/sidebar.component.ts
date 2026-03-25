import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Activity, LayoutDashboard, History, BarChart3, Users, LogOut } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <aside class="hidden lg:flex flex-col w-64 bg-white border-r border-health-border py-8 px-4 z-10 shrink-0 h-screen sticky top-0">
        <div class="flex items-center gap-3 px-4 mb-10">
            <div class="bg-health-teal p-2 rounded-xl">
                <lucide-icon [img]="ActivityIcon" class="text-white" size="24"></lucide-icon>
            </div>
            <h1 class="text-15 font-extrabold text-health-text tracking-tight uppercase">Healthpro<span
                    class="text-health-teal">+</span></h1>
        </div>

        <nav class="flex-1 space-y-2">
            <div class="nav-item text-14 cursor-pointer" routerLink="/dashboard" routerLinkActive="active">
                <lucide-icon [img]="DashboardIcon" size="20"></lucide-icon>
                Dashboard
            </div>
            <div class="nav-item text-14 cursor-pointer" routerLink="/history" routerLinkActive="active">
                <lucide-icon [img]="HistoryIcon" size="20"></lucide-icon>
                History
            </div>
            <div class="nav-item text-14 cursor-pointer" routerLink="/statistics" routerLinkActive="active">
                <lucide-icon [img]="StatsIcon" size="20"></lucide-icon>
                Statistics
            </div>
            <div *ngIf="isSuperuser" class="nav-item text-14 cursor-pointer" routerLink="/admin/users" routerLinkActive="active">
                <lucide-icon [img]="UsersIcon" size="20"></lucide-icon>
                User Management
            </div>
        </nav>

        <div class="mt-auto pt-6 border-t border-health-border">
            <button (click)="onLogout()"
                class="nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-600 border-none bg-transparent text-14 cursor-pointer">
                <lucide-icon [img]="LogOutIcon" size="20"></lucide-icon>
                Exit
            </button>
        </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() isSuperuser = false;

  readonly ActivityIcon = Activity;
  readonly DashboardIcon = LayoutDashboard;
  readonly HistoryIcon = History;
  readonly StatsIcon = BarChart3;
  readonly UsersIcon = Users;
  readonly LogOutIcon = LogOut;

  constructor(private authService: AuthService, private router: Router) {}

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
