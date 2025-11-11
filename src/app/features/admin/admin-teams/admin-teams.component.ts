import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TeamService } from '../../../core/services/team.service';
import { Team } from '../../../core/models/team.model';

@Component({
  selector: 'app-admin-teams',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-container">
      <h1>🏆 Gestion des Équipes</h1>

      <div class="form-card">
        <h2>{{ editMode ? 'Modifier' : 'Créer' }} une équipe</h2>
        <form [formGroup]="teamForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>Nom de l'équipe *</label>
              <input
                type="text"
                formControlName="name"
                placeholder="Team Alpha"
              />
            </div>

            <div class="form-group">
              <label>Région *</label>
              <input
                type="text"
                formControlName="region"
                placeholder="EU, NA, KR..."
              />
            </div>
          </div>

          <div class="form-group">
            <label>Logo de l'équipe (optionnel)</label>
            <input
              type="file"
              (change)="onFileSelected($event)"
              accept="image/*"
            />
            <small
              >Si vous ne téléchargez pas de logo, un logo par défaut sera
              utilisé.</small
            >
          </div>

          @if (previewUrl) {
          <div class="preview">
            <img [src]="previewUrl" alt="Preview" />
          </div>
          }

          <div class="form-actions">
            <button
              type="submit"
              class="btn-primary"
              [disabled]="teamForm.invalid || loading"
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

      <div class="table-card">
        <h2>Liste des équipes ({{ teams().length }})</h2>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Nom</th>
                <th>Région</th>
                <th>Victoires</th>
                <th>Défaites</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (team of teams(); track team.id) {
              <tr>
                <td>
                  <img
                    [src]="team.logo_url"
                    [alt]="team.name"
                    class="team-logo"
                  />
                </td>
                <td>
                  <strong>{{ team.name }}</strong>
                </td>
                <td>
                  <span class="region-badge">{{ team.region }}</span>
                </td>
                <td class="wins">{{ team.wins }}</td>
                <td class="losses">{{ team.losses }}</td>
                <td>
                  <button
                    class="btn-icon"
                    (click)="editTeam(team)"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-icon danger"
                    (click)="deleteTeam(team)"
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

      .form-group input {
        width: 100%;
        padding: 10px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
      }

      .form-group input:focus {
        outline: none;
        border-color: #667eea;
      }

      .preview {
        margin: 16px 0;
        text-align: center;
      }

      .preview img {
        max-width: 200px;
        max-height: 200px;
        object-fit: contain;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 8px;
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

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
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
        color: #333;
      }

      .team-logo {
        width: 50px;
        height: 50px;
        object-fit: contain;
      }

      .region-badge {
        background: #667eea;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }

      .wins {
        color: #4caf50;
        font-weight: 600;
      }

      .losses {
        color: #f44336;
        font-weight: 600;
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

      .btn-icon.danger:hover {
        filter: brightness(1.2);
      }

      small {
        display: block;
        margin-top: 5px;
        color: #666;
        font-size: 12px;
      }
    `,
  ],
})
export class AdminTeamsComponent implements OnInit {
  teamForm: FormGroup;
  teams = signal<Team[]>([]);
  loading = false;
  editMode = false;
  currentTeamId?: number;
  selectedFile?: File;
  previewUrl?: string;

  constructor(private fb: FormBuilder, private teamService: TeamService) {
    this.teamForm = this.fb.group({
      name: ['', Validators.required],
      region: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.teamService.getAllTeams().subscribe((teams) => this.teams.set(teams));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.teamForm.valid) {
      this.loading = true;
      console.log('='.repeat(50));
      console.log('📝 FORM SUBMISSION');
      console.log('='.repeat(50));
      console.log('Form values:', this.teamForm.value);
      console.log('Edit mode:', this.editMode);
      console.log('Current team ID:', this.currentTeamId);

      const data = {
        name: this.teamForm.value.name,
        region: this.teamForm.value.region,
        logo_url:
          this.teamForm.value.logo_url || 'https://via.placeholder.com/150',
      };

      console.log('📤 Data to send:', JSON.stringify(data, null, 2));
      console.log('🔐 Token exists:', !!localStorage.getItem('access_token'));
      console.log('🌐 API will call:', 'http://localhost:3000/teams');

      if (this.editMode && this.currentTeamId) {
        console.log('🔄 UPDATE MODE');

        this.teamService.updateTeam(this.currentTeamId, data).subscribe({
          next: (response) => {
            console.log('✅ UPDATE SUCCESS:', response);
            alert('✅ Équipe modifiée !');
            this.loadTeams();
            this.resetForm();
          },
          error: (error) => {
            console.error('❌ UPDATE ERROR');
            console.error('Full error object:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error body:', error.error);

            let errorMsg = "Impossible de modifier l'équipe";
            if (error.status === 0) {
              errorMsg = '❌ Erreur de connexion. Backend non accessible.';
            } else if (error.status === 401) {
              errorMsg = '❌ Non authentifié. Reconnectez-vous.';
            } else if (error.error?.message) {
              errorMsg = error.error.message;
            }

            alert(`Erreur: ${errorMsg}`);
            this.loading = false;
          },
          complete: () => (this.loading = false),
        });
      } else {
        console.log('➕ CREATE MODE');

        this.teamService.createTeamSimple(data).subscribe({
          next: (response) => {
            console.log('✅ CREATE SUCCESS:', response);
            alert('✅ Équipe créée avec succès !');
            this.loadTeams();
            this.resetForm();
          },
          error: (error) => {
            console.error('❌ CREATE ERROR');
            console.error('Full error object:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error body:', error.error);
            console.error('Error headers:', error.headers);

            let errorMsg = "Impossible de créer l'équipe";
            if (error.status === 0) {
              errorMsg =
                '❌ Erreur de connexion. Vérifiez que le backend est démarré sur http://localhost:3000';
            } else if (error.status === 401) {
              errorMsg =
                '❌ Non authentifié. Token invalide ou expiré. Reconnectez-vous.';
            } else if (error.status === 403) {
              errorMsg =
                "❌ Accès refusé. Vous n'avez pas les droits administrateur.";
            } else if (error.error?.message) {
              errorMsg = error.error.message;
            }

            alert(`Erreur: ${errorMsg}`);
            this.loading = false;
          },
          complete: () => (this.loading = false),
        });
      }
    } else {
      console.log('❌ FORM INVALID');
      Object.keys(this.teamForm.controls).forEach((key) => {
        const control = this.teamForm.get(key);
        if (control?.invalid) {
          console.log(`❌ Invalid field: ${key}`, control.errors);
        }
      });
      alert('Veuillez remplir tous les champs obligatoires (nom et région)');
    }
  }

  editTeam(team: Team): void {
    this.editMode = true;
    this.currentTeamId = team.id;
    this.teamForm.patchValue({
      name: team.name,
      region: team.region,
    });
    this.previewUrl = team.logo_url;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteTeam(team: Team): void {
    if (confirm(`Supprimer ${team.name} ?`)) {
      this.teamService.deleteTeam(team.id).subscribe({
        next: () => {
          alert('Équipe supprimée !');
          this.loadTeams();
        },
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.teamForm.reset();
    this.editMode = false;
    this.currentTeamId = undefined;
    this.selectedFile = undefined;
    this.previewUrl = undefined;
  }
}
