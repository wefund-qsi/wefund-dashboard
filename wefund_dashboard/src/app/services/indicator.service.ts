import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { format, addDays, parseISO, isWithinInterval } from 'date-fns';
import {
    ActiveCampaignsResponse,
    TotalAmountResponse,
    SuccessRateResponse,
    TotalContributionsResponse,
    AvgContributionsResponse,
    AvgAmountResponse,
    DatePeriod
} from '../models/indicators.model';

@Injectable({
    providedIn: 'root'
})
export class IndicatorService {
    constructor(private http: HttpClient) { }

    getActiveCampaigns(period: DatePeriod): Observable<ActiveCampaignsResponse> {
        // In a real app: return this.http.get<ActiveCampaignsResponse>(`${API_URL}/indicators/active-campaigns?from=${period.from}&to=${period.to}`);

        const data = [
            { date: '2026-03-01', count: 10 },
            { date: '2026-03-02', count: 11 },
            { date: '2026-03-03', count: 11 },
            { date: '2026-03-04', count: 13 },
            { date: '2026-03-05', count: 12 },
            { date: '2026-03-06', count: 14 },
            { date: '2026-03-07', count: 16 }
        ];

        return of({
            indicator: 'active_campaigns_over_period',
            period,
            data: this.filterByDate(data, period)
        } as ActiveCampaignsResponse).pipe(delay(200));
    }

    getTotalAmountCollected(period: DatePeriod): Observable<TotalAmountResponse> {
        const data = [
            { date: '2026-03-01', amount_eur: 1200 },
            { date: '2026-03-02', amount_eur: 850 },
            { date: '2026-03-03', amount_eur: 2100 },
            { date: '2026-03-04', amount_eur: 1750 },
            { date: '2026-03-05', amount_eur: 980 },
            { date: '2026-03-06', amount_eur: 3200 },
            { date: '2026-03-07', amount_eur: 1400 }
        ];

        return of({
            indicator: 'total_amount_collected',
            period,
            data: this.filterByDate(data, period)
        } as TotalAmountResponse).pipe(delay(200));
    }

    getGlobalSuccessRate(): Observable<SuccessRateResponse> {
        return of({
            indicator: 'global_success_rate',
            data: {
                total_campaigns: 45,
                successful: 28,
                failed: 12,
                active: 5,
                success_rate_percent: 70.0
            }
        } as SuccessRateResponse).pipe(delay(200));
    }

    getTotalContributions(period: DatePeriod): Observable<TotalContributionsResponse> {
        const data = [
            { date: '2026-03-01', count: 34 },
            { date: '2026-03-02', count: 28 },
            { date: '2026-03-03', count: 45 },
            { date: '2026-03-04', count: 39 },
            { date: '2026-03-05', count: 22 },
            { date: '2026-03-06', count: 56 },
            { date: '2026-03-07', count: 31 }
        ];

        return of({
            indicator: 'total_contributions_over_period',
            period,
            data: this.filterByDate(data, period)
        } as TotalContributionsResponse).pipe(delay(200));
    }

    getAvgContributionsPerCampaign(period: DatePeriod): Observable<AvgContributionsResponse> {
        return of({
            indicator: 'avg_contributions_per_campaign',
            period,
            data: {
                total_contributions: 168,
                total_campaigns: 12,
                average: 14.0
            }
        } as AvgContributionsResponse).pipe(delay(200));
    }

    getAvgAmountPerContribution(period: DatePeriod): Observable<AvgAmountResponse> {
        return of({
            indicator: 'avg_amount_per_contribution',
            period,
            data: {
                total_amount_eur: 6880,
                total_contributions: 168,
                average_eur: 40.95
            }
        } as AvgAmountResponse).pipe(delay(200));
    }

    private filterByDate<T extends { date: string }>(data: T[], period: DatePeriod): T[] {
        const start = parseISO(period.from);
        const end = parseISO(period.to);
        return data.filter(item => {
            const itemDate = parseISO(item.date);
            return isWithinInterval(itemDate, { start, end });
        });
    }
}
