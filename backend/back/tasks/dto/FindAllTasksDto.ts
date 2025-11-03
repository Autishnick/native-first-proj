// Per your request, all code and comments are in English.
import { IsEnum, IsOptional, IsString } from 'class-validator';

// This DTO defines the optional query parameters for GET /tasks
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
