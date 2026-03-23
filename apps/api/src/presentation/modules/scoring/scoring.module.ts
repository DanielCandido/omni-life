import { Module } from '@nestjs/common';
import { ScoringController } from './scoring.controller';
import { ScoringService } from '../../../application/use-cases/scoring/scoring.service';

@Module({
  controllers: [ScoringController],
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
