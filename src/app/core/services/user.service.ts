import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  UserProfile,
  UpdateUserDto,
  UpdateBalanceDto,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de tous les utilisateurs
   * @returns Observable contenant la liste complète des utilisateurs
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Récupère les détails d'un utilisateur spécifique
   * @param id - ID de l'utilisateur à récupérer
   * @returns Observable contenant les détails de l'utilisateur
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Recherche un utilisateur par email
   * @param email - Email de l'utilisateur à rechercher
   * @returns Observable contenant l'utilisateur correspondant
   */
  getUserByEmail(email: string): Observable<User> {
    const params = new HttpParams().set('email', email);
    return this.http.get<User>(`${this.apiUrl}/search/email`, { params });
  }

  /**
   * Recherche un utilisateur par nom d'utilisateur
   * @param username - Nom d'utilisateur à rechercher
   * @returns Observable contenant l'utilisateur correspondant
   */
  getUserByUsername(username: string): Observable<User> {
    const params = new HttpParams().set('username', username);
    return this.http.get<User>(`${this.apiUrl}/search/username`, { params });
  }

  /**
   * Récupère le profil public d'un utilisateur avec ses statistiques
   * @param id - ID de l'utilisateur
   * @returns Observable contenant le profil et les statistiques
   */
  getUserProfile(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${id}/profile`);
  }

  /**
   * Met à jour les informations d'un utilisateur
   * @param id - ID de l'utilisateur à modifier
   * @param data - Données à mettre à jour (username, email, role, etc.)
   * @returns Observable contenant l'utilisateur mis à jour
   */
  updateUser(id: number, data: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Met à jour le solde d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param balance - Nouveau solde (nombre, pas string)
   * @returns Observable contenant l'utilisateur avec le solde mis à jour
   */
  updateUserBalance(userId: number, balance: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/balance`, {
      balance,
    });
  }

  /**
   * Supprime un utilisateur
   * @param id - ID de l'utilisateur à supprimer
   * @returns Observable vide confirmant la suppression
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère le classement des meilleurs parieurs
   * @returns Observable contenant la liste des utilisateurs classés par performance
   */
  getLeaderboard(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/leaderboard/top`);
  }

  /**
   * Crée un nouveau compte utilisateur
   * @param data - Données du nouvel utilisateur (username, email, password, role)
   * @returns Observable contenant l'utilisateur créé
   */
  createUser(data: any): Observable<User> {
    return this.http.post<User>(this.apiUrl, data);
  }
}
