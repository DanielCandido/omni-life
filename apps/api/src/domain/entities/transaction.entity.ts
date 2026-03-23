import { TransactionType, TransactionCategory } from '@omni-life/shared';

export class Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
