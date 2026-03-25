import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { HealthService } from '../../../core/services/health.service';
import { NgxEchartsModule } from 'ngx-echarts';
import { LucideAngularModule, Activity, PlusCircle, ChevronDown, ChevronRight, FileText, BarChart3, History } from 'lucide-angular';
import { HealthFormComponent } from '../../../shared/components/health-form/health-form.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SeverityChartComponent } from '../../../shared/components/severity-chart/severity-chart.component';
import { finalize } from 'rxjs';
import { HealthRecord, MetricsResponse } from '../../../core/models/health.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, LucideAngularModule, HealthFormComponent, FormsModule, SidebarComponent, HeaderComponent, SeverityChartComponent],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  records: HealthRecord[] = [];
  showForm = false;
  loading = true;
  expandedRecord: number | null = null;
  username = '';
  isSuperuser = false;
  currentTimeRange: '7d' | '1y' = '7d';
  healthSummary = {
    avgSeverity: 0,
    totalLogs: 0,
    topSymptoms: [] as string[],
    latestInsight: ''
  };

  redFlagOptions: any = null;
  riskOptions: any = null;
  metricsData: MetricsResponse | null = null;

  readonly ActivityIcon = Activity;
  readonly PlusCircleIcon = PlusCircle;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronRightIcon = ChevronRight;
  readonly FileTextIcon = FileText;
  readonly HistoryIcon = History;
  readonly StatsIcon = BarChart3;

  constructor(
    private authService: AuthService,
    private healthService: HealthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.username = this.authService.getUsername() || '';
    this.isSuperuser = this.authService.isSuperUser();
    console.log('Dashboard init for user:', this.username);

    // Subscribe to records
    this.healthService.records$.subscribe((records: HealthRecord[]) => {
      console.log('Dashboard records updated:', records);
      this.records = records;
      this.healthSummary.totalLogs = this.records.length;
      this.updateSummary();
      this.cdr.detectChanges();
    });

    // Subscribe to redflags
    this.healthService.redflags$.subscribe((res: any) => {
      console.log('RedFlags updated:', res);
      this.updateRedFlagChart(res);
      this.cdr.detectChanges();
    });

    // Subscribe to risks
    this.healthService.risks$.subscribe((res: any) => {
      console.log('Risks updated:', res);
      this.updateRiskChart(res);
      this.cdr.detectChanges();
    });

    // Subscribe to metrics
    this.healthService.metrics$.subscribe((metrics: MetricsResponse) => {
      console.log('Metrics updated:', metrics);
      this.metricsData = metrics;
      this.cdr.detectChanges();
    });

    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    console.log('Fetching dashboard data with range:', this.currentTimeRange);

    const recordsReq = this.healthService.fetchDashboardRecords().pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }));
    const metricsReq = this.healthService.fetchMetrics();
    const redflagsReq = this.healthService.fetchRedflags(this.currentTimeRange);
    const risksReq = this.healthService.fetchRisks(this.currentTimeRange);

    recordsReq.subscribe({
      next: () => console.log('Dashboard records fetched'),
      error: (err: any) => {
        console.error('Error fetching records:', err);
        if (err.status === 401) this.handleLogout();
      }
    });

    metricsReq.subscribe();
    redflagsReq.subscribe();
    risksReq.subscribe();
  }

  setTimeRange(range: '7d' | '1y') {
    if (this.currentTimeRange === range) return;
    this.currentTimeRange = range;
    this.fetchData();
  }

  updateSummary() {
    try {
      // Calculate top symptoms
      const symptomCounts: Record<string, number> = {};
      this.records.forEach(r => {
        if (r.symptoms) {
          const s = r.symptoms.split(',')[0].trim();
          symptomCounts[s] = (symptomCounts[s] || 0) + 1;
        }
      });
        this.healthSummary.topSymptoms = Object.entries(symptomCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([s]) => s);

      if (this.records.length > 0) {
        this.healthSummary.latestInsight = this.records[0].ai_summary || '';
        const totalSeverity = this.records.reduce((sum, r) => sum + r.ai_severity, 0);
        this.healthSummary.avgSeverity = parseFloat((totalSeverity / this.records.length).toFixed(1));
      }
      console.log('Health summary updated:', this.healthSummary);
    } catch (e) {
      console.error('Error calculating summary:', e);
    }
  }


  updateRedFlagChart(res: any) {
    console.log('Updating Red Flag Chart with:', res);
    const dataPoints = res.counts || res.monthly_counts || [];
    
    if (dataPoints.length === 0 && (!res.recent_flags || res.recent_flags.length === 0)) {
      this.redFlagOptions = null;
      this.cdr.detectChanges();
      return;
    }

    const title = this.currentTimeRange === '7d' ? '7-Day Red Flags' : 'Yearly Red Flag Trend';
    const xAxisData = dataPoints.map((m: any) => m.label || m.month || m.date);
    const seriesData = dataPoints.map((m: any) => m.count || 0);
    
    this.redFlagOptions = {
      title: { text: title, left: 'left', textStyle: { fontSize: 16, color: '#FF6B6B', fontWeight: 'bold' } },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const label = params[0].name;
          const count = params[0].value;
          let details = `<b>${label}</b>: ${count} Flags<br/>`;
          if (res.recent_flags) {
            res.recent_flags.filter((f: any) => (f.date || '').includes(label)).forEach((f: any) => {
              details += `• ${f.name}<br/>`;
            });
          }
          return details;
        }
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: { fontSize: 10 }
      },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{
        data: seriesData,
        type: 'line',
        itemStyle: { color: '#FF6B6B' },
        areaStyle: { opacity: 0.15, color: '#FF6B6B' },
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 3 }
      }]
    };
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  updateRiskChart(res: any) {
    console.log('Updating Risk Chart with:', res);
    const dataPoints = res.counts || res.monthly_counts || [];

    if (dataPoints.length === 0 && (!res.unique_risks || res.unique_risks.length === 0)) {
      this.riskOptions = null;
      this.cdr.detectChanges();
      return;
    }

    const title = this.currentTimeRange === '7d' ? '7-Day Risk Analysis' : 'Yearly Risk Trend';
    const xAxisData = dataPoints.map((m: any) => m.label || m.month || m.date);
    const seriesData = dataPoints.map((m: any) => m.count || 0);

    this.riskOptions = {
      title: { text: title, left: 'left', textStyle: { fontSize: 16, color: '#2AB0B8', fontWeight: 'bold' } },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const label = params[0].name;
          const count = params[0].value;
          let details = `<b>${label}</b>: ${count} Potential Risks<br/>`;
          if (res.unique_risks) {
            const risks = res.unique_risks.filter((r: any) => (r.date || '').includes(label));
            if (risks.length > 0) {
              risks.forEach((r: any) => {
                details += `• ${r.name} (${r.level})<br/>`;
              });
            }
          }
          return details;
        }
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: { fontSize: 10 }
      },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{
        data: seriesData,
        type: 'line',
        itemStyle: { color: '#2AB0B8' },
        areaStyle: { opacity: 0.15, color: '#2AB0B8' },
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 3 }
      }]
    };
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }


  trackById(index: number, item: any) {
    return item.id || index;
  }

  toggleExpand(id: number) {
    this.expandedRecord = this.expandedRecord === id ? null : id;
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onFormSuccess() {
    this.showForm = false;
    this.fetchData();
  }
}
