import { IsEnum, IsOptional, IsString } from 'class-validator';

export class FindAllTasksDto {
  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(['date', 'price', 'alphabet'])
  @IsOptional()
  sort?: 'date' | 'price' | 'alphabet';

  @IsEnum(['asc', 'desc'])
  @IsOptional()
  order?: 'asc' | 'desc';

  @IsString()
  @IsOptional()
  search?: string;
}
