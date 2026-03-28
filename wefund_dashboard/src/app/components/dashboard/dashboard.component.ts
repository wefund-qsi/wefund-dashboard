import { Component, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IndicatorService, RawDataPoint } from '../../services/indicator.service';

interface KpiCard {
  label: string;
  value: Signal<number | null>;
  color: string;
  format: 'percent' | 'currency' | 'number';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  template: `
    <div class="dashboard">

      <!-- Filtre de dates commun -->
      <section class="filters" aria-label="Filtre de période">
        <label for="start-date" class="filter-label">Du</label>
        <input
          id="start-date"
          type="date"
          [(ngModel)]="startDate"
          (change)="loadAll()"
          class="date-input"
        >
        <label for="end-date" class="filter-label">au</label>
        <input
          id="end-date"
          type="date"
          [(ngModel)]="endDate"
          (change)="loadAll()"
          class="date-input"
        >
      </section>

      <!-- KPI cards (Stories 3, 5, 6) -->
      <section class="kpi-grid" aria-label="Indicateurs clés">
        <div
          class="kpi-card"
          *ngFor="let card of kpiCards"
          [style.border-top-color]="card.color"
          role="region"
          [attr.aria-label]="card.label"
        >
          <p class="kpi-label" id="{{ card.label | lowercase }}">{{ card.label }}</p>
          <p
            class="kpi-value"
            [style.color]="card.color"
            aria-live="polite"
            [attr.aria-labelledby]="card.label | lowercase"
          >
            <ng-container *ngIf="card.value() !== null; else loading">
              {{ formatKpi(card.value()!, card.format) }}
            </ng-container>
            <ng-template #loading>
              <span class="kpi-loading" aria-busy="true" role="status">Chargement…</span>
            </ng-template>
          </p>
        </div>
      </section>

      <!-- Graphiques (Stories 2 et 4) -->
      <section class="charts-grid" aria-label="Graphiques par jour">

        <div class="chart-card">
          <h2 class="chart-title">Montant collecté / jour</h2>
          <div class="chart-wrapper">
            <canvas
              *ngIf="collectedPerDayData()"
              baseChart
              role="img"
              aria-label="Graphique du montant collecté par jour"
              [data]="collectedPerDayData()!"
              [options]="chartOptions"
              [type]="chartType"
            ></canvas>
            <p class="chart-empty" role="status" *ngIf="!collectedPerDayData()" aria-busy="true">Chargement du graphique…</p>
          </div>
        </div>

        <div class="chart-card">
          <h2 class="chart-title">Contributions / jour</h2>
          <div class="chart-wrapper">
            <canvas
              *ngIf="contributionsPerDayData()"
              baseChart
              role="img"
              aria-label="Graphique du nombre de contributions par jour"
              [data]="contributionsPerDayData()!"
              [options]="chartOptions"
              [type]="chartType"
            ></canvas>
            <p class="chart-empty" role="status" *ngIf="!contributionsPerDayData()" aria-busy="true">Chargement du graphique…</p>
          </div>
        </div>

      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      width: 100%;
      max-width: 1200px;
    }

    /* --- Filtres --- */
    .filters {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      background: white;
      padding: 1.25rem 1.75rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
    }

    .filter-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .date-input {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 0.6rem 1rem;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #1e293b;
      font-weight: 500;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .date-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* --- KPI Grid --- */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .kpi-card {
      background: white;
      border-radius: 16px;
      padding: 2rem 1.5rem;
      text-align: center;
      border-top: 4px solid transparent;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
      border-top-width: 4px;
    }

    .kpi-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.75rem;
    }

    .kpi-value {
      font-size: 2.5rem;
      font-weight: 900;
      letter-spacing: -1px;
    }

    .kpi-loading {
      color: #cbd5e1;
      font-size: 1rem;
      font-weight: 500;
    }

    /* --- Charts Grid --- */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .chart-card {
      background: white;
      border-radius: 16px;
      padding: 1.75rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
    }

    .chart-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 1.25rem;
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
    }

    .chart-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #94a3b8;
      font-size: 0.95rem;
    }

    @media (max-width: 900px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';

  collectedPerDayData = signal<ChartData<'line'> | null>(null);
  contributionsPerDayData = signal<ChartData<'line'> | null>(null);

  private totalCollectedValue = signal<number | null>(null);
  private successRateValue = signal<number | null>(null);
  private avgContributionsValue = signal<number | null>(null);
  private avgAmountValue = signal<number | null>(null);

  kpiCards: KpiCard[] = [
    { label: 'Montant total collecté',        value: this.totalCollectedValue,  color: '#10b981', format: 'currency' },
    { label: 'Taux de succès global',         value: this.successRateValue,    color: '#f59e0b', format: 'percent' },
    { label: 'Moy. contributions / campagne', value: this.avgContributionsValue, color: '#ec4899', format: 'number' },
    { label: 'Montant moyen / contribution',  value: this.avgAmountValue,       color: '#06b6d4', format: 'currency' },
  ];

  chartType: ChartType = 'line';

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#94a3b8' },
        grid: { color: '#f1f5f9' },
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false },
      },
    },
  };

  constructor(private indicatorService: IndicatorService) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    this.endDate = end.toISOString().split('T')[0];
    this.startDate = start.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.collectedPerDayData.set(null);
    this.contributionsPerDayData.set(null);
    this.totalCollectedValue.set(null);
    this.successRateValue.set(null);
    this.avgContributionsValue.set(null);
    this.avgAmountValue.set(null);

    this.fetchChart(
      this.indicatorService.getCollectedPerDay(this.startDate, this.endDate),
      'Montant collecté', '#10b981', 'rgba(16, 185, 129, 0.1)',
      this.collectedPerDayData
    );

    this.fetchChart(
      this.indicatorService.getContributionsPerDay(this.startDate, this.endDate),
      'Contributions', '#8b5cf6', 'rgba(139, 92, 246, 0.1)',
      this.contributionsPerDayData
    );

    this.fetchKpi(
      this.indicatorService.getTotalCollected(this.startDate, this.endDate),
      this.totalCollectedValue
    );

    this.fetchKpi(
      this.indicatorService.getSuccessRate(this.startDate, this.endDate),
      this.successRateValue
    );

    this.fetchKpi(
      this.indicatorService.getAvgContributionsPerCampaign(this.startDate, this.endDate),
      this.avgContributionsValue
    );

    this.fetchKpi(
      this.indicatorService.getAvgAmountPerContribution(this.startDate, this.endDate),
      this.avgAmountValue
    );
  }

  formatKpi(value: number, format: KpiCard['format']): string {
    if (format === 'percent') return `${value.toFixed(1)} %`;
    if (format === 'currency') {
      return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }
    return value.toFixed(1);
  }

  private fetchChart(
    obs$: Observable<RawDataPoint[]>,
    label: string,
    color: string,
    bg: string,
    target: WritableSignal<ChartData<'line'> | null>
  ): void {
    obs$.pipe(catchError(() => of([]))).subscribe((data: RawDataPoint[]) => {
      target.set({
        labels: data.map(d => d.label),
        datasets: [{ data: data.map(d => d.value), label, borderColor: color, backgroundColor: bg, fill: true, tension: 0.4 }],
      });
    });
  }

  private fetchKpi(
    obs$: Observable<number>,
    target: WritableSignal<number | null>
  ): void {
    obs$.pipe(catchError(() => of(null))).subscribe((value: number | null) => target.set(value));
  }
}
