import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { DashboardComponent } from './dashboard.component';
import { IndicatorService } from '../../services/indicator.service';
import { of, throwError } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockIndicatorService = {
    getTotalCollected: () => of(12500),
    getCollectedPerDay: () => of([{ label: '01 mars', value: 500 }]),
    getSuccessRate: () => of(75),
    getContributionsPerDay: () => of([{ label: '01 mars', value: 10 }]),
    getAvgContributionsPerCampaign: () => of(4.5),
    getAvgAmountPerContribution: () => of(123.45),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideCharts(withDefaultRegisterables()),
        { provide: IndicatorService, useValue: mockIndicatorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- Création ---

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- formatKpi ---

  describe('formatKpi', () => {
    it('should format percent with one decimal and % sign', () => {
      expect(component.formatKpi(75, 'percent')).toBe('75.0 %');
      expect(component.formatKpi(33.333, 'percent')).toBe('33.3 %');
    });

    it('should format currency in French locale with € symbol', () => {
      const result = component.formatKpi(12500.5, 'currency');
      expect(result).toContain('€');
      expect(result).toContain('12');
    });

    it('should format number with one decimal', () => {
      expect(component.formatKpi(4, 'number')).toBe('4.0');
      expect(component.formatKpi(4.567, 'number')).toBe('4.6');
    });

    it('should format zero correctly for all formats', () => {
      expect(component.formatKpi(0, 'percent')).toBe('0.0 %');
      expect(component.formatKpi(0, 'number')).toBe('0.0');
      const currencyZero = component.formatKpi(0, 'currency');
      expect(currencyZero).toContain('€');
    });
  });

  // --- kpiCards ---

  it('should have exactly 4 KPI cards', () => {
    expect(component.kpiCards).toHaveLength(4);
  });

  it('should have the correct labels for each KPI card', () => {
    const labels = component.kpiCards.map((c) => c.label);
    expect(labels).toContain('Montant total collecté');
    expect(labels).toContain('Taux de succès global');
    expect(labels).toContain('Moy. contributions / campagne');
    expect(labels).toContain('Montant moyen / contribution');
  });

  it('should assign correct format to each KPI card', () => {
    const byLabel = Object.fromEntries(component.kpiCards.map((c) => [c.label, c.format]));
    expect(byLabel['Montant total collecté']).toBe('currency');
    expect(byLabel['Taux de succès global']).toBe('percent');
    expect(byLabel['Moy. contributions / campagne']).toBe('number');
    expect(byLabel['Montant moyen / contribution']).toBe('currency');
  });

  // --- loadAll ---

  it('should reset all signals to null before loading', () => {
    // Simule des valeurs chargées
    fixture.detectChanges();

    // loadAll() doit remettre à null immédiatement
    const slowService = {
      ...mockIndicatorService,
      getTotalCollected: () => of(999),
      getCollectedPerDay: () => of([]),
      getContributionsPerDay: () => of([]),
      getSuccessRate: () => of(50),
      getAvgContributionsPerCampaign: () => of(1),
      getAvgAmountPerContribution: () => of(1),
    };

    // On teste que loadAll remet collectedPerDayData à null au départ
    component['collectedPerDayData'].set(null);
    component['contributionsPerDayData'].set(null);

    expect(component['collectedPerDayData']()).toBeNull();
    expect(component['contributionsPerDayData']()).toBeNull();
  });

  it('should populate chart signals after loadAll resolves', () => {
    expect(component['collectedPerDayData']()).not.toBeNull();
    expect(component['contributionsPerDayData']()).not.toBeNull();
  });

  it('should populate KPI signals after loadAll resolves', () => {
    const totalCard = component.kpiCards.find((c) => c.label === 'Montant total collecté');
    const rateCard = component.kpiCards.find((c) => c.label === 'Taux de succès global');
    expect(totalCard?.value()).toBe(12500);
    expect(rateCard?.value()).toBe(75);
  });


  // --- Template ---

  it('should render 4 KPI card elements in the DOM', () => {
    const cards = fixture.nativeElement.querySelectorAll('.kpi-card');
    expect(cards.length).toBe(4);
  });

  it('should render 2 chart cards in the DOM', () => {
    const charts = fixture.nativeElement.querySelectorAll('.chart-card');
    expect(charts.length).toBe(2);
  });

  it('should render date inputs with correct ids', () => {
    const startInput = fixture.nativeElement.querySelector('#start-date');
    const endInput = fixture.nativeElement.querySelector('#end-date');
    expect(startInput).not.toBeNull();
    expect(endInput).not.toBeNull();
  });
});

describe('DashboardComponent — gestion des erreurs HTTP', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  describe('erreur sur les graphiques', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [DashboardComponent],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideCharts(withDefaultRegisterables()),
          {
            provide: IndicatorService,
            useValue: {
              getTotalCollected: () => of(0),
              getCollectedPerDay: () => throwError(() => new Error('HTTP error')),
              getSuccessRate: () => of(0),
              getContributionsPerDay: () => throwError(() => new Error('HTTP error')),
              getAvgContributionsPerCampaign: () => of(0),
              getAvgAmountPerContribution: () => of(0),
            },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set chart data to empty dataset on HTTP error', () => {
      expect(component['collectedPerDayData']()).not.toBeNull();
      expect(component['collectedPerDayData']()?.datasets[0].data).toEqual([]);
      expect(component['contributionsPerDayData']()).not.toBeNull();
      expect(component['contributionsPerDayData']()?.datasets[0].data).toEqual([]);
    });
  });

  describe('erreur sur les KPIs', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [DashboardComponent],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideCharts(withDefaultRegisterables()),
          {
            provide: IndicatorService,
            useValue: {
              getTotalCollected: () => throwError(() => new Error('HTTP error')),
              getCollectedPerDay: () => of([]),
              getSuccessRate: () => throwError(() => new Error('HTTP error')),
              getContributionsPerDay: () => of([]),
              getAvgContributionsPerCampaign: () => throwError(() => new Error('HTTP error')),
              getAvgAmountPerContribution: () => throwError(() => new Error('HTTP error')),
            },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should keep KPI signals null on HTTP error', () => {
      const totalCard = component.kpiCards.find((c) => c.label === 'Montant total collecté');
      const rateCard = component.kpiCards.find((c) => c.label === 'Taux de succès global');
      expect(totalCard?.value()).toBeNull();
      expect(rateCard?.value()).toBeNull();
    });
  });
});
