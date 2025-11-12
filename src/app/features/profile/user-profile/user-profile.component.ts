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
