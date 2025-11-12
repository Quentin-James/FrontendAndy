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
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
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
