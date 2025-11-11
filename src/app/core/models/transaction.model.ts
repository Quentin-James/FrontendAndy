export interface Transaction {
  id: number;
  user_id: number;
  type:
    | 'deposit'
    | 'withdrawal'
    | 'bet_placed'
    | 'bet_won'
    | 'bet_lost'
    | 'refund';
  amount: string;
  balance_before?: string;
  balance_after: string;
  description?: string;
  created_at: Date;
}

export interface CreateTransactionDto {
  user_id: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  balance_after: number;
  description?: string;
}

export interface TransactionStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalBets: number;
  totalWinnings: number;
  netBalance: number;
}
