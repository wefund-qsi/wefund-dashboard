import { Component, OnInit, LOCALE_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FormsModule } from '@angular/forms';
import { TestDashboardService, TotalStats } from '../services/test-dashboard.service';

registerLocaleData(localeFr);

@Component({
  selector: 'app-test-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
  template: `
    <div class="dashboard-wrapper">
      <div class="stat-container animate-fade-in">
        <h2 class="title">Suivi de la Collecte</h2>
        
        <div class="date-filters">
          <div class="date-input">
            <label for="start-date">Début</label>
            <input id="start-date" type="date" [(ngModel)]="startDate" (change)="refreshData()">
          </div>
          <div class="date-input">
            <label for="end-date">Fin</label>
            <input id="end-date" type="date" [(ngModel)]="endDate" (change)="refreshData()">
          </div>
        </div>

        <div class="stats-card">
          <span class="stats-label">Montant collecté au total sur la période</span>
          <div class="stats-value" *ngIf="stats">
            {{ stats.total | currency:'EUR':'symbol':'1.0-0':'fr-FR' }}
          </div>
          <div class="loader" *ngIf="!stats">Calcul en cours...</div>
          
          <div class="stats-period" *ngIf="stats">
            du {{ startDate | date:'dd MMMM yyyy' }} au {{ endDate | date:'dd MMMM yyyy' }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f0f2f5;
      padding: 20px;
      font-family: 'Inter', -apple-system, sans-serif;
    }
    .stat-container {
      width: 100%;
      max-width: 550px;
      background: white;
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .title {
      text-align: center;
      color: #1a202c;
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 30px;
    }
    .date-filters {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 30px;
    }
    .date-input {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .date-input label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #718096;
      text-transform: uppercase;
    }
    .date-input input {
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.95rem;
      color: #2d3748;
      outline: none;
      transition: border-color 0.2s;
    }
    .date-input input:focus {
      border-color: #3182ce;
    }
    .stats-card {
      background: #2d3748;
      color: white;
      padding: 40px 20px;
      border-radius: 20px;
      text-align: center;
      transition: transform 0.3s ease;
    }
    .stats-card:hover {
      transform: translateY(-5px);
    }
    .stats-label {
      display: block;
      font-size: 0.85rem;
      color: #a0aec0;
      margin-bottom: 12px;
      font-weight: 500;
    }
    .stats-value {
      font-size: 4rem;
      font-weight: 900;
      margin-bottom: 15px;
      letter-spacing: -2px;
    }
    .stats-period {
      font-size: 0.8rem;
      color: #cbd5e0;
      font-weight: 400;
    }
    .loader {
      font-size: 1.25rem;
      color: #a0aec0;
      padding: 20px;
    }
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class TestDashboardComponent implements OnInit {
  stats?: TotalStats;
  startDate: string = '2024-01-01';
  endDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private testService: TestDashboardService, 
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.testService.getTotalCollected(this.startDate, this.endDate).subscribe({
      next: (data: TotalStats) => {
        console.log('Données reçues:', data);
        this.stats = data;
        // Détecter les changements manuellement car zone.js semble absent ou inactif
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erreur lors de la récupération des stats:', err);
      }
    });
  }
}
