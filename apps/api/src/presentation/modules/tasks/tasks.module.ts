import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from '../../../application/use-cases/tasks/tasks.service';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [ScoringModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
