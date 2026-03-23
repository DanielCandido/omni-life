import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MealType } from '@omni-life/shared';

export class CreateMealDto {
  @ApiProperty({ example: 'Grilled chicken salad' })
  @IsString()
  name: string;

  @ApiProperty({ enum: MealType })
  @IsEnum(MealType)
  type: MealType;

  @ApiProperty({ example: 480 })
  @IsNumber()
  @Min(0)
  calories: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  protein?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbs?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fat?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  loggedAt?: string;
}

export class UpdateMealDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: MealType, required: false })
  @IsOptional()
  @IsEnum(MealType)
  type?: MealType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  protein?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbs?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fat?: number;
}
