import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Match, CreateMatchDto, UpdateMatchDto } from '../models/match.model';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private apiUrl = `${environment.apiUrl}/matches`;

  constructor(private http: HttpClient) {}

  getAllMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(this.apiUrl);
  }

  getMatchById(id: number): Observable<Match> {
    return this.http.get<Match>(`${this.apiUrl}/${id}`);
  }

  getMatchesByStatus(status: 'scheduled' | 'live' | 'finished' | 'cancelled'): Observable<Match[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Match[]>(`${this.apiUrl}/status`, { params });
  }

  createMatch(data: CreateMatchDto): Observable<Match> {
    return this.http.post<Match>(this.apiUrl, data);
  }

  updateMatch(id: number, data: UpdateMatchDto): Observable<Match> {
    return this.http.put<Match>(`${this.apiUrl}/${id}`, data);
  }

  deleteMatch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
