import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Match, CreateMatchDto, UpdateMatchDto } from '../models/match.model';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private apiUrl = `${environment.apiUrl}/matches`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de tous les matchs et met à jour automatiquement les statuts
   * Les matchs dont la date est passée et le statut est "scheduled" passent en "finished"
   * @returns Observable contenant la liste complète des matchs
   */
  getAllMatches(): Observable<Match[]> {
    return this.http
      .get<Match[]>(this.apiUrl)
      .pipe(map((matches) => this.updatePastMatchesStatus(matches)));
  }

  /**
   * Récupère les détails d'un match spécifique
   * @param id - ID du match à récupérer
   * @returns Observable contenant les détails du match
   */
  getMatchById(id: number): Observable<Match> {
    return this.http.get<Match>(`${this.apiUrl}/${id}`);
  }

  /**
   * Filtre les matchs par leur statut
   * @param status - Statut du match (scheduled, live, finished, cancelled)
   * @returns Observable contenant la liste des matchs filtrés
   */
  getMatchesByStatus(
    status: 'scheduled' | 'live' | 'finished' | 'cancelled'
  ): Observable<Match[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Match[]>(`${this.apiUrl}/status`, { params });
  }

  /**
   * Crée un nouveau match
   * @param data - Données du match à créer (tournament_id, team1_id, team2_id, scheduled_at, format)
   * @returns Observable contenant le match créé
   */
  createMatch(data: CreateMatchDto): Observable<Match> {
    return this.http.post<Match>(this.apiUrl, data);
  }

  /**
   * Met à jour un match existant
   * @param id - ID du match à modifier
   * @param data - Données à mettre à jour (status, scores, winner, etc.)
   * @returns Observable contenant le match mis à jour
   */
  updateMatch(id: number, data: UpdateMatchDto): Observable<Match> {
    return this.http.put<Match>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprime un match
   * @param id - ID du match à supprimer
   * @returns Observable vide confirmant la suppression
   */
  deleteMatch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Met à jour automatiquement le statut des matchs passés
   * @param matches - Liste des matchs à vérifier
   * @returns Liste des matchs avec statuts mis à jour
   * @private
   */
  private updatePastMatchesStatus(matches: Match[]): Match[] {
    const now = new Date();

    matches.forEach((match) => {
      const matchDate = new Date(match.scheduled_at);

      // Si le match est programmé mais la date est passée (+ 3h de marge)
      if (match.status === 'scheduled' && matchDate < now) {
        const hoursSinceMatch =
          (now.getTime() - matchDate.getTime()) / (1000 * 60 * 60);

        // Si le match date de plus de 3 heures, on le passe en finished
        if (hoursSinceMatch > 3) {
          this.updateMatchStatus(match.id, 'finished').subscribe({
            next: () => {
              match.status = 'finished';
            },
            error: () => {
              // Gestion silencieuse de l'erreur
            },
          });
        }
        // Si le match date de moins de 3 heures, on le passe en live
        else if (hoursSinceMatch > 0) {
          this.updateMatchStatus(match.id, 'live').subscribe({
            next: () => {
              match.status = 'live';
            },
            error: () => {},
          });
        }
      }
    });

    return matches;
  }

  /**
   * Met à jour uniquement le statut d'un match
   * @param id - ID du match
   * @param status - Nouveau statut
   * @returns Observable contenant le match mis à jour
   * @private
   */
  private updateMatchStatus(
    id: number,
    status: 'scheduled' | 'live' | 'finished' | 'cancelled'
  ): Observable<Match> {
    return this.http.put<Match>(`${this.apiUrl}/${id}`, { status });
  }
}
