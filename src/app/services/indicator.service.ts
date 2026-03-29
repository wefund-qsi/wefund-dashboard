import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface RawDataPoint {
  label: string;
  value: number;
}

export interface CollectedPerDayResponse {
  day: string;
  total: number;
}

export interface ContributionsPerDayResponse {
  day: string;
  count: number;
}

export interface TotalCollectedResponse {
  total: number;
  startDate: string;
  endDate: string;
}

export interface SuccessRateResponse {
  rate: number;
  total: number;
  reussies: number;
}

export interface AvgResponse {
  avg: number;
}

@Injectable({
  providedIn: 'root'
})
export class IndicatorService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- Montant total collecté sur la période ---

  getTotalCollected(startDate?: string, endDate?: string): Observable<number> {
    const params = this.buildParams(startDate, endDate);
    return this.http
      .get<TotalCollectedResponse>(`${this.apiUrl}/total-collected`, { params })
      .pipe(map((data: TotalCollectedResponse) => data.total));
  }

  // --- Story 2 : Montant collecté jour par jour ---

  getCollectedPerDay(startDate?: string, endDate?: string): Observable<RawDataPoint[]> {
    const params = this.buildParams(startDate, endDate);
    return this.http
      .get<CollectedPerDayResponse[]>(`${this.apiUrl}/collected-per-day`, { params })
      .pipe(
        map((data: CollectedPerDayResponse[]) =>
          data.map(d => ({
            label: new Date(d.day).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            value: d.total,
          }))
        )
      );
  }

  // --- Story 3 : Taux de succès global (KPI) ---

  getSuccessRate(startDate?: string, endDate?: string): Observable<number> {
    const params = this.buildParams(startDate, endDate);
    return this.http
      .get<SuccessRateResponse>(`${this.apiUrl}/success-rate`, { params })
      .pipe(map((data: SuccessRateResponse) => data.rate));
  }

  // --- Story 4 : Contributions jour par jour ---

  getContributionsPerDay(startDate?: string, endDate?: string): Observable<RawDataPoint[]> {
    const params = this.buildParams(startDate, endDate);
    return this.http
      .get<ContributionsPerDayResponse[]>(`${this.apiUrl}/contributions-per-day`, { params })
      .pipe(
        map((data: ContributionsPerDayResponse[]) =>
          data.map(d => ({
            label: new Date(d.day).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            value: d.count,
          }))
        )
      );
  }

  // --- Story 5 : Moy. contributions par campagne (KPI) ---

  getAvgContributionsPerCampaign(startDate?: string, endDate?: string): Observable<number> {
    const params = this.buildParams(startDate, endDate);
    return this.http
      .get<AvgResponse>(`${this.apiUrl}/avg-contributions-per-campaign`, { params })
      .pipe(map((data: AvgResponse) => data.avg));
  }

  // --- Story 6 : Montant moyen par contribution (KPI) ---

  getAvgAmountPerContribution(startDate?: string, endDate?: string): Observable<number> {
    const params = this.buildParams(startDate, endDate);
    return this.http
      .get<AvgResponse>(`${this.apiUrl}/avg-amount-per-contribution`, { params })
      .pipe(map((data: AvgResponse) => data.avg));
  }

  // --- Helper privé ---

  private buildParams(startDate?: string, endDate?: string): Record<string, string> {
    const params: Record<string, string> = {};
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    return params;
  }
}
