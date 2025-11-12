import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

  /**
   * Récupère la liste de tous les tournois
   * @returns Observable contenant la liste complète des tournois
   */
  getAllTournaments(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.apiUrl);
  }

  /**
   * Récupère les détails d'un tournoi spécifique
   * @param id - ID du tournoi à récupérer
   * @returns Observable contenant les détails du tournoi
   */
  getTournamentById(id: number): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.apiUrl}/${id}`);
  }

  /**
   * Filtre les tournois par statut
   * @param status - Statut du tournoi (upcoming, ongoing, finished)
   * @returns Observable contenant la liste des tournois filtrés
   */
  getTournamentsByStatus(status: string): Observable<Tournament[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Tournament[]>(`${this.apiUrl}/status`, { params });
  }

  /**
   * Filtre les tournois par jeu
   * @param game - Nom du jeu (ex: League of Legends, Valorant, etc.)
   * @returns Observable contenant la liste des tournois pour ce jeu
   */
  getTournamentsByGame(game: string): Observable<Tournament[]> {
    const params = new HttpParams().set('game', game);
    return this.http.get<Tournament[]>(`${this.apiUrl}/game`, { params });
  }

  /**
   * Crée un nouveau tournoi
   * @param data - Données du tournoi à créer (name, game, prize_pool, start_date, end_date, logo_url, status)
   * @returns Observable contenant le tournoi créé
   */
  createTournament(data: CreateTournamentDto): Observable<Tournament> {
    return this.http.post<Tournament>(this.apiUrl, data).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour un tournoi existant
   * @param id - ID du tournoi à modifier
   * @param data - Données à mettre à jour
   * @returns Observable contenant le tournoi mis à jour
   */
  updateTournament(
    id: number,
    data: UpdateTournamentDto
  ): Observable<Tournament> {
    return this.http.put<Tournament>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprime un tournoi
   * @param id - ID du tournoi à supprimer
   * @returns Observable vide confirmant la suppression
   */
  deleteTournament(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
