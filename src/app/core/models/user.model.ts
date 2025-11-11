export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  balance: string;
  created_at?: Date;
}

export interface UserProfile extends User {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  winRate?: number;
  rank?: number;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
}

export interface UpdateBalanceDto {
  amount: number;
  operation: 'add' | 'subtract';
}
