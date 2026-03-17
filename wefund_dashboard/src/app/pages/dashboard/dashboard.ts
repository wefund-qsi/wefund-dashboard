import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRangePickerComponent } from '../../components/date-range-picker/date-range-picker';
import { DatePeriod } from '../../models/indicators.model';

// Chart Components
import { ActiveCampaignsChartComponent } from './active-campaigns-chart/active-campaigns-chart';
import { TotalAmountChartComponent } from './total-amount-chart/total-amount-chart';
import { SuccessRateChartComponent } from './success-rate-chart/success-rate-chart';
import { ContributionsChartComponent } from './contributions-chart/contributions-chart';
import { AvgStatsComponent } from './avg-stats/avg-stats';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  story: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DateRangePickerComponent,
    ActiveCampaignsChartComponent,
    TotalAmountChartComponent,
    SuccessRateChartComponent,
    ContributionsChartComponent,
    AvgStatsComponent
  ],
  template: `
    <div class="dashboard-wrapper">
      <aside class="sidebar glass-card">
        <div class="brand">
          <div class="logo-box">W</div>
          <h1>WEFUND</h1>
        </div>
        
        <nav>
          <div class="nav-section">INDICATORS</div>
          <div 
            *ngFor="let item of menuItems" 
            class="nav-item" 
            [class.active]="activeIndicator === item.id"
            (click)="activeIndicator = item.id"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-chip">
            <div class="avatar">AD</div>
            <div class="user-details">
              <span class="name">Admin User</span>
              <span class="role">Platform Owner</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-bar">
          <div class="header-left">
            <h2>{{ getActiveLabel() }}</h2>
            <p class="subtitle">Real-time metrics & platform health</p>
          </div>
          <app-date-range-picker (periodChange)="onPeriodChange($event)"></app-date-range-picker>
        </header>

        <section class="indicator-view">
          <div class="active-indicator-container" [ngSwitch]="activeIndicator">
             
             <app-active-campaigns-chart 
               *ngSwitchCase="'active_campaigns'"
               [period]="period">
             </app-active-campaigns-chart>

             <app-total-amount-chart 
               *ngSwitchCase="'total_collected'"
               [period]="period">
             </app-total-amount-chart>

             <app-success-rate-chart 
               *ngSwitchCase="'success_rate'">
             </app-success-rate-chart>

             <app-contributions-chart 
               *ngSwitchCase="'total_contributions'"
               [period]="period">
             </app-contributions-chart>

             <app-avg-stats 
               *ngSwitchCase="'averages'"
               [period]="period">
             </app-avg-stats>

             <div *ngSwitchDefault class="placeholder-msg">
               Select an indicator from the sidebar to view detailed analytics.
             </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: `
    .dashboard-wrapper {
      display: grid;
      grid-template-columns: 280px 1fr;
      height: 100vh;
      background: var(--bg-color);
      overflow: hidden;
    }

    .sidebar {
      margin: 1rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      border-radius: 24px;
      z-index: 10;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      margin-bottom: 2.5rem;
    }

    .logo-box {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      font-weight: 800;
      font-size: 1.25rem;
      color: white;
      box-shadow: 0 4px 15px var(--primary-glow);
    }

    h1 {
      font-size: 1.1rem;
      letter-spacing: 0.15em;
      font-weight: 800;
      font-family: 'Outfit';
    }

    nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-section {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.1em;
      margin: 1rem 0 0.5rem 0.5rem;
    }

    .nav-item {
      padding: 0.9rem 1.2rem;
      border-radius: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 0.9rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
      transform: translateX(4px);
    }

    .nav-item.active {
      background: var(--primary);
      color: white;
      font-weight: 600;
      box-shadow: 0 8px 20px -5px var(--primary-glow);
    }

    .nav-icon {
      font-size: 1.2rem;
    }

    .sidebar-footer {
      margin-top: auto;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
    }

    .avatar {
      width: 36px;
      height: 36px;
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-details .name {
      font-size: 0.85rem;
      font-weight: 600;
    }

    .user-details .role {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .main-content {
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
      overflow-y: auto;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h2 {
      font-size: 2rem;
      font-weight: 700;
      font-family: 'Outfit';
      margin-bottom: 0.25rem;
      background: linear-gradient(to right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .indicator-view {
      flex: 1;
    }

    .placeholder-msg {
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      border: 2px dashed var(--border-color);
      border-radius: 28px;
      font-style: italic;
    }
  `
})
export class DashboardComponent {
  activeIndicator: string = 'active_campaigns';
  period: DatePeriod = { from: '', to: '' };

  menuItems: MenuItem[] = [
    { id: 'active_campaigns', label: 'Active Campaigns', icon: '🚀', story: 1 },
    { id: 'total_collected', label: 'Total Collected', icon: '💰', story: 2 },
    { id: 'success_rate', label: 'Global Success Rate', icon: '📈', story: 3 },
    { id: 'total_contributions', label: 'Total Contributions', icon: '🤝', story: 4 },
    { id: 'averages', label: 'Averages & Ratios', icon: '📊', story: 5 },
  ];

  onPeriodChange(period: DatePeriod) {
    this.period = period;
  }

  getActiveLabel() {
    return this.menuItems.find(i => i.id === this.activeIndicator)?.label || 'Dashboard';
  }
}
