export interface Tournament {
  id: number;
  name: string;
  game: string;
  prize_pool: number;
  logo_url: string;
  start_date: string;
  end_date: string;
  status?: string;
  created_at?: Date;
}

export interface CreateTournamentDto {
  name: string;
  game: string;
  prize_pool: number;
  logo_url: string;
  start_date: string;
  end_date: string;
  status?: string;
}

export interface UpdateTournamentDto {
  name?: string;
  game?: string;
  prize_pool?: number;
  logo_url?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}
