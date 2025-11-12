import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Team, CreateTeamDto, UpdateTeamDto } from '../models/team.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/teams`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de toutes les équipes
   * @returns Observable contenant la liste complète des équipes
   */
  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  /**
   * Récupère les détails d'une équipe spécifique
   * @param id - ID de l'équipe à récupérer
   * @returns Observable contenant les détails de l'équipe
   */
  getTeamById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${id}`);
  }

  /**
   * Recherche des équipes par nom
   * @param name - Nom ou partie du nom à rechercher
   * @returns Observable contenant la liste des équipes correspondantes
   */
  searchTeams(name: string): Observable<Team[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Team[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Filtre les équipes par région
   * @param region - Région à filtrer (EU, NA, KR, etc.)
   * @returns Observable contenant la liste des équipes de cette région
   */
  getTeamsByRegion(region: string): Observable<Team[]> {
    const params = new HttpParams().set('region', region);
    return this.http.get<Team[]>(`${this.apiUrl}/region`, { params });
  }

  /**
   * Crée une nouvelle équipe avec upload de fichier (logo)
   * @param formData - FormData contenant les données de l'équipe et le fichier logo
   * @returns Observable contenant l'équipe créée
   */
  createTeam(formData: FormData): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, formData);
  }

  /**
   * Crée une nouvelle équipe avec des données JSON simples (sans upload de fichier)
   * @param data - Données de l'équipe (name, region, logo_url)
   * @returns Observable contenant l'équipe créée
   */
  createTeamSimple(data: {
    name: string;
    region: string;
    logo_url: string;
  }): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, data).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour une équipe existante
   * @param id - ID de l'équipe à modifier
   * @param data - Données à mettre à jour
   * @returns Observable contenant l'équipe mise à jour
   */
  updateTeam(id: number, data: any): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprime une équipe
   * @param id - ID de l'équipe à supprimer
   * @returns Observable vide confirmant la suppression
   */
  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Ajoute un joueur à une équipe
   * @param teamId - ID de l'équipe
   * @param playerId - ID du joueur à ajouter
   * @returns Observable vide confirmant l'ajout
   */
  addPlayerToTeam(teamId: number, playerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${teamId}/players`, {
      player_id: playerId,
    });
  }

  /**
   * Retire un joueur d'une équipe
   * @param teamId - ID de l'équipe
   * @param playerId - ID du joueur à retirer
   * @returns Observable vide confirmant le retrait
   */
  removePlayerFromTeam(teamId: number, playerId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${teamId}/players/${playerId}`
    );
  }
}
