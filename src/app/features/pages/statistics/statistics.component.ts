import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, BarChart3, TrendingUp, Activity } from 'lucide-angular';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SeverityChartComponent } from '../../../shared/components/severity-chart/severity-chart.component';
import { HealthService } from '../../../core/services/health.service';
import { AuthService } from '../../../core/services/auth.service';
import { MetricsResponse } from '../../../core/models/health.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SidebarComponent, HeaderComponent, SeverityChartComponent],
  template: `
    <div class="flex min-h-screen bg-health-bg font-inter text-14">
        <app-sidebar [isSuperuser]="isSuperuser"></app-sidebar>
        
        <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <app-header [username]="username" [isSuperuser]="isSuperuser"></app-header>
            
            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div class="max-w-7xl mx-auto space-y-8">
                    <!-- Page Header -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div class="animate-in fade-in slide-in-from-left duration-700">
                            <h2 class="text-28 font-black text-health-text tracking-tight uppercase flex items-center gap-3">
                                Analytics <span class="text-health-teal text-15 font-bold px-3 py-1 bg-health-teal/10 rounded-full tracking-normal">Real-time</span>
                            </h2>
                            <p class="text-health-muted mt-2 font-medium flex items-center gap-2">
                                <lucide-icon [img]="TrendingUpIcon" size="16" class="text-health-teal"></lucide-icon>
                                Visualize and analyze your symptom trends and health statistics.
                            </p>
                        </div>
                    </div>

                    <!-- Main Chart Section -->
                    <div class="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom duration-1000">
                        <div class="bg-white rounded-[32px] p-8 shadow-xl shadow-health-teal/5 border border-health-border relative overflow-hidden group">
                           <div class="flex items-center gap-3 mb-8">
                                <div class="w-10 h-10 bg-health-teal/10 rounded-xl flex items-center justify-center">
                                    <lucide-icon [img]="StatsIcon" class="text-health-teal" size="20"></lucide-icon>
                                </div>
                                <div>
                                    <h3 class="text-15 font-black text-health-text uppercase tracking-wider">Severity Trends</h3>
                                    <p class="text-12 text-health-muted">Long-term analysis of symptom intensity</p>
                                </div>
                           </div>
                           
                           <div *ngIf="loading" class="h-[350px] flex flex-col items-center justify-center text-center">
                                <div class="w-12 h-12 border-4 border-health-teal border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p class="text-14 text-health-muted font-bold tracking-wider uppercase">Loading Statistics...</p>
                           </div>

                           <div *ngIf="!loading">
                               <app-severity-chart [metrics]="metricsData"></app-severity-chart>
                           </div>
                        </div>
                    </div>

                    <!-- Quick Stats Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                        <div class="bg-white p-6 rounded-3xl border border-health-border shadow-lg shadow-health-teal/5 hover:shadow-health-teal/10 transition-all hover:-translate-y-1">
                            <div class="w-12 h-12 bg-health-teal/5 rounded-2xl flex items-center justify-center mb-4">
                                <lucide-icon [img]="ActivityIcon" class="text-health-teal" size="24"></lucide-icon>
                            </div>
                            <p class="text-12 font-bold text-health-muted uppercase tracking-widest">Data Accuracy</p>
                            <h4 class="text-24 font-black text-health-text mt-1">98.5%</h4>
                            <p class="text-12 text-green-500 font-bold mt-2 font-inter tracking-tight flex items-center gap-1">
                                <span class="bg-green-100 px-1.5 py-0.5 rounded">+0.2%</span> from last week
                            </p>
                        </div>
                        
                        <div class="bg-health-text p-6 rounded-3xl border border-health-text shadow-xl hover:-translate-y-1 transition-all">
                             <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                                <lucide-icon [img]="TrendingUpIcon" class="text-health-teal" size="24"></lucide-icon>
                            </div>
                            <p class="text-12 font-bold text-white/50 uppercase tracking-widest">Active Monitoring</p>
                            <h4 class="text-24 font-black text-white mt-1">Continuous</h4>
                            <p class="text-12 text-health-teal font-bold mt-2 font-inter tracking-tight">Active since account creation</p>
                        </div>

                         <div class="bg-white p-6 rounded-3xl border border-health-border shadow-lg shadow-health-teal/5 hover:shadow-health-teal/10 transition-all hover:-translate-y-1">
                             <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                                <lucide-icon [img]="StatsIcon" class="text-indigo-500" size="24"></lucide-icon>
                            </div>
                            <p class="text-12 font-bold text-health-muted uppercase tracking-widest">Analysis Models</p>
                            <h4 class="text-24 font-black text-health-text mt-1">Advanced AI</h4>
                            <p class="text-12 text-health-muted font-bold mt-2 font-inter tracking-tight">Using Llama-3 Analysis</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  `
})
export class StatisticsComponent implements OnInit {
  username = '';
  isSuperuser = false;
  metricsData: MetricsResponse | null = null;
  loading = true;

  readonly StatsIcon = BarChart3;
  readonly TrendingUpIcon = TrendingUp;
  readonly ActivityIcon = Activity;

  constructor(
    private authService: AuthService,
    private healthService: HealthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.username = this.authService.getUsername() || '';
    this.isSuperuser = this.authService.isSuperUser();

    this.healthService.metrics$.subscribe(metrics => {
      this.metricsData = metrics;
      this.cdr.detectChanges();
    });

    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    this.healthService.fetchMetrics().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe();
  }
}
