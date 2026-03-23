import {
  TaskStatus,
  TaskPriority,
  MealType,
  TransactionType,
  TransactionCategory,
} from '../constants/enums';

export interface IUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  completedAt?: Date;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMeal {
  id: string;
  userId: string;
  name: string;
  type: MealType;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction {
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

export interface IScore {
  id: string;
  userId: string;
  date: Date;
  points: number;
  tasksCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IApiResponse<T = unknown> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface IPaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
