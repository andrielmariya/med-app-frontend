import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { LucideAngularModule, BarChart3 } from 'lucide-angular';
import { MetricsResponse } from '../../../core/models/health.model';

@Component({
  selector: 'app-severity-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, LucideAngularModule],
  template: `
    <div class="widget-card h-[350px] col-span-full">
        <div *ngIf="options; else noSeverity" echarts [options]="options" class="w-full h-full"></div>
        <ng-template #noSeverity>
            <div class="w-full h-full flex flex-col items-center justify-center text-center p-6">
                <lucide-icon [img]="StatsIcon" class="text-health-border mb-3" size="32"></lucide-icon>
                <h4 class="text-14 font-bold text-health-text">No Severity Data</h4>
                <p class="text-13 text-health-muted mt-1">Submit health logs to visualize symptom severity trends over time.</p>
            </div>
        </ng-template>
    </div>
  `
})
export class SeverityChartComponent implements OnChanges {
  @Input() metrics: MetricsResponse | null = null;
  options: any = null;

  readonly StatsIcon = BarChart3;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['metrics']) {
      this.updateChart();
    }
  }

  private updateChart() {
    if (!this.metrics || !this.metrics['severity'] || this.metrics['severity'].length === 0) {
      this.options = null;
      return;
    }

    const data = [...this.metrics['severity']].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const xAxisData = data.map(m => new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' }));
    const seriesData = data.map(m => m.value);

    this.options = {
      title: { 
        text: 'Severity Trend (Last 30 Days)', 
        left: 'left', 
        textStyle: { fontSize: 16, color: '#6366f1', fontWeight: 'bold' } 
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          return `<b>${params[0].name}</b><br/>Severity: ${params[0].value}/10`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: { fontSize: 10, color: '#94a3b8' },
        axisLine: { lineStyle: { color: '#e2e8f0' } }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 10,
        interval: 2,
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
      },
      series: [{
        data: seriesData,
        type: 'line',
        itemStyle: { color: '#6366f1' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.2)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0)' }
            ]
          }
        },
        smooth: true,
        symbolSize: 10,
        lineStyle: { width: 4 }
      }]
    };
  }
}
