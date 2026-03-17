import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndicatorService } from '../../../services/indicator.service';
import { DatePeriod, AvgContributionsData, AvgAmountData } from '../../../models/indicators.model';
import { IndicatorCardComponent } from '../../../components/indicator-card/indicator-card';

@Component({
  selector: 'app-avg-stats',
  standalone: true,
  imports: [CommonModule, IndicatorCardComponent],
  template: `
    <div class="stats-cards-grid">
      <app-indicator-card title="Avg. Contributions per Campaign" [loading]="loading">
        <div class="stat-big" *ngIf="avgContrib">
          <span class="value">{{ avgContrib.average }}</span>
          <span class="label">contributions / campaign</span>
          
          <div class="metrics-sub">
            <div class="sub-item">
              <label>Total Contributions</label>
              <span>{{ avgContrib.total_contributions }}</span>
            </div>
            <div class="sub-item">
              <label>Total Campaigns</label>
              <span>{{ avgContrib.total_campaigns }}</span>
            </div>
          </div>
        </div>
      </app-indicator-card>

      <app-indicator-card title="Avg. Amount per Contribution" [loading]="loading">
        <div class="stat-big" *ngIf="avgAmount">
          <span class="value">€{{ avgAmount.average_eur | number:'1.2-2' }}</span>
          <span class="label">per contribution</span>
          
          <div class="metrics-sub">
            <div class="sub-item">
              <label>Total Amount</label>
              <span>€{{ avgAmount.total_amount_eur | number:'1.0-0' }}</span>
            </div>
            <div class="sub-item">
              <label>Contributions Count</label>
              <span>{{ avgAmount.total_contributions }}</span>
            </div>
          </div>
        </div>
      </app-indicator-card>
    </div>
  `,
  styles: `
    .stats-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .stat-big {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 1rem;
    }

    .value {
      font-size: 3.5rem;
      font-weight: 700;
      color: var(--primary);
      font-family: 'Outfit';
      line-height: 1.1;
      text-shadow: 0 0 20px var(--primary-glow);
    }

    .label {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .metrics-sub {
      display: flex;
      gap: 2rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
      width: 100%;
      justify-content: center;
    }

    .sub-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sub-item label {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .sub-item span {
      font-weight: 500;
      font-size: 1rem;
    }
  `
})
export class AvgStatsComponent implements OnInit {
  @Input() set period(val: DatePeriod) {
    if (val && val.from && val.to) {
      this._period = val;
      this.loadData();
    }
  }
  private _period!: DatePeriod;

  loading = false;
  avgContrib?: AvgContributionsData;
  avgAmount?: AvgAmountData;

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

    // Using forkJoin or separate subscribes
    this.indicatorService.getAvgContributionsPerCampaign(this._period).subscribe(res => {
      this.avgContrib = res.data;
      this.checkLoading();
    });

    this.indicatorService.getAvgAmountPerContribution(this._period).subscribe(res => {
      this.avgAmount = res.data;
      this.checkLoading();
    });
  }

  private checkLoading() {
    if (this.avgContrib && this.avgAmount) {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }
}
