import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Bet,
  CreateBetDto,
  BetCalculation,
  AccumulatorBet,
} from '../models/bet.model';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BetService {
  private apiUrl = `${environment.apiUrl}/bets`;

  // Stockage local des paris en attendant que le backend ait un GET /bets
  private myBetsSubject = new BehaviorSubject<Bet[]>([]);
  public myBets$ = this.myBetsSubject.asObservable();

  constructor(private http: HttpClient) {
    // Charger les paris depuis localStorage au démarrage
    this.loadBetsFromStorage();
  }

  private loadBetsFromStorage(): void {
    const stored = localStorage.getItem('my_bets');
    if (stored) {
      try {
        const bets = JSON.parse(stored);
        this.myBetsSubject.next(bets);
        console.log('✅ Loaded bets from localStorage:', bets);
      } catch (e) {
        console.error('❌ Error parsing stored bets:', e);
      }
    }
  }

  private saveBetsToStorage(bets: Bet[]): void {
    localStorage.setItem('my_bets', JSON.stringify(bets));
    this.myBetsSubject.next(bets);
  }

  createBet(data: CreateBetDto): Observable<Bet> {
    console.log('🎯 Creating bet at URL:', this.apiUrl);
    console.log('🎯 Bet data:', data);

    return this.http.post<Bet>(this.apiUrl, data).pipe(
      tap((bet) => {
        console.log('✅ Bet created successfully:', bet);
      }),
      catchError((error) => {
        console.error('❌ Bet creation failed');
        console.error('❌ Status:', error.status);
        console.error('❌ Error:', error);
        throw error;
      })
    );
  }

  getMyBets(): Observable<Bet[]> {
    // Récupérer l'ID de l'utilisateur depuis le localStorage
    const userJson = localStorage.getItem('current_user');
    if (!userJson) {
      console.error('❌ No current user found in localStorage');
      return of([]);
    }

    let userId: number;
    try {
      const user = JSON.parse(userJson);
      userId = user.id;
    } catch (e) {
      console.error('❌ Error parsing current user:', e);
      return of([]);
    }

    const url = `${this.apiUrl}/user/${userId}`;
    console.log('📡 Fetching my bets from:', url);

    return this.http.get<Bet[]>(url).pipe(
      tap((bets) => {
        console.log('✅ Bets loaded from API:', bets);
        console.log('📊 Total bets:', bets.length);
      }),
      catchError((error) => {
        console.error('❌ Error loading bets:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ URL:', url);
        return of([]);
      })
    );
  }

  deleteBet(id: number): Observable<void> {
    console.log('🗑️ Deleting bet:', id);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log('✅ Bet deleted successfully');
        
        // Retirer aussi du localStorage si utilisé
        const currentBets = this.myBetsSubject?.value || [];
        const updatedBets = currentBets.filter((bet) => bet.id !== id);
        if (this.myBetsSubject) {
          this.saveBetsToStorage(updatedBets);
        }
      }),
      catchError((error) => {
        console.error('❌ Error deleting bet:', error);
        
        if (error.status === 404) {
          console.warn('⚠️ DELETE endpoint not available (404)');
          // Si l'API ne marche pas, supprimer quand même du localStorage
          if (this.myBetsSubject) {
            const currentBets = this.myBetsSubject.value;
            const updatedBets = currentBets.filter((bet) => bet.id !== id);
            this.saveBetsToStorage(updatedBets);
          }
          return of(void 0);
        }
        
        throw error;
      })
    );
  }

  // Calculs
  calculatePotentialWin(
    amount: number,
    odds: number
  ): Observable<BetCalculation> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('odds', odds.toString());
    return this.http.get<BetCalculation>(
      `${this.apiUrl}/calculate/potential-win`,
      { params }
    );
  }

  calculateProfit(amount: number, odds: number): Observable<BetCalculation> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('odds', odds.toString());
    return this.http.get<BetCalculation>(`${this.apiUrl}/calculate/profit`, {
      params,
    });
  }

  validateOdds(odds: number): Observable<BetCalculation> {
    const params = new HttpParams().set('odds', odds.toString());
    return this.http.get<BetCalculation>(`${this.apiUrl}/validate/odds`, {
      params,
    });
  }

  getImpliedProbability(odds: number): Observable<BetCalculation> {
    const params = new HttpParams().set('odds', odds.toString());
    return this.http.get<BetCalculation>(
      `${this.apiUrl}/calculate/implied-probability`,
      {
        params,
      }
    );
  }

  calculateAccumulatorOdds(
    data: AccumulatorBet
  ): Observable<{ total_odds: number }> {
    return this.http.post<{ total_odds: number }>(
      `${this.apiUrl}/calculate/accumulator-odds`,
      data
    );
  }

  calculateROI(
    totalStaked: number,
    totalReturned: number
  ): Observable<BetCalculation> {
    const params = new HttpParams()
      .set('totalStaked', totalStaked.toString())
      .set('totalReturned', totalReturned.toString());
    return this.http.get<BetCalculation>(`${this.apiUrl}/calculate/roi`, {
      params,
    });
  }

  getAllBets(): Observable<Bet[]> {
    console.log('📡 Fetching all bets from:', this.apiUrl);
    console.log(
      '🔐 Authorization:',
      localStorage.getItem('access_token') ? 'Present' : 'Missing'
    );

    return this.http.get<Bet[]>(this.apiUrl).pipe(
      tap((bets) => {
        console.log('✅ All bets loaded:', bets);
        console.log('📊 Total bets:', bets.length);
      }),
      catchError((error) => {
        console.error('❌ Error loading all bets');
        console.error('❌ Status:', error.status);
        console.error('❌ URL:', this.apiUrl);
        console.error('❌ Error:', error);
        throw error;
      })
    );
  }
}
