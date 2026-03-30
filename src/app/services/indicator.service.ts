import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/** Point de données brut utilisé pour alimenter les graphiques. */
export interface RawDataPoint {
  /** Label affiché sur l'axe X (date formatée en fr-FR, ex: "01 mars"). */
  label: string;
  /** Valeur numérique associée au label. */
  value: number;
}

/** Réponse brute de l'API `/stats/collected-per-day`. */
export interface CollectedPerDayResponse {
  /** Date au format ISO (`YYYY-MM-DD`). */
  day: string;
  /** Montant total collecté ce jour-là (en euros). */
  total: number;
}

/** Réponse brute de l'API `/stats/contributions-per-day`. */
export interface ContributionsPerDayResponse {
  /** Date au format ISO (`YYYY-MM-DD`). */
  day: string;
  /** Nombre de contributions enregistrées ce jour-là. */
  count: number;
}

/** Réponse brute de l'API `/stats/total-collected`. */
export interface TotalCollectedResponse {
  /** Montant total collecté sur la période (en euros). */
  total: number;
  /** Date de début de la période appliquée. */
  startDate: string;
  /** Date de fin de la période appliquée. */
  endDate: string;
}

/** Réponse brute de l'API `/stats/success-rate`. */
export interface SuccessRateResponse {
  /** Taux de succès arrondi à l'entier (0–100). */
  rate: number;
  /** Nombre total de campagnes sur la période. */
  total: number;
  /** Nombre de campagnes avec le statut `REUSSIE`. */
  reussies: number;
}

/** Réponse brute des endpoints retournant une moyenne (`avg-*`). */
export interface AvgResponse {
  /** Valeur moyenne calculée. */
  avg: number;
}

/**
 * Service responsable de tous les appels à l'API de statistiques WeFund.
 *
 * Chaque méthode accepte une plage de dates optionnelle (`startDate` / `endDate`
 * au format `YYYY-MM-DD`). Sans paramètres, l'API couvre l'ensemble des données.
 *
 * Les méthodes retournant des séries temporelles (`getCollectedPerDay`,
 * `getContributionsPerDay`) mappent les réponses en `RawDataPoint[]` avec
 * les labels formatés en français pour un affichage direct dans Chart.js.
 */
@Injectable({
  providedIn: 'root'
})
export class IndicatorService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Retourne le montant total collecté sur la période.
   *
   * @param startDate - Date de début (format `YYYY-MM-DD`), optionnelle.
   * @param endDate   - Date de fin (format `YYYY-MM-DD`), optionnelle.
   * @returns Observable émettant le montant total en euros.
   */
  getTotalCollected(startDate?: string, endDate?: string): Observable<number> {
    const params = this.buildParams(startDate, endDate);
    return this.http
      .get<TotalCollectedResponse>(`${this.apiUrl}/total-collected`, { params })
      .pipe(map((data: TotalCollectedResponse) => data.total));
  }

  /**
   * Retourne le montant collecté jour par jour sur la période.
   * Les jours sans contribution sont inclus avec une valeur à 0.
   *
   * @param startDate - Date de début (format `YYYY-MM-DD`), optionnelle.
   * @param endDate   - Date de fin (format `YYYY-MM-DD`), optionnelle.
   * @returns Observable émettant un tableau de points pour le graphique.
   */
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

  /**
   * Retourne le taux de succès global des campagnes sur la période.
   * Calculé comme : `round(campagnes REUSSIES / total campagnes × 100)`.
   *
   * @param startDate - Date de début (format `YYYY-MM-DD`), optionnelle.
   * @param endDate   - Date de fin (format `YYYY-MM-DD`), optionnelle.
   * @returns Observable émettant le taux de succès (entier, 0–100).
   */
  getSuccessRate(startDate?: string, endDate?: string): Observable<number> {
    const params = this.buildParams(startDate, endDate);
    return this.http
      .get<SuccessRateResponse>(`${this.apiUrl}/success-rate`, { params })
      .pipe(map((data: SuccessRateResponse) => data.rate));
  }

  /**
   * Retourne le nombre de contributions jour par jour sur la période.
   * Les jours sans contribution sont inclus avec une valeur à 0.
   *
   * @param startDate - Date de début (format `YYYY-MM-DD`), optionnelle.
   * @param endDate   - Date de fin (format `YYYY-MM-DD`), optionnelle.
   * @returns Observable émettant un tableau de points pour le graphique.
   */
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

  /**
   * Retourne le nombre moyen de contributions par campagne sur la période.
   *
   * @param startDate - Date de début (format `YYYY-MM-DD`), optionnelle.
   * @param endDate   - Date de fin (format `YYYY-MM-DD`), optionnelle.
   * @returns Observable émettant la moyenne (arrondie à 1 décimale).
   */
  getAvgContributionsPerCampaign(startDate?: string, endDate?: string): Observable<number> {
    const params = this.buildParams(startDate, endDate);
    return this.http
      .get<AvgResponse>(`${this.apiUrl}/avg-contributions-per-campaign`, { params })
      .pipe(map((data: AvgResponse) => data.avg));
  }

  /**
   * Retourne le montant moyen par contribution sur la période.
   *
   * @param startDate - Date de début (format `YYYY-MM-DD`), optionnelle.
   * @param endDate   - Date de fin (format `YYYY-MM-DD`), optionnelle.
   * @returns Observable émettant la moyenne en euros (arrondie à 2 décimales).
   */
  getAvgAmountPerContribution(startDate?: string, endDate?: string): Observable<number> {
    const params = this.buildParams(startDate, endDate);
    return this.http
      .get<AvgResponse>(`${this.apiUrl}/avg-amount-per-contribution`, { params })
      .pipe(map((data: AvgResponse) => data.avg));
  }

  /**
   * Construit l'objet de paramètres HTTP en n'incluant que les dates fournies.
   *
   * @param startDate - Date de début optionnelle.
   * @param endDate   - Date de fin optionnelle.
   * @returns Objet clé-valeur utilisable comme `HttpParams`.
   */
  private buildParams(startDate?: string, endDate?: string): Record<string, string> {
    const params: Record<string, string> = {};
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    return params;
  }
}
