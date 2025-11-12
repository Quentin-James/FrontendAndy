import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { User } from '../../../core/models/user.model';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  currentUser = this.authService.currentUser;
  transactions = signal<Transaction[]>([]);
  userStats: any = null;

  depositForm: FormGroup;
  withdrawForm: FormGroup;

  showDepositForm = false;
  showWithdrawForm = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {
    this.depositForm = this.fb.group({
      amount: [100, [Validators.required, Validators.min(10)]],
      description: ['Dépôt'],
    });

    this.withdrawForm = this.fb.group({
      amount: [50, [Validators.required, Validators.min(10)]],
      description: ['Retrait'],
    });
  }

  ngOnInit(): void {
    const user = this.currentUser();

    if (user) {
      this.loadTransactions(user.id);
      this.loadUserStats(user.id);
    } else {
      // Si pas d'utilisateur, recharger le profil
      this.authService.getProfile().subscribe({
        next: (profileUser) => {
          this.loadTransactions(profileUser.id);
          this.loadUserStats(profileUser.id);
        },
        error: (error) => {
          // Gestion silencieuse de l'erreur
        },
      });
    }
  }

  /**
   * Charge l'historique des transactions d'un utilisateur
   * @param userId - ID de l'utilisateur
   */
  loadTransactions(userId: number): void {
    this.transactionService.getUserTransactionStats(userId).subscribe({
      next: (transactions: Transaction[]) => {
        this.transactions.set(transactions);
      },
      error: (error: any) => {
        // Gestion silencieuse de l'erreur
      },
    });
  }

  /**
   * Charge les statistiques d'un utilisateur (paris totaux, win rate, etc.)
   * @param userId - ID de l'utilisateur
   */
  loadUserStats(userId: number): void {
    this.userService.getUserProfile(userId).subscribe({
      next: (stats) => {
        this.userStats = stats;
      },
      error: (error) => {
        // Gestion silencieuse de l'erreur
      },
    });
  }

  /**
   * Traite le dépôt d'argent sur le compte utilisateur
   * Crée une transaction et met à jour le solde
   */
  onDeposit(): void {
    if (this.depositForm.valid) {
      this.loading = true;
      const user = this.currentUser();

      if (!user) {
        this.loading = false;
        return;
      }

      const amount = Number(this.depositForm.value.amount);
      const currentBalance = parseFloat(user.balance || '0');
      const newBalance = currentBalance + amount;

      const data = {
        user_id: user.id,
        type: 'deposit' as const,
        amount: amount,
        balance_after: newBalance,
        description: this.depositForm.value.description || 'Dépôt',
      };

      this.transactionService.createTransaction(data).subscribe({
        next: (response) => {
          // Utiliser PATCH /users/{id}/balance
          this.userService.updateUserBalance(user.id, newBalance).subscribe({
            next: (updatedUser) => {
              // Forcer la mise à jour du signal
              const balanceString = newBalance.toFixed(2);
              const userWithNewBalance = {
                ...user,
                balance: balanceString,
              };

              this.authService.currentUser.set(userWithNewBalance);
              this.cdr.detectChanges();

              alert(
                `✅ Dépôt de ${amount.toFixed(
                  2
                )}€ effectué avec succès !\n\nNouveau solde: ${balanceString}€`
              );
              this.showDepositForm = false;
              this.depositForm.reset({ amount: 100, description: 'Dépôt' });
              this.loadTransactions(user.id);
              this.loading = false;
            },
            error: (error: any) => {
              alert(
                '⚠️ Transaction créée mais erreur lors de la mise à jour du solde. Rechargez la page.'
              );
              this.loading = false;
            },
          });
        },
        error: (error: any) => {
          alert(
            `Erreur: ${
              error.error?.message || "Impossible d'effectuer le dépôt"
            }`
          );
          this.loading = false;
        },
      });
    }
  }

  /**
   * Traite le retrait d'argent du compte utilisateur
   * Vérifie le solde disponible, crée une transaction et met à jour le solde
   */
  onWithdraw(): void {
    if (this.withdrawForm.valid) {
      this.loading = true;
      const user = this.currentUser();

      if (!user) {
        this.loading = false;
        return;
      }

      const amount = Number(this.withdrawForm.value.amount);
      const currentBalance = parseFloat(user.balance || '0');

      if (amount > currentBalance) {
        alert(
          `❌ Solde insuffisant.\n\nSolde actuel: ${currentBalance.toFixed(
            2
          )}€\nMontant demandé: ${amount.toFixed(2)}€`
        );
        this.loading = false;
        return;
      }

      const newBalance = currentBalance - amount;

      const data = {
        user_id: user.id,
        type: 'withdrawal' as const,
        amount: amount,
        balance_after: newBalance,
        description: this.withdrawForm.value.description || 'Retrait',
      };

      this.transactionService.createTransaction(data).subscribe({
        next: (response) => {
          // Utiliser PATCH /users/{id}/balance
          this.userService.updateUserBalance(user.id, newBalance).subscribe({
            next: (updatedUser) => {
              // Forcer la mise à jour du signal
              const balanceString = newBalance.toFixed(2);
              const userWithNewBalance = {
                ...user,
                balance: balanceString,
              };

              this.authService.currentUser.set(userWithNewBalance);
              this.cdr.detectChanges();

              alert(
                `✅ Retrait de ${amount.toFixed(
                  2
                )}€ effectué avec succès !\n\nNouveau solde: ${balanceString}€`
              );
              this.showWithdrawForm = false;
              this.withdrawForm.reset({ amount: 50, description: 'Retrait' });
              this.loadTransactions(user.id);
              this.loading = false;
            },
            error: (error: any) => {
              alert(
                '⚠️ Transaction créée mais erreur lors de la mise à jour du solde. Rechargez la page.'
              );
              this.loading = false;
            },
          });
        },
        error: (error: any) => {
          alert(
            `Erreur: ${
              error.error?.message || "Impossible d'effectuer le retrait"
            }`
          );
          this.loading = false;
        },
      });
    }
  }

  /**
   * Traduit le type de transaction en français avec icône
   * @param type - Type de transaction en anglais
   * @returns Label en français avec icône
   */
  getTransactionLabel(type: string): string {
    const labels: Record<string, string> = {
      deposit: '💳 Dépôt',
      withdrawal: '💸 Retrait',
      bet_placed: '🎯 Pari placé',
      bet_won: '✅ Pari gagné',
      bet_lost: '❌ Pari perdu',
      refund: '↩️ Remboursement',
    };
    return labels[type] || type;
  }

  /**
   * Retourne le solde actuel de l'utilisateur connecté
   * @returns Solde disponible ou 0 si aucun utilisateur
   */
  get currentBalance(): number {
    const u = this.currentUser();
    return u ? parseFloat(u.balance) : 0;
  }

  /**
   * Détermine la classe CSS selon le type de transaction
   * @param type - Type de transaction
   * @returns Classe CSS (amount-positive ou amount-negative)
   */
  getAmountClass(type: string): string {
    return ['deposit', 'bet_won', 'refund'].includes(type)
      ? 'amount-positive'
      : 'amount-negative';
  }
}
