import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Bet,
  CreateBetDto,
  BetCalculation,
  AccumulatorBet,
} from '../models/bet.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BetService {
  private apiUrl = `${environment.apiUrl}/bets`;

  constructor(private http: HttpClient) {}

  /**
   * Crée un nouveau pari
   * @param data - Données du pari (match_id, team_id, amount, odds)
   * @returns Observable contenant le pari créé
   */
  createBet(data: CreateBetDto): Observable<Bet> {
    return this.http.post<Bet>(this.apiUrl, data).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  /**
   * Récupère tous les paris de l'utilisateur connecté
   * @returns Observable contenant la liste des paris de l'utilisateur
   */
  getMyBets(): Observable<Bet[]> {
    const userJson = localStorage.getItem('current_user');
    if (!userJson) {
      return of([]);
    }

    let userId: number;
    try {
      const user = JSON.parse(userJson);
      userId = user.id;
    } catch (e) {
      return of([]);
    }

    const url = `${this.apiUrl}/user/${userId}`;

    return this.http.get<Bet[]>(url).pipe(
      catchError((error) => {
        return of([]);
      })
    );
  }

  /**
   * Supprime un pari par son ID
   * @param id - ID du pari à supprimer
   * @returns Observable vide confirmant la suppression
   */
  deleteBet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  /**
   * Calcule le gain potentiel d'un pari
   * @param amount - Montant misé
   * @param odds - Cote du pari
   * @returns Observable contenant le calcul du gain potentiel
   */
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

  /**
   * Calcule le profit net d'un pari (gain - mise)
   * @param amount - Montant misé
   * @param odds - Cote du pari
   * @returns Observable contenant le calcul du profit
   */
  calculateProfit(amount: number, odds: number): Observable<BetCalculation> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('odds', odds.toString());
    return this.http.get<BetCalculation>(`${this.apiUrl}/calculate/profit`, {
      params,
    });
  }

  /**
   * Valide une cote selon les règles métier
   * @param odds - Cote à valider
   * @returns Observable contenant le résultat de validation
   */
  validateOdds(odds: number): Observable<BetCalculation> {
    const params = new HttpParams().set('odds', odds.toString());
    return this.http.get<BetCalculation>(`${this.apiUrl}/validate/odds`, {
      params,
    });
  }

  /**
   * Calcule la probabilité implicite d'une cote
   * @param odds - Cote à analyser
   * @returns Observable contenant la probabilité implicite en pourcentage
   */
  getImpliedProbability(odds: number): Observable<BetCalculation> {
    const params = new HttpParams().set('odds', odds.toString());
    return this.http.get<BetCalculation>(
      `${this.apiUrl}/calculate/implied-probability`,
      {
        params,
      }
    );
  }

  /**
   * Calcule la cote totale d'un pari combiné (accumulator)
   * @param data - Données du pari combiné contenant plusieurs paris
   * @returns Observable contenant la cote totale combinée
   */
  calculateAccumulatorOdds(
    data: AccumulatorBet
  ): Observable<{ total_odds: number }> {
    return this.http.post<{ total_odds: number }>(
      `${this.apiUrl}/calculate/accumulator-odds`,
      data
    );
  }

  /**
   * Calcule le retour sur investissement (ROI)
   * @param totalStaked - Montant total misé
   * @param totalReturned - Montant total récupéré
   * @returns Observable contenant le ROI en pourcentage
   */
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

  /**
   * Récupère tous les paris de la plateforme (accès admin)
   * @returns Observable contenant la liste complète de tous les paris
   */
  getAllBets(): Observable<Bet[]> {
    return this.http.get<Bet[]>(this.apiUrl).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }
}
