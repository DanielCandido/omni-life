import { MealType } from '@omni-life/shared';

export class Meal {
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
