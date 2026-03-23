import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MealsService } from '../../../application/use-cases/meals/meals.service';
import { CreateMealDto, UpdateMealDto } from './dto/meal.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('meals')
@Controller('meals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post()
  @ApiOperation({ summary: 'Log a meal' })
  create(@CurrentUser() user: any, @Body() dto: CreateMealDto) {
    return this.mealsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meals' })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'type', required: false })
  findAll(
    @CurrentUser() user: any,
    @Query('date') date?: string,
    @Query('type') type?: string,
  ) {
    return this.mealsService.findAll(user.id, date, type);
  }

  @Get('nutrition')
  @ApiOperation({ summary: "Get daily nutrition summary" })
  @ApiQuery({ name: 'date', required: false })
  getDailyNutrition(@CurrentUser() user: any, @Query('date') date?: string) {
    return this.mealsService.getDailyNutrition(user.id, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meal by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.mealsService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a meal' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateMealDto) {
    return this.mealsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a meal' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.mealsService.remove(user.id, id);
  }
}
