import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Observable } from 'rxjs';
import { IndicatorService, RawDataPoint } from '../../services/indicator.service';

interface IndicatorOption {
  id: string;
  label: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  template: `
    <div class="dashboard-container">
      <div class="controls-wrapper">
        <div class="control-item">
          <label for="indicator-select" class="control-label">Indicateur</label>
          <select 
            id="indicator-select" 
            [(ngModel)]="selectedIndicatorId" 
            (change)="loadData()"
            class="styled-select"
          >
            <option *ngFor="let option of indicatorOptions" [value]="option.id">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="control-item">
          <label class="control-label">Période précise</label>
          <div class="date-range">
            <input 
              type="date" 
              [(ngModel)]="startDate" 
              (change)="loadData()"
              class="styled-input"
              aria-label="Date de début"
            >
            <span class="date-separator">au</span>
            <input 
              type="date" 
              [(ngModel)]="endDate" 
              (change)="loadData()"
              class="styled-input"
              aria-label="Date de fin"
            >
          </div>
        </div>
      </div>

      <div class="chart-wrapper" *ngIf="chartData()">
        <canvas baseChart
          role="img"
          [attr.aria-label]="'Graphique : ' + selectedIndicatorLabel"
          [data]="chartData()!"
          [options]="chartOptions"
          [type]="chartType">
        </canvas>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2.5rem;
      background: white;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
      width: 100%;
      max-width: 1000px;
      border: 1px solid #f1f5f9;
    }

    .controls-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 3rem;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .control-item {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      flex: 1;
      min-width: 250px;
    }

    .control-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .styled-select, .styled-input {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.95rem;
      color: #1e293b;
      font-weight: 500;
      transition: all 0.2s ease;
      width: 100%;
      outline: none;
    }

    .styled-select:focus, .styled-input:focus {
      border-color: #3b82f6;
      background: white;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .date-separator {
      color: #94a3b8;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .chart-wrapper {
      position: relative;
      height: 450px;
      width: 100%;
    }

    @media (max-width: 768px) {
      .controls-wrapper {
        flex-direction: column;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  indicatorOptions: IndicatorOption[] = [
    { id: 'campaigns', label: 'Campagnes Actives', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { id: 'collected', label: 'Montant Collecté', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { id: 'success', label: 'Taux de Succès', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
  ];

  selectedIndicatorId: string = 'campaigns';
  startDate: string = '';
  endDate: string = '';

  chartData = signal<ChartData<'line'> | null>(null);
  chartType: ChartType = 'line';

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#94a3b8' },
        grid: { color: '#f1f5f9' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      }
    }
  };

  get selectedIndicatorLabel(): string {
    return this.indicatorOptions.find(o => o.id === this.selectedIndicatorId)?.label ?? '';
  }

  constructor(private indicatorService: IndicatorService) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    this.endDate = end.toISOString().split('T')[0];
    this.startDate = start.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    let obs$: Observable<RawDataPoint[]>;
    const selectedOption = this.indicatorOptions.find(o => o.id === this.selectedIndicatorId);

    switch (this.selectedIndicatorId) {
      case 'campaigns':
        obs$ = this.indicatorService.getActiveCampaigns(this.startDate, this.endDate);
        break;
      case 'collected':
        obs$ = this.indicatorService.getTotalCollected(this.startDate, this.endDate);
        break;
      case 'success':
        obs$ = this.indicatorService.getGlobalSuccessRate(this.startDate, this.endDate);
        break;
      default:
        obs$ = this.indicatorService.getActiveCampaigns(this.startDate, this.endDate);
    }

    obs$.subscribe(rawData => {
      this.chartData.set({
        labels: rawData.map(d => d.label),
        datasets: [
          {
            data: rawData.map(d => d.value),
            label: selectedOption?.label || '',
            borderColor: selectedOption?.color || '#3b82f6',
            backgroundColor: selectedOption?.bg || 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      });
    });
  }
}
