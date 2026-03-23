import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from '../../../application/use-cases/tasks/tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@CurrentUser() user: any, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'ISO date string (YYYY-MM-DD)' })
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.tasksService.findAll(user.id, status, date);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get daily task stats' })
  @ApiQuery({ name: 'date', required: false })
  getDailyStats(@CurrentUser() user: any, @Query('date') date?: string) {
    return this.tasksService.getDailyStats(user.id, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tasksService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(user.id, id, dto);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark task as complete (awards points)' })
  complete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tasksService.complete(user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a task' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tasksService.remove(user.id, id);
  }
}
