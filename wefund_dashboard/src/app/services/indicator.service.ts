import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface BackendPoint {
    timestamp: number;
    campaigns: number;
    collected: number;
    success: number;
}

export interface RawDataPoint {
    label: string;
    value: number;
}

@Injectable({
    providedIn: 'root'
})
export class IndicatorService {
    constructor() { }

    getActiveCampaigns(startDate?: string, endDate?: string): Observable<RawDataPoint[]> {
        const backendData = this.mockResultBack(startDate, endDate);
        return of(this.adaptBackendData(backendData, 'campaigns'));
    }

    getTotalCollected(startDate?: string, endDate?: string): Observable<RawDataPoint[]> {
        const backendData = this.mockResultBack(startDate, endDate);
        return of(this.adaptBackendData(backendData, 'collected'));
    }

    getGlobalSuccessRate(startDate?: string, endDate?: string): Observable<RawDataPoint[]> {
        const backendData = this.mockResultBack(startDate, endDate);
        return of(this.adaptBackendData(backendData, 'success'));
    }

    /**
     * Simulates a backend response for a given range, 
     * returning all indicator values for each point.
     */
    private mockResultBack(startDate?: string, endDate?: string): BackendPoint[] {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const actualStart = start < end ? start : end;
        const actualEnd = start < end ? end : start;

        const data: BackendPoint[] = [];
        const diffTime = Math.abs(actualEnd.getTime() - actualStart.getTime());
        const numberOfPoints = 12;
        const interval = diffTime / (numberOfPoints - 1);

        for (let i = 0; i < numberOfPoints; i++) {
            const timestamp = actualStart.getTime() + (interval * i);
            const seed = timestamp;

            data.push({
                timestamp,
                campaigns: Math.round(10 + Math.abs(Math.sin(seed * 0.0001)) * 40),
                collected: Math.round(1000 + Math.abs(Math.cos(seed * 0.0001)) * 49000),
                success: Math.round(50 + Math.abs(Math.sin(seed * 0.0002)) * 45)
            });
        }

        return data;
    }

    /**       private getDataFromBack(startDate?: string, endDate?: string): Observable<BackendPoint[]> {
    const params = { start: startDate, end: endDate };
    return this.http.get<BackendPoint[]>(this.apiUrl, { params });
  }
*/


    /**
     * Adapts backend data into UI-friendly labels and extracts the specific indicator value.
     * exemple : 
     * {
     *  "timestamp": 1741582800000, 
     *  "campaigns": 15,
     *  "collected": 12500.50,
     *  "success": 68.5
     * }
     * va devenir => { "label": "10 mars", "value": 12500.50 }
     */
    private adaptBackendData(data: BackendPoint[], key: keyof Omit<BackendPoint, 'timestamp'>): RawDataPoint[] {
        return data.map(point => {
            const date = new Date(point.timestamp);
            return {
                label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                value: point[key] as number
            };
        });
    }
}
