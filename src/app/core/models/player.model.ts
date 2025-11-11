import { Team } from './team.model';

export interface Player {
  id: number;
  name: string;
  game_tag: string;
  position: string;
  birth_date: string;
  nationality: string;
  avatar_url: string;
  teams?: Team[];
}

export interface CreatePlayerDto {
  name: string;
  game_tag: string;
  position: string;
  birth_date: string;
  nationality: string;
  avatar_url: string;
}

export interface UpdatePlayerDto {
  name?: string;
  game_tag?: string;
  position?: string;
  birth_date?: string;
  nationality?: string;
  avatar_url?: string;
}
