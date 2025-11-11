import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Player,
  CreatePlayerDto,
  UpdatePlayerDto,
} from '../models/player.model';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private apiUrl = `${environment.apiUrl}/players`;

  constructor(private http: HttpClient) {}

  getAllPlayers(): Observable<Player[]> {
    console.log('📡 Fetching all players from:', this.apiUrl);
    return this.http.get<Player[]>(this.apiUrl);
  }

  getPlayerById(id: number): Observable<Player> {
    console.log('📡 Fetching player:', id);
    return this.http.get<Player>(`${this.apiUrl}/${id}`);
  }

  searchPlayers(name: string): Observable<Player[]> {
    const params = new HttpParams().set('name', name);
    console.log('🔍 Searching players:', name);
    return this.http.get<Player[]>(`${this.apiUrl}/search`, { params });
  }

  getPlayersByNationality(nationality: string): Observable<Player[]> {
    const params = new HttpParams().set('nationality', nationality);
    console.log('🌍 Fetching players by nationality:', nationality);
    return this.http.get<Player[]>(`${this.apiUrl}/nationality`, { params });
  }

  createPlayer(data: CreatePlayerDto): Observable<Player> {
    console.log('➕ Creating player:', data);
    return this.http.post<Player>(this.apiUrl, data);
  }

  updatePlayer(id: number, data: UpdatePlayerDto): Observable<Player> {
    console.log('🔄 Updating player:', id, data);
    return this.http.put<Player>(`${this.apiUrl}/${id}`, data);
  }

  deletePlayer(id: number): Observable<void> {
    console.log('🗑️ Deleting player:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
