import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { DashboardResponse, HealthRecord, MetricsResponse, RedFlagsResponse, PossibleRisk, RisksResponse } from '../models/health.model';

@Injectable({
    providedIn: 'root'
})
export class HealthService {
    private apiUrl = 'http://127.0.0.1:5000/api';

    private recordsSubject = new BehaviorSubject<HealthRecord[]>([]);
    records$ = this.recordsSubject.asObservable();

    private metricsSubject = new BehaviorSubject<MetricsResponse>({});
    metrics$ = this.metricsSubject.asObservable();

    private redflagsSubject = new BehaviorSubject<RedFlagsResponse>({ counts: [], recent_flags: [] });
    redflags$ = this.redflagsSubject.asObservable();

    private risksSubject = new BehaviorSubject<RisksResponse>({ counts: [], unique_risks: [] });
    risks$ = this.risksSubject.asObservable();

    constructor(private http: HttpClient, private auth: AuthService) { }

    getHeaders() {
        return { headers: { Authorization: `Bearer ${this.auth.getToken()}` } };
    }

    fetchDashboardRecords() {
        return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`, this.getHeaders()).pipe(
            tap(res => {
                this.recordsSubject.next(res.records || []);
            })
        );
    }

    fetchMetrics() {
        return this.http.get<MetricsResponse>(`${this.apiUrl}/health/metrics`, this.getHeaders()).pipe(
            tap(res => {
                this.metricsSubject.next(res || {});
            })
        );
    }

    fetchRedflags(range: string = '7d') {
        return this.http.get<RedFlagsResponse>(`${this.apiUrl}/health/redflags?range=${range}`, this.getHeaders()).pipe(
            tap(res => {
                this.redflagsSubject.next(res || { counts: [], recent_flags: [] });
            })
        );
    }

    fetchRisks(range: string = '7d') {
        return this.http.get<RisksResponse>(`${this.apiUrl}/health/risks?range=${range}`, this.getHeaders()).pipe(
            tap(res => {
                this.risksSubject.next(res || { counts: [], unique_risks: [] });
            })
        );
    }

    createHealthRecord(data: { symptoms: string, details: string, model_type?: string }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/health`, data, this.getHeaders()).pipe(
            tap(() => {
                this.fetchDashboardRecords().subscribe();
                this.fetchMetrics().subscribe();
                this.fetchRedflags().subscribe();
                this.fetchRisks().subscribe();
            })
        );
    }
}
