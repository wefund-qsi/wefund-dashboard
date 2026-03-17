import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { IndicatorService } from '../../../services/indicator.service';
import { IndicatorCardComponent } from '../../../components/indicator-card/indicator-card';

@Component({
  selector: 'app-success-rate-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, IndicatorCardComponent],
  template: `
    <app-indicator-card title="Global Success Rate" [loading]="loading">
      <div class="success-rate-container">
        <div class="chart-wrapper">
          <canvas baseChart
            [data]="doughnutChartData"
            [options]="doughnutChartOptions"
            [type]="doughnutChartType">
          </canvas>
          <div class="percentage-overlay">
            <span class="value">{{ percentage }}%</span>
            <span class="label">Success</span>
          </div>
        </div>
        
        <div class="stats-grid" *ngIf="stats">
          <div class="stat">
            <span class="stat-label">Total</span>
            <span class="stat-value">{{ stats.total_campaigns }}</span>
          </div>
          <div class="stat success">
            <span class="stat-label">Successful</span>
            <span class="stat-value">{{ stats.successful }}</span>
          </div>
          <div class="stat fail">
            <span class="stat-label">Failed</span>
            <span class="stat-value">{{ stats.failed }}</span>
          </div>
        </div>
      </div>
    </app-indicator-card>
  `,
  styles: `
    .success-rate-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }

    .chart-wrapper {
      position: relative;
      height: 250px;
      width: 250px;
    }

    .percentage-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .percentage-overlay .value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-main);
      font-family: 'Outfit';
    }

    .percentage-overlay .label {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      width: 100%;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .stat.success .stat-value { color: var(--success); }
    .stat.fail .stat-value { color: var(--danger); }
  `
})
export class SuccessRateChartComponent implements OnInit {
  loading = false;
  percentage = 0;
  stats: any = null;

  public doughnutChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#22c55e', '#334155'],
        hoverBackgroundColor: ['#4ade80', '#475569'],
        borderWidth: 0,
        cutout: '80%'
      } as any
    ],
    labels: ['Successful', 'Other']
  };

  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };

  public doughnutChartType: ChartType = 'doughnut';

  constructor(
    private indicatorService: IndicatorService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loading = true;
    this.indicatorService.getGlobalSuccessRate().subscribe({
      next: (res) => {
        this.stats = res.data;
        this.percentage = res.data.success_rate_percent;
        this.doughnutChartData = {
          labels: ['Successful', 'Other'],
          datasets: [{
            ...this.doughnutChartData.datasets[0],
            data: [
              res.data.successful,
              res.data.failed + res.data.active
            ]
          }]
        };
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
