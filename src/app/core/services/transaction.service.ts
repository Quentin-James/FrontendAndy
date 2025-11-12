import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Transaction,
  CreateTransactionDto,
  TransactionStats,
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de toutes les transactions
   * @returns Observable contenant la liste complète des transactions
   */
  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  /**
   * Récupère les détails d'une transaction spécifique
   * @param id - ID de la transaction à récupérer
   * @returns Observable contenant les détails de la transaction
   */
  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère toutes les transactions d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Observable contenant la liste des transactions de l'utilisateur
   */
  getUserTransactions(userId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Alias pour getUserTransactions (compatibilité)
   * @param userId - ID de l'utilisateur
   * @returns Observable contenant la liste des transactions de l'utilisateur
   */
  getUserTransactionStats(userId: number): Observable<Transaction[]> {
    return this.getUserTransactions(userId);
  }

  /**
   * Crée une nouvelle transaction (dépôt, retrait, etc.)
   * @param data - Données de la transaction (user_id, type, amount, balance_after, description)
   * @returns Observable contenant la transaction créée
   */
  createTransaction(data: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, data);
  }

  /**
   * Supprime une transaction
   * @param id - ID de la transaction à supprimer
   * @returns Observable vide confirmant la suppression
   */
  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
