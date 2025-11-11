import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-container">
      <h1>👥 Gestion des Utilisateurs</h1>

      <!-- Statistiques -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ users().length }}</h3>
            <p>Total Utilisateurs</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👑</div>
          <div class="stat-content">
            <h3>{{ countByRole('admin') }}</h3>
            <p>Admins</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👤</div>
          <div class="stat-content">
            <h3>{{ countByRole('user') }}</h3>
            <p>Users</p>
          </div>
        </div>
      </div>

      <!-- Formulaire de création -->
      <div class="form-card">
        <h2>{{ editMode ? 'Modifier' : 'Créer' }} un utilisateur</h2>
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Nom d'utilisateur *</label>
              <input
                type="text"
                formControlName="username"
                placeholder="JohnDoe"
              />
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input
                type="email"
                formControlName="email"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Mot de passe *</label>
              <input
                type="password"
                formControlName="password"
                placeholder="••••••"
              />
            </div>
            <div class="form-group">
              <label>Rôle *</label>
              <select formControlName="role">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Solde initial</label>
            <input
              type="number"
              formControlName="balance"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn-primary"
              [disabled]="userForm.invalid || loading"
            >
              {{ loading ? 'Chargement...' : editMode ? 'Modifier' : 'Créer' }}
            </button>
            @if (editMode) {
            <button type="button" class="btn-secondary" (click)="cancelEdit()">
              Annuler
            </button>
            }
          </div>
        </form>
      </div>

      <!-- Table des utilisateurs -->
      <div class="table-card">
        <h2>Liste des utilisateurs ({{ users().length }})</h2>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Solde</th>
                <th>Inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.id) {
              <tr>
                <td>{{ user.id }}</td>
                <td>
                  <strong>{{ user.username }}</strong>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span [class]="'role-badge ' + user.role">{{
                    user.role
                  }}</span>
                </td>
                <td class="balance">{{ user.balance }}€</td>
                <td>{{ user.created_at | date : 'short' }}</td>
                <td>
                  <button
                    class="btn-icon"
                    (click)="viewStats(user)"
                    title="Stats"
                  >
                    📊
                  </button>
                  <button
                    class="btn-icon"
                    (click)="editUser(user)"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-icon"
                    (click)="creditBalance(user)"
                    title="Créditer"
                  >
                    💰
                  </button>
                  <button
                    class="btn-icon danger"
                    (click)="deleteUser(user)"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-container {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 30px;
        color: #333;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .stat-icon {
        font-size: 48px;
      }

      .stat-content h3 {
        font-size: 32px;
        margin: 0;
        color: #667eea;
      }

      .stat-content p {
        margin: 5px 0 0 0;
        color: #666;
      }

      .form-card,
      .table-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;
      }

      .form-card h2,
      .table-card h2 {
        margin-top: 0;
        color: #667eea;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
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

      .form-group input,
      .form-group select {
        width: 100%;
        padding: 10px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: #667eea;
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
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: #e0e0e0;
        color: #333;
      }

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

      .role-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .role-badge.admin {
        background: #f44336;
        color: white;
      }

      .role-badge.user {
        background: #2196f3;
        color: white;
      }

      .balance {
        font-weight: 600;
        color: #4caf50;
      }

      .btn-icon {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 4px 8px;
        transition: transform 0.2s;
      }

      .btn-icon:hover {
        transform: scale(1.2);
      }
    `,
  ],
})
export class AdminUsersComponent implements OnInit {
  userForm: FormGroup;
  users = signal<User[]>([]);
  loading = false;
  editMode = false;
  currentUserId?: number;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['user', Validators.required],
      balance: [0],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe((users) => this.users.set(users));
  }

  countByRole(role: string): number {
    return this.users().filter((u) => u.role === role).length;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      const data = this.userForm.value;

      if (this.editMode && this.currentUserId) {
        this.userService.updateUser(this.currentUserId, data).subscribe({
          next: () => {
            alert('Utilisateur modifié !');
            this.loadUsers();
            this.resetForm();
          },
          complete: () => (this.loading = false),
        });
      } else {
        this.userService.createUser(data).subscribe({
          next: () => {
            alert('Utilisateur créé !');
            this.loadUsers();
            this.resetForm();
          },
          complete: () => (this.loading = false),
        });
      }
    }
  }

  editUser(user: User): void {
    this.editMode = true;
    this.currentUserId = user.id;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      role: user.role,
      balance: user.balance,
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewStats(user: User): void {
    this.userService.getUserProfile(user.id).subscribe((profile) => {
      alert(
        `Stats de ${user.username}:\n\nTotal Paris: ${profile.totalBets}\nGagnés: ${profile.wonBets}\nPerdus: ${profile.lostBets}\nWin Rate: ${profile.winRate}%`
      );
    });
  }

  creditBalance(user: User): void {
    const amount = prompt(
      `Créditer le compte de ${user.username}:\n\nMontant à ajouter:`
    );
    if (amount && !isNaN(+amount)) {
      const newBalance = parseFloat(user.balance) + parseFloat(amount);
      this.userService
        .updateUser(user.id, { balance: newBalance.toString() } as any)
        .subscribe({
          next: () => {
            alert(`${amount}€ crédités avec succès !`);
            this.loadUsers();
          },
        });
    }
  }

  deleteUser(user: User): void {
    if (
      confirm(
        `⚠️ ATTENTION ⚠️\n\nSupprimer définitivement ${user.username} ?\n\nCette action est irréversible !`
      )
    ) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          alert('Utilisateur supprimé !');
          this.loadUsers();
        },
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.userForm.reset({ role: 'user', balance: 0 });
    this.userForm.get('password')?.setValidators(Validators.required);
    this.userForm.get('password')?.updateValueAndValidity();
    this.editMode = false;
    this.currentUserId = undefined;
  }
}
