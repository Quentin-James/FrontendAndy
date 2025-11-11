import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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

  getAllTransactions(): Observable<Transaction[]> {
    console.log('📡 Fetching all transactions');
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  getUserTransactions(userId: number): Observable<Transaction[]> {
    console.log('📡 Fetching transactions for user:', userId);
    return this.http.get<Transaction[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Alias pour compatibilité
  getUserTransactionStats(userId: number): Observable<Transaction[]> {
    return this.getUserTransactions(userId);
  }

  createTransaction(data: CreateTransactionDto): Observable<Transaction> {
    console.log('💰 Creating transaction:', data);
    return this.http
      .post<Transaction>(this.apiUrl, data)
      .pipe(
        tap((response) => console.log('✅ Transaction created:', response))
      );
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
