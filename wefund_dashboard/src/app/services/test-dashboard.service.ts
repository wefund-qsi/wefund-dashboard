import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface pour les statistiques de collecte.
 */
export interface TotalStats {
  total: number;
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestDashboardService {
  // Adresse du serveur backend (server.js)
  private apiUrl = 'http://localhost:3000/api/stats/total-collected';

  constructor(private http: HttpClient) { }

  /**
   * Récupère le montant total collecté via l'API.
   * @param startDate Date de début au format YYYY-MM-DD
   * @param endDate Date de fin au format YYYY-MM-DD
   */
  getTotalCollected(startDate?: string, endDate?: string): Observable<TotalStats> {
    const params: Record<string, string> = {};
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    
    return this.http.get<TotalStats>(this.apiUrl, { params });
  }
}
