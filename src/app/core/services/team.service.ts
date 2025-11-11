import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Team, CreateTeamDto, UpdateTeamDto } from '../models/team.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/teams`;

  constructor(private http: HttpClient) {}

  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  getTeamById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${id}`);
  }

  searchTeams(name: string): Observable<Team[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Team[]>(`${this.apiUrl}/search`, { params });
  }

  getTeamsByRegion(region: string): Observable<Team[]> {
    const params = new HttpParams().set('region', region);
    return this.http.get<Team[]>(`${this.apiUrl}/region`, { params });
  }

  createTeam(formData: FormData): Observable<Team> {
    console.log('Creating team with FormData (file upload)');
    return this.http.post<Team>(this.apiUrl, formData);
  }

  createTeamSimple(data: {
    name: string;
    region: string;
    logo_url: string;
  }): Observable<Team> {
    console.log('➕ Creating team with JSON');
    console.log('API URL:', this.apiUrl);
    console.log('Payload:', JSON.stringify(data, null, 2));
    console.log(
      'Token:',
      localStorage.getItem('access_token') ? 'exists' : 'missing'
    );

    return this.http.post<Team>(this.apiUrl, data).pipe(
      tap((response) => {
        console.log('✅ Team created successfully:', response);
      }),
      catchError((error) => {
        console.error('❌ Error creating team:', error);
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        console.error('Error body:', error.error);
        console.error('URL:', error.url);
        return throwError(() => error);
      })
    );
  }

  updateTeam(id: number, data: any): Observable<Team> {
    console.log('Updating team:', id, data);
    return this.http.put<Team>(`${this.apiUrl}/${id}`, data);
  }

  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addPlayerToTeam(teamId: number, playerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${teamId}/players`, {
      player_id: playerId,
    });
  }

  removePlayerFromTeam(teamId: number, playerId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${teamId}/players/${playerId}`
    );
  }
}
