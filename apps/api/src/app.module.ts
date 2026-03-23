import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './presentation/modules/auth/auth.module';
import { UsersModule } from './presentation/modules/users/users.module';
import { TasksModule } from './presentation/modules/tasks/tasks.module';
import { MealsModule } from './presentation/modules/meals/meals.module';
import { TransactionsModule } from './presentation/modules/transactions/transactions.module';
import { ScoringModule } from './presentation/modules/scoring/scoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    TasksModule,
    MealsModule,
    TransactionsModule,
    ScoringModule,
  ],
})
export class AppModule {}
