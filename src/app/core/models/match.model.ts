import { Team } from './team.model';
import { Tournament } from './tournament.model';

export interface Match {
  id: number;
  tournament_id: number;
  team1_id: number;
  team2_id: number;
  scheduled_at: string;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled';
  format: string;
  score1?: number | null;
  score2?: number | null;
  winner_id?: number | null;
  odds_team1?: number; // ← Rendre optionnel avec ?
  odds_team2?: number; // ← Rendre optionnel avec ?
  created_at?: Date;
  tournament?: {
    id: number;
    name: string;
  };
  team1?: {
    id: number;
    name: string;
    logo_url: string;
  };
  team2?: {
    id: number;
    name: string;
    logo_url: string;
  };
  winner?: {
    id: number;
    name: string;
  };
}

export interface CreateMatchDto {
  tournament_id: number;
  team1_id: number;
  team2_id: number;
  scheduled_at: string;
  format: string;
}

export interface UpdateMatchDto {
  tournament_id?: number;
  team1_id?: number;
  team2_id?: number;
  scheduled_at?: string;
  status?: 'scheduled' | 'live' | 'finished' | 'cancelled';
  format?: string;
  score1?: number;
  score2?: number;
  winner_id?: number;
}
