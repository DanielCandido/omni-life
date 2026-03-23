import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from '../../../presentation/modules/tasks/dto/task.dto';
import { TaskStatus } from '@omni-life/shared';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private scoringService: ScoringService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        points: dto.points || 10,
      },
    });
  }

  async findAll(userId: string, status?: string, date?: string) {
    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    }

    return this.prisma.task.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Access denied');
    return task;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    await this.findOne(userId, taskId);

    const updateData: any = { ...dto };
    if (dto.dueDate) {
      updateData.dueDate = new Date(dto.dueDate);
    }

    const wasCompleted = dto.status === TaskStatus.COMPLETED;
    if (wasCompleted) {
      updateData.completedAt = new Date();
    }

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    // Update score if task was completed
    if (wasCompleted) {
      await this.scoringService.addPoints(userId, task.points, 1);
    }

    return task;
  }

  async complete(userId: string, taskId: string) {
    const task = await this.findOne(userId, taskId);

    if (task.status === TaskStatus.COMPLETED) {
      return task; // Already completed
    }

    const completed = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Award points
    await this.scoringService.addPoints(userId, task.points, 1);

    return completed;
  }

  async remove(userId: string, taskId: string) {
    await this.findOne(userId, taskId);
    await this.prisma.task.delete({ where: { id: taskId } });
    return { message: 'Task deleted successfully' };
  }

  async getDailyStats(userId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const [total, completed, pending] = await Promise.all([
      this.prisma.task.count({ where: { userId, dueDate: { gte: start, lte: end } } }),
      this.prisma.task.count({
        where: { userId, status: 'COMPLETED', completedAt: { gte: start, lte: end } },
      }),
      this.prisma.task.count({
        where: { userId, status: 'PENDING', dueDate: { gte: start, lte: end } },
      }),
    ]);

    return { total, completed, pending, completionRate: total > 0 ? (completed / total) * 100 : 0 };
  }
}
