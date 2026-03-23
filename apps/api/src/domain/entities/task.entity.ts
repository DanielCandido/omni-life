import { TaskStatus, TaskPriority } from '@omni-life/shared';

export class Task {
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
