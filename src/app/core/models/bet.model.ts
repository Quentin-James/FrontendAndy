import { User } from './user.model';
import { Match } from './match.model';
import { Team } from './team.model';

export interface Bet {
  id: number;
  user_id: number;
  match_id: number;
  team_id: number;
  amount: string;
  odds: string;
  potential_win: string;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  created_at: Date;
  user?: User;
  match?: Match;
  team?: Team;
}

export interface CreateBetDto {
  match_id: number;
  team_id: number; // ← Changer de selected_team_id à team_id
  amount: number;
  odds: number;
}

export interface BetCalculation {
  potential_win?: number;
  profit?: number;
  implied_probability?: number;
  roi?: number;
  isValid?: boolean;
}

export interface AccumulatorBet {
  bets: Array<{
    match_id: number;
    team_id: number;
    odds: number;
  }>;
  stake: number;
}
