import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from '../../../application/use-cases/transactions/transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  create(@CurrentUser() user: any, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  findAll(
    @CurrentUser() user: any,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionsService.findAll(user.id, type, category, startDate, endDate);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get monthly financial summary' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  getMonthlySummary(
    @CurrentUser() user: any,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.transactionsService.getMonthlySummary(user.id, year, month);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a transaction' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
