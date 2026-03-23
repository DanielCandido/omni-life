import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private prisma: PrismaService) {}

  async addPoints(userId: string, points: number, tasksCompleted = 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const score = await this.prisma.score.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        points: { increment: points },
        tasksCompleted: { increment: tasksCompleted },
      },
      create: {
        userId,
        date: today,
        points,
        tasksCompleted,
      },
    });

    this.logger.log(`User ${userId} earned ${points} points. Daily total: ${score.points}`);
    return score;
  }

  async getTodayScore(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const score = await this.prisma.score.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    return score || { userId, date: today, points: 0, tasksCompleted: 0 };
  }

  async getWeeklySummary(userId: string) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const scores = await this.prisma.score.findMany({
      where: {
        userId,
        date: { gte: weekStart, lte: today },
      },
      orderBy: { date: 'asc' },
    });

    const totalPoints = scores.reduce((sum, s) => sum + s.points, 0);
    const totalTasksCompleted = scores.reduce((sum, s) => sum + s.tasksCompleted, 0);

    return {
      weekStart,
      weekEnd: today,
      totalPoints,
      totalTasksCompleted,
      dailyScores: scores,
    };
  }

  async getScoreHistory(userId: string, limit = 30) {
    return this.prisma.score.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async getLeaderboard(limit = 10) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);

    const scores = await this.prisma.score.groupBy({
      by: ['userId'],
      where: { date: { gte: weekStart } },
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
    });

    const userIds = scores.map(s => s.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatarUrl: true },
    });

    return scores.map(score => ({
      user: users.find(u => u.id === score.userId),
      weeklyPoints: score._sum.points || 0,
    }));
  }
}
