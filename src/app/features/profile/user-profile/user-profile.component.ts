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
  template: `
    <div class="profile-container">
      <h1>💼 Mon Profil</h1>

      <!-- Carte Solde -->
      <div class="balance-card">
        <div class="balance-header">
          <h2>💰 Mon Solde</h2>
          <span class="balance-amount"
            >{{ currentUser()?.balance || '0.00' }}€</span
          >
        </div>

        <div class="balance-actions">
          <button
            class="btn-deposit"
            (click)="showDepositForm = !showDepositForm"
          >
            ➕ Déposer
          </button>
          <button
            class="btn-withdraw"
            (click)="showWithdrawForm = !showWithdrawForm"
          >
            ➖ Retirer
          </button>
        </div>

        <!-- Formulaire Dépôt -->
        @if (showDepositForm) {
        <div class="transaction-form deposit-form">
          <h3>💳 Déposer de l'argent</h3>
          <form [formGroup]="depositForm" (ngSubmit)="onDeposit()">
            <div class="form-group">
              <label>Montant (€) *</label>
              <input
                type="number"
                formControlName="amount"
                placeholder="100"
                min="10"
                step="10"
              />
              <small>Montant minimum: 10€</small>
            </div>

            <div class="form-group">
              <label>Description</label>
              <input
                type="text"
                formControlName="description"
                placeholder="Dépôt par carte bancaire"
              />
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="btn-primary"
                [disabled]="depositForm.invalid || loading"
              >
                {{ loading ? 'Traitement...' : 'Confirmer le dépôt' }}
              </button>
              <button
                type="button"
                class="btn-secondary"
                (click)="showDepositForm = false"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
        }

        <!-- Formulaire Retrait -->
        @if (showWithdrawForm) {
        <div class="transaction-form withdraw-form">
          <h3>💸 Retirer de l'argent</h3>
          <form [formGroup]="withdrawForm" (ngSubmit)="onWithdraw()">
            <div class="form-group">
              <label>Montant (€) *</label>
              <input
                type="number"
                formControlName="amount"
                placeholder="50"
                min="10"
                [max]="currentBalance || 0"
                step="10"
              />
              <small>Solde disponible: {{ currentUser()?.balance }}€</small>
            </div>

            <div class="form-group">
              <label>Description</label>
              <input
                type="text"
                formControlName="description"
                placeholder="Retrait vers compte bancaire"
              />
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="btn-primary"
                [disabled]="withdrawForm.invalid || loading"
              >
                {{ loading ? 'Traitement...' : 'Confirmer le retrait' }}
              </button>
              <button
                type="button"
                class="btn-secondary"
                (click)="showWithdrawForm = false"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
        }
      </div>

      <!-- Informations Personnelles -->
      <div class="info-card">
        <h2>👤 Informations Personnelles</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Nom d'utilisateur:</span>
            <span class="value">{{ currentUser()?.username || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">{{ currentUser()?.email || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Rôle:</span>
            <span [class]="'role-badge ' + (currentUser()?.role || 'user')">
              {{
                currentUser()?.role === 'admin'
                  ? '👑 Administrateur'
                  : '👤 Utilisateur'
              }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Membre depuis:</span>
            <span class="value">{{
              currentUser()?.created_at
                ? (currentUser()?.created_at | date : 'dd/MM/yyyy')
                : '-'
            }}</span>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      @if (userStats) {
      <div class="stats-card">
        <h2>📊 Mes Statistiques</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <span class="stat-value">{{ userStats.totalBets }}</span>
              <span class="stat-label">Paris totaux</span>
            </div>
          </div>
          <div class="stat-item success">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <span class="stat-value">{{ userStats.wonBets }}</span>
              <span class="stat-label">Paris gagnés</span>
            </div>
          </div>
          <div class="stat-item danger">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <span class="stat-value">{{ userStats.lostBets }}</span>
              <span class="stat-label">Paris perdus</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <span class="stat-value">{{ userStats.pendingBets }}</span>
              <span class="stat-label">En attente</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <span class="stat-value">{{ userStats.winRate }}%</span>
              <span class="stat-label">Taux de réussite</span>
            </div>
          </div>
          <div
            class="stat-item"
            [class.success]="userStats.netProfit > 0"
            [class.danger]="userStats.netProfit < 0"
          >
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <span class="stat-value">{{ userStats.netProfit }}€</span>
              <span class="stat-label">Profit net</span>
            </div>
          </div>
        </div>
      </div>
      }

      <!-- Historique des Transactions -->
      <div class="transactions-card">
        <h2>📜 Historique des Transactions</h2>

        @if (transactions().length > 0) {
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Solde avant</th>
                <th>Solde après</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of transactions(); track tx.id) {
              <tr>
                <td>{{ tx.created_at | date : 'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <span [class]="'type-badge ' + tx.type">
                    {{ getTransactionLabel(tx.type) }}
                  </span>
                </td>
                <td [class]="getAmountClass(tx.type)">
                  {{
                    tx.type === 'deposit' ||
                    tx.type === 'bet_won' ||
                    tx.type === 'refund'
                      ? '+'
                      : '-'
                  }}{{ tx.amount }}€
                </td>
                <td>{{ tx.balance_before }}€</td>
                <td class="balance-after">{{ tx.balance_after }}€</td>
                <td>{{ tx.description || '-' }}</td>
              </tr>
              }
            </tbody>
          </table>
        </div>
        } @else {
        <p class="no-data">Aucune transaction pour le moment</p>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .profile-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 30px;
        color: #333;
      }

      .balance-card,
      .info-card,
      .stats-card,
      .transactions-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;
      }

      .balance-card h2,
      .info-card h2,
      .stats-card h2,
      .transactions-card h2 {
        margin-top: 0;
        color: #667eea;
      }

      /* Balance Card */
      .balance-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e0e0e0;
      }

      .balance-amount {
        font-size: 48px;
        font-weight: 700;
        color: #4caf50;
      }

      .balance-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
      }

      .btn-deposit,
      .btn-withdraw {
        flex: 1;
        padding: 16px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-deposit {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
      }

      .btn-withdraw {
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        color: white;
      }

      .btn-deposit:hover,
      .btn-withdraw:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      /* Transaction Forms */
      .transaction-form {
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        margin-top: 20px;
      }

      .deposit-form {
        border-color: #4caf50;
        background: #f1f8f4;
      }

      .withdraw-form {
        border-color: #ff9800;
        background: #fff8f1;
      }

      .transaction-form h3 {
        margin-top: 0;
        color: #333;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
      }

      .form-group input {
        width: 100%;
        padding: 10px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
      }

      .form-group small {
        display: block;
        margin-top: 5px;
        color: #666;
        font-size: 12px;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 20px;
      }

      .btn-primary,
      .btn-secondary {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        flex: 1;
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: #e0e0e0;
        color: #333;
      }

      /* Info Grid */
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .info-item .label {
        font-weight: 600;
        color: #666;
        font-size: 14px;
      }

      .info-item .value {
        font-size: 16px;
        color: #333;
      }

      .role-badge {
        padding: 6px 12px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        display: inline-block;
      }

      .role-badge.admin {
        background: #f44336;
        color: white;
      }

      .role-badge.user {
        background: #2196f3;
        color: white;
      }

      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
      }

      .stat-item {
        background: #f5f5f5;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .stat-item.success {
        background: #e8f5e9;
      }

      .stat-item.danger {
        background: #ffebee;
      }

      .stat-icon {
        font-size: 32px;
      }

      .stat-content {
        display: flex;
        flex-direction: column;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #333;
      }

      .stat-label {
        font-size: 12px;
        color: #666;
      }

      /* Transactions Table */
      .table-responsive {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      th {
        background: #f5f5f5;
        font-weight: 600;
      }

      .type-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .type-badge.deposit {
        background: #e8f5e9;
        color: #2e7d32;
      }

      .type-badge.withdrawal {
        background: #fff3e0;
        color: #e65100;
      }

      .type-badge.bet_placed {
        background: #e3f2fd;
        color: #1976d2;
      }

      .type-badge.bet_won {
        background: #e8f5e9;
        color: #2e7d32;
      }

      .type-badge.bet_lost {
        background: #ffebee;
        color: #c62828;
      }

      .type-badge.refund {
        background: #f3e5f5;
        color: #7b1fa2;
      }

      .amount-positive {
        color: #4caf50;
        font-weight: 600;
      }

      .amount-negative {
        color: #f44336;
        font-weight: 600;
      }

      .balance-after {
        font-weight: 600;
        color: #667eea;
      }

      .no-data {
        text-align: center;
        padding: 40px;
        color: #999;
      }
    `,
  ],
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
    console.log('🏠 UserProfile component initialized');
    const user = this.currentUser();
    console.log('👤 Current user:', user);
    console.log('💰 Current balance:', user?.balance);

    if (user) {
      this.loadTransactions(user.id);
      this.loadUserStats(user.id);
    } else {
      console.warn('⚠️ No user found, fetching profile...');
      // Si pas d'utilisateur, recharger le profil
      this.authService.getProfile().subscribe({
        next: (profileUser) => {
          console.log('✅ Profile loaded:', profileUser);
          this.loadTransactions(profileUser.id);
          this.loadUserStats(profileUser.id);
        },
        error: (error) => {
          console.error('❌ Error loading profile:', error);
        },
      });
    }
  }

  loadTransactions(userId: number): void {
    console.log('📡 Loading transactions for user:', userId);
    this.transactionService.getUserTransactionStats(userId).subscribe({
      next: (transactions: Transaction[]) => {
        console.log('✅ Transactions loaded:', transactions);
        this.transactions.set(transactions);
      },
      error: (error: any) => {
        console.error('❌ Error loading transactions:', error);
      },
    });
  }

  loadUserStats(userId: number): void {
    this.userService.getUserProfile(userId).subscribe({
      next: (stats) => {
        this.userStats = stats;
      },
      error: (error) => {
        console.error('❌ Error loading stats:', error);
      },
    });
  }

  onDeposit(): void {
    if (this.depositForm.valid) {
      this.loading = true;
      const user = this.currentUser();

      if (!user) {
        console.error('❌ No user found!');
        this.loading = false;
        return;
      }

      const amount = Number(this.depositForm.value.amount);
      const currentBalance = parseFloat(user.balance || '0');
      const newBalance = currentBalance + amount;

      console.log('💰 Deposit calculation:');
      console.log('  Current balance:', currentBalance);
      console.log('  Deposit amount:', amount);
      console.log('  New balance:', newBalance);

      const data = {
        user_id: user.id,
        type: 'deposit' as const,
        amount: amount,
        balance_after: newBalance,
        description: this.depositForm.value.description || 'Dépôt',
      };

      console.log('💰 Creating deposit transaction:', data);

      this.transactionService.createTransaction(data).subscribe({
        next: (response) => {
          console.log('✅ Transaction created:', response);

          // Utiliser PATCH /users/{id}/balance au lieu de PUT /users/:id
          console.log('📤 Updating user balance via PATCH to:', newBalance);

          this.userService.updateUserBalance(user.id, newBalance).subscribe({
            next: (updatedUser) => {
              console.log('✅ Balance updated in database:', updatedUser);
              console.log('✅ New balance from API:', updatedUser.balance);

              // Forcer la mise à jour du signal
              const balanceString = newBalance.toFixed(2);
              const userWithNewBalance = {
                ...user,
                balance: balanceString,
              };

              console.log('🔄 Forcing signal update');
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
              console.error('❌ Error updating balance:', error);
              alert(
                '⚠️ Transaction créée mais erreur lors de la mise à jour du solde. Rechargez la page.'
              );
              this.loading = false;
            },
          });
        },
        error: (error: any) => {
          console.error('❌ Error creating transaction:', error);
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

  onWithdraw(): void {
    if (this.withdrawForm.valid) {
      this.loading = true;
      const user = this.currentUser();

      if (!user) {
        console.error('❌ No user found!');
        this.loading = false;
        return;
      }

      const amount = Number(this.withdrawForm.value.amount);
      const currentBalance = parseFloat(user.balance || '0');

      console.log('💸 Withdraw calculation:');
      console.log('  Current balance:', currentBalance);
      console.log('  Withdraw amount:', amount);

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
      console.log('  New balance:', newBalance);

      const data = {
        user_id: user.id,
        type: 'withdrawal' as const,
        amount: amount,
        balance_after: newBalance,
        description: this.withdrawForm.value.description || 'Retrait',
      };

      console.log('💸 Creating withdrawal transaction:', data);

      this.transactionService.createTransaction(data).subscribe({
        next: (response) => {
          console.log('✅ Transaction created:', response);

          // Utiliser PATCH /users/{id}/balance
          console.log('📤 Updating user balance via PATCH to:', newBalance);

          this.userService.updateUserBalance(user.id, newBalance).subscribe({
            next: (updatedUser) => {
              console.log('✅ Balance updated in database:', updatedUser);
              console.log('✅ New balance from API:', updatedUser.balance);

              // Forcer la mise à jour du signal
              const balanceString = newBalance.toFixed(2);
              const userWithNewBalance = {
                ...user,
                balance: balanceString,
              };

              console.log('🔄 Forcing signal update');
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
              console.error('❌ Error updating balance:', error);
              alert(
                '⚠️ Transaction créée mais erreur lors de la mise à jour du solde. Rechargez la page.'
              );
              this.loading = false;
            },
          });
        },
        error: (error: any) => {
          console.error('❌ Error creating transaction:', error);
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

  // Return the current user's balance as a number or 0 if no user is available.
  get currentBalance(): number {
    const u = this.currentUser();
    return u ? parseFloat(u.balance) : 0;
  }

  getAmountClass(type: string): string {
    return ['deposit', 'bet_won', 'refund'].includes(type)
      ? 'amount-positive'
      : 'amount-negative';
  }
}
