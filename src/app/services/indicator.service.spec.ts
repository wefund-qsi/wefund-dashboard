import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  IndicatorService,
  CollectedPerDayResponse,
  ContributionsPerDayResponse,
  TotalCollectedResponse,
  SuccessRateResponse,
  AvgResponse,
} from './indicator.service';

describe('IndicatorService', () => {
  let service: IndicatorService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/stats';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IndicatorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // --- buildParams (testé indirectement via les URLs) ---

  it('should append startDate and endDate as query params', () => {
    service.getTotalCollected('2024-01-01', '2024-12-31').subscribe();
    const req = httpMock.expectOne(
      `${apiUrl}/total-collected?startDate=2024-01-01&endDate=2024-12-31`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ total: 0, startDate: '2024-01-01', endDate: '2024-12-31' } satisfies TotalCollectedResponse);
  });

  it('should omit params when dates are not provided', () => {
    service.getTotalCollected().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/total-collected`);
    expect(req.request.params.keys()).toHaveLength(0);
    req.flush({ total: 0, startDate: '', endDate: '' } satisfies TotalCollectedResponse);
  });

  // --- getTotalCollected ---

  it('should extract total from TotalCollectedResponse', () => {
    let result: number | undefined;
    service.getTotalCollected('2024-01-01', '2024-12-31').subscribe((v) => (result = v));

    const req = httpMock.expectOne(`${apiUrl}/total-collected?startDate=2024-01-01&endDate=2024-12-31`);
    req.flush({ total: 12500.5, startDate: '2024-01-01', endDate: '2024-12-31' } satisfies TotalCollectedResponse);

    expect(result).toBe(12500.5);
  });

  // --- getCollectedPerDay ---

  it('should map CollectedPerDayResponse to RawDataPoint[]', () => {
    const mockResponse: CollectedPerDayResponse[] = [
      { day: '2024-03-01', total: 500 },
      { day: '2024-03-02', total: 750 },
    ];

    let result: { label: string; value: number }[] | undefined;
    service.getCollectedPerDay('2024-03-01', '2024-03-02').subscribe((v) => (result = v));

    const req = httpMock.expectOne(
      `${apiUrl}/collected-per-day?startDate=2024-03-01&endDate=2024-03-02`
    );
    req.flush(mockResponse);

    expect(result).toHaveLength(2);
    expect(result![0].value).toBe(500);
    expect(result![1].value).toBe(750);
    // Les labels sont formatés en date fr-FR (ex: "01 mars")
    expect(result![0].label).toBeTruthy();
  });

  it('should return empty array when getCollectedPerDay gets empty response', () => {
    let result: unknown[] | undefined;
    service.getCollectedPerDay().subscribe((v) => (result = v));

    const req = httpMock.expectOne(`${apiUrl}/collected-per-day`);
    req.flush([]);

    expect(result).toEqual([]);
  });

  // --- getContributionsPerDay ---

  it('should map ContributionsPerDayResponse.count to RawDataPoint.value', () => {
    const mockResponse: ContributionsPerDayResponse[] = [
      { day: '2024-03-01', count: 12 },
      { day: '2024-03-02', count: 8 },
    ];

    let result: { label: string; value: number }[] | undefined;
    service.getContributionsPerDay('2024-03-01', '2024-03-02').subscribe((v) => (result = v));

    const req = httpMock.expectOne(
      `${apiUrl}/contributions-per-day?startDate=2024-03-01&endDate=2024-03-02`
    );
    req.flush(mockResponse);

    expect(result![0].value).toBe(12);
    expect(result![1].value).toBe(8);
  });

  // --- getSuccessRate ---

  it('should extract rate from SuccessRateResponse', () => {
    let result: number | undefined;
    service.getSuccessRate('2024-01-01', '2024-12-31').subscribe((v) => (result = v));

    const req = httpMock.expectOne(
      `${apiUrl}/success-rate?startDate=2024-01-01&endDate=2024-12-31`
    );
    req.flush({ rate: 75, total: 8, reussies: 6 } satisfies SuccessRateResponse);

    expect(result).toBe(75);
  });

  // --- getAvgContributionsPerCampaign ---

  it('should extract avg from AvgResponse for contributions per campaign', () => {
    let result: number | undefined;
    service.getAvgContributionsPerCampaign().subscribe((v) => (result = v));

    const req = httpMock.expectOne(`${apiUrl}/avg-contributions-per-campaign`);
    req.flush({ avg: 4.5 } satisfies AvgResponse);

    expect(result).toBe(4.5);
  });

  // --- getAvgAmountPerContribution ---

  it('should extract avg from AvgResponse for amount per contribution', () => {
    let result: number | undefined;
    service.getAvgAmountPerContribution().subscribe((v) => (result = v));

    const req = httpMock.expectOne(`${apiUrl}/avg-amount-per-contribution`);
    req.flush({ avg: 123.45 } satisfies AvgResponse);

    expect(result).toBe(123.45);
  });

  // --- Gestion des erreurs HTTP ---

  it('should propagate HTTP error on getTotalCollected', () => {
    let errorCaught = false;
    service.getTotalCollected().subscribe({
      error: () => (errorCaught = true),
    });

    const req = httpMock.expectOne(`${apiUrl}/total-collected`);
    req.flush('Erreur serveur', { status: 500, statusText: 'Internal Server Error' });

    expect(errorCaught).toBe(true);
  });

  it('should propagate HTTP error on getCollectedPerDay', () => {
    let errorCaught = false;
    service.getCollectedPerDay().subscribe({
      error: () => (errorCaught = true),
    });

    const req = httpMock.expectOne(`${apiUrl}/collected-per-day`);
    req.flush('Erreur serveur', { status: 500, statusText: 'Internal Server Error' });

    expect(errorCaught).toBe(true);
  });
});
