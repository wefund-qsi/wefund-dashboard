import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { IndicatorService } from '../../../services/indicator.service';
import { DatePeriod } from '../../../models/indicators.model';
import { IndicatorCardComponent } from '../../../components/indicator-card/indicator-card';

@Component({
  selector: 'app-contributions-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, IndicatorCardComponent],
  template: `
    <app-indicator-card title="Total Contributions Over Period" [loading]="loading">
      <div class="chart-container" *ngIf="lineChartData.datasets[0].data.length > 0">
        <canvas baseChart
          [data]="lineChartData"
          [options]="lineChartOptions"
          [type]="lineChartType">
        </canvas>
      </div>
      <div class="no-data" *ngIf="!loading && lineChartData.datasets[0].data.length === 0">
        No data available for this period.
      </div>
    </app-indicator-card>
  `,
  styles: `
    .chart-container {
      position: relative;
      height: 350px;
      width: 100%;
    }
    .no-data {
      height: 350px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
    }
  `
})
export class ContributionsChartComponent implements OnInit {
  @Input() set period(val: DatePeriod) {
    if (val && val.from && val.to) {
      this._period = val;
      this.loadData();
    }
  }
  private _period!: DatePeriod;

  loading = false;

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Contributions',
        backgroundColor: 'rgba(129, 140, 248, 0.2)',
        borderColor: '#818cf8',
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#818cf8',
        fill: 'origin',
        tension: 0.3
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  public lineChartType: ChartType = 'line';

  constructor(
    private indicatorService: IndicatorService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (this._period) {
      this.loadData();
    }
  }

  private loadData() {
    if (!this._period) return;
    this.loading = true;
    this.indicatorService.getTotalContributions(this._period).subscribe({
      next: (res) => {
        this.lineChartData = {
          labels: res.data.map(d => d.date),
          datasets: [{
            ...this.lineChartData.datasets[0],
            data: res.data.map(d => d.count)
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
