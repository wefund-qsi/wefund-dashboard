import { Component, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { IndicatorService } from '../../../services/indicator.service';
import { DatePeriod } from '../../../models/indicators.model';
import { IndicatorCardComponent } from '../../../components/indicator-card/indicator-card';

@Component({
  selector: 'app-total-amount-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, IndicatorCardComponent],
  template: `
    <app-indicator-card title="Total Amount Collected (€)" [loading]="loading">
      <div class="chart-container">
        <canvas baseChart
          [data]="barChartData"
          [options]="barChartOptions"
          [type]="barChartType">
        </canvas>
      </div>
    </app-indicator-card>
  `,
  styles: `
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `
})
export class TotalAmountChartComponent implements OnInit {
  @Input() set period(val: DatePeriod) {
    if (val.from && val.to) {
      this._period = val;
      this.loadData();
    }
  }
  private _period!: DatePeriod;

  loading = false;

  public barChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Amount (€)',
        backgroundColor: '#818cf8',
        borderColor: '#818cf8',
        borderRadius: 6,
        borderWidth: 0,
        hoverBackgroundColor: '#a5b4fc'
      }
    ],
    labels: []
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Inter' },
        bodyFont: { family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (ctx) => `€${(ctx.parsed.y ?? 0).toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#94a3b8',
          callback: (value) => `€${value}`
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  public barChartType: ChartType = 'bar';

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
    this.indicatorService.getTotalAmountCollected(this._period).subscribe({
      next: (res) => {
        this.barChartData = {
          labels: res.data.map(d => d.date),
          datasets: [{
            ...this.barChartData.datasets[0],
            data: res.data.map(d => d.amount_eur)
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
