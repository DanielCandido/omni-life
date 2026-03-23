import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ScoringService } from '../../../application/use-cases/scoring/scoring.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('scoring')
@Controller('scoring')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Get('today')
  @ApiOperation({ summary: "Get today's score" })
  getTodayScore(@CurrentUser() user: any) {
    return this.scoringService.getTodayScore(user.id);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly summary' })
  getWeeklySummary(@CurrentUser() user: any) {
    return this.scoringService.getWeeklySummary(user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get score history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getHistory(@CurrentUser() user: any, @Query('limit') limit?: number) {
    return this.scoringService.getScoreHistory(user.id, limit);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get weekly leaderboard' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getLeaderboard(@Query('limit') limit?: number) {
    return this.scoringService.getLeaderboard(limit);
  }
}
