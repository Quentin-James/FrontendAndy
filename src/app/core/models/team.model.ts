import { Player } from './player.model';

export interface Team {
  id: number;
  name: string;
  logo_url: string;
  region: string;
  wins: number;
  losses: number;
  players?: Player[];
}

export interface CreateTeamDto {
  name: string;
  region: string;
  logo?: File;
}

export interface UpdateTeamDto {
  name?: string;
  region?: string;
  wins?: number;
  losses?: number;
}
