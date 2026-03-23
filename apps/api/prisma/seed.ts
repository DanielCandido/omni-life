import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@omnilife.app' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@omnilife.app',
      passwordHash,
    },
  });

  console.log('✅ Created user:', user.email);

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        userId: user.id,
        title: 'Morning workout',
        description: '30 minutes cardio',
        status: 'COMPLETED',
        priority: 'HIGH',
        completedAt: new Date(),
        points: 15,
      },
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        title: 'Read for 30 minutes',
        description: 'Read a book or article',
        status: 'PENDING',
        priority: 'MEDIUM',
        points: 10,
      },
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        title: 'Team meeting',
        description: 'Weekly standup',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 86400000),
        points: 15,
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} tasks`);

  // Create sample meals
  const meals = await Promise.all([
    prisma.meal.create({
      data: {
        userId: user.id,
        name: 'Oatmeal with berries',
        type: 'BREAKFAST',
        calories: 350,
        protein: 12,
        carbs: 60,
        fat: 6,
      },
    }),
    prisma.meal.create({
      data: {
        userId: user.id,
        name: 'Grilled chicken salad',
        type: 'LUNCH',
        calories: 480,
        protein: 42,
        carbs: 20,
        fat: 18,
      },
    }),
  ]);

  console.log(`✅ Created ${meals.length} meals`);

  // Create sample transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        userId: user.id,
        title: 'Monthly salary',
        amount: 5000,
        type: 'INCOME',
        category: 'SALARY',
        date: new Date(),
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        title: 'Grocery shopping',
        amount: 120.5,
        type: 'EXPENSE',
        category: 'FOOD',
        date: new Date(),
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        title: 'Netflix subscription',
        amount: 15.99,
        type: 'EXPENSE',
        category: 'ENTERTAINMENT',
        date: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${transactions.length} transactions`);

  // Create today's score
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.score.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: {},
    create: {
      userId: user.id,
      date: today,
      points: 25,
      tasksCompleted: 1,
    },
  });

  console.log('✅ Created score entry');
  console.log('🎉 Seeding complete!');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
