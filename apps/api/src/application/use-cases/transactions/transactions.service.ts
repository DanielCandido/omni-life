import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto } from '../../../presentation/modules/transactions/dto/transaction.dto';
import { TransactionType } from '@omni-life/shared';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        title: dto.title,
        amount: dto.amount,
        type: dto.type,
        category: dto.category,
        date: dto.date ? new Date(dto.date) : new Date(),
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: string, type?: string, category?: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (type) where.type = type;
    if (category) where.category = category;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.userId !== userId) throw new ForbiddenException('Access denied');
    return transaction;
  }

  async update(userId: string, transactionId: string, dto: UpdateTransactionDto) {
    await this.findOne(userId, transactionId);
    const updateData: any = { ...dto };
    if (dto.date) updateData.date = new Date(dto.date);
    return this.prisma.transaction.update({ where: { id: transactionId }, data: updateData });
  }

  async remove(userId: string, transactionId: string) {
    await this.findOne(userId, transactionId);
    await this.prisma.transaction.delete({ where: { id: transactionId } });
    return { message: 'Transaction deleted successfully' };
  }

  async getMonthlySummary(userId: string, year?: number, month?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = (month || now.getMonth() + 1) - 1;

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
    });

    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = transactions.reduce((acc: any, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += t.amount;
      return acc;
    }, {});

    return {
      year: targetYear,
      month: targetMonth + 1,
      income,
      expenses,
      balance: income - expenses,
      byCategory,
      transactionCount: transactions.length,
    };
  }
}
