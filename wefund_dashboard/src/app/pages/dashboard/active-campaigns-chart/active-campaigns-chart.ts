import { Component, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { IndicatorService } from '../../../services/indicator.service';
import { DatePeriod } from '../../../models/indicators.model';
import { IndicatorCardComponent } from '../../../components/indicator-card/indicator-card';

@Component({
  selector: 'app-active-campaigns-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, IndicatorCardComponent],
  template: `
    <app-indicator-card title="Active Campaigns Over Period" [loading]="loading">
      <div class="chart-container">
        <canvas baseChart
          [data]="lineChartData"
          [options]="lineChartOptions"
          [type]="lineChartType">
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
export class ActiveCampaignsChartComponent implements OnInit {
  @Input() set period(val: DatePeriod) {
    if (val.from && val.to) {
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
        label: 'Active Campaigns',
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        borderColor: '#38bdf8',
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#38bdf8',
        fill: 'origin',
        tension: 0.4
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
        titleFont: { family: 'Inter' },
        bodyFont: { family: 'Inter' },
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
    this.indicatorService.getActiveCampaigns(this._period).subscribe({
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
