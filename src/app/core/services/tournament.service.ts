import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Tournament,
  CreateTournamentDto,
  UpdateTournamentDto,
} from '../models/tournament.model';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private apiUrl = `${environment.apiUrl}/tournaments`;

  constructor(private http: HttpClient) {}

  getAllTournaments(): Observable<Tournament[]> {
    console.log('📡 Fetching all tournaments from:', this.apiUrl);
    return this.http.get<Tournament[]>(this.apiUrl);
  }

  getTournamentById(id: number): Observable<Tournament> {
    console.log('📡 Fetching tournament:', id);
    return this.http.get<Tournament>(`${this.apiUrl}/${id}`);
  }

  getTournamentsByStatus(status: string): Observable<Tournament[]> {
    const params = new HttpParams().set('status', status);
    console.log('📡 Fetching tournaments by status:', status);
    return this.http.get<Tournament[]>(`${this.apiUrl}/status`, { params });
  }

  getTournamentsByGame(game: string): Observable<Tournament[]> {
    const params = new HttpParams().set('game', game);
    console.log('🎮 Fetching tournaments by game:', game);
    return this.http.get<Tournament[]>(`${this.apiUrl}/game`, { params });
  }

  createTournament(data: CreateTournamentDto): Observable<Tournament> {
    console.log('➕ Creating tournament with JSON');
    console.log('API URL:', this.apiUrl);
    console.log('Payload:', JSON.stringify(data, null, 2));
    console.log(
      'Token:',
      localStorage.getItem('access_token') ? 'exists' : 'missing'
    );

    return this.http.post<Tournament>(this.apiUrl, data).pipe(
      tap((response) => {
        console.log('✅ Tournament created successfully:', response);
      }),
      catchError((error) => {
        console.error('❌ Error creating tournament:', error);
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        console.error('Error body:', error.error);
        console.error('URL:', error.url);
        return throwError(() => error);
      })
    );
  }

  updateTournament(
    id: number,
    data: UpdateTournamentDto
  ): Observable<Tournament> {
    console.log('🔄 Updating tournament:', id, data);
    return this.http.put<Tournament>(`${this.apiUrl}/${id}`, data);
  }

  deleteTournament(id: number): Observable<void> {
    console.log('🗑️ Deleting tournament:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
