import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CreateMealDto, UpdateMealDto } from '../../../presentation/modules/meals/dto/meal.dto';

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateMealDto) {
    return this.prisma.meal.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        calories: dto.calories,
        protein: dto.protein,
        carbs: dto.carbs,
        fat: dto.fat,
        loggedAt: dto.loggedAt ? new Date(dto.loggedAt) : new Date(),
      },
    });
  }

  async findAll(userId: string, date?: string, type?: string) {
    const where: any = { userId };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.loggedAt = { gte: start, lte: end };
    }

    if (type) {
      where.type = type;
    }

    return this.prisma.meal.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
    });
  }

  async findOne(userId: string, mealId: string) {
    const meal = await this.prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new NotFoundException('Meal not found');
    if (meal.userId !== userId) throw new ForbiddenException('Access denied');
    return meal;
  }

  async update(userId: string, mealId: string, dto: UpdateMealDto) {
    await this.findOne(userId, mealId);
    return this.prisma.meal.update({ where: { id: mealId }, data: dto });
  }

  async remove(userId: string, mealId: string) {
    await this.findOne(userId, mealId);
    await this.prisma.meal.delete({ where: { id: mealId } });
    return { message: 'Meal deleted successfully' };
  }

  async getDailyNutrition(userId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const meals = await this.prisma.meal.findMany({
      where: { userId, loggedAt: { gte: start, lte: end } },
    });

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    return {
      date: targetDate,
      meals,
      totals,
      mealCount: meals.length,
    };
  }
}
