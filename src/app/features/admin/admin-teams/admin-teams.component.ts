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
  templateUrl: './admin-teams.component.html',
  styleUrls: ['./admin-teams.component.css'],
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
