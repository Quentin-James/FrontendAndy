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

  /**
   * Récupère la liste de tous les joueurs
   * @returns Observable contenant la liste complète des joueurs
   */
  getAllPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.apiUrl);
  }

  /**
   * Récupère les détails d'un joueur spécifique
   * @param id - ID du joueur à récupérer
   * @returns Observable contenant les détails du joueur
   */
  getPlayerById(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/${id}`);
  }

  /**
   * Recherche des joueurs par nom
   * @param name - Nom ou partie du nom à rechercher
   * @returns Observable contenant la liste des joueurs correspondants
   */
  searchPlayers(name: string): Observable<Player[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Player[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Filtre les joueurs par nationalité
   * @param nationality - Nationalité à filtrer
   * @returns Observable contenant la liste des joueurs de cette nationalité
   */
  getPlayersByNationality(nationality: string): Observable<Player[]> {
    const params = new HttpParams().set('nationality', nationality);
    return this.http.get<Player[]>(`${this.apiUrl}/nationality`, { params });
  }

  /**
   * Crée un nouveau joueur
   * @param data - Données du joueur à créer (name, game_tag, position, birth_date, nationality, avatar_url)
   * @returns Observable contenant le joueur créé
   */
  createPlayer(data: CreatePlayerDto): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, data);
  }

  /**
   * Met à jour un joueur existant
   * @param id - ID du joueur à modifier
   * @param data - Données à mettre à jour
   * @returns Observable contenant le joueur mis à jour
   */
  updatePlayer(id: number, data: UpdatePlayerDto): Observable<Player> {
    return this.http.put<Player>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprime un joueur
   * @param id - ID du joueur à supprimer
   * @returns Observable vide confirmant la suppression
   */
  deletePlayer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
