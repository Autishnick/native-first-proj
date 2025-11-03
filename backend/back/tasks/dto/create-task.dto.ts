// Always write all code in English, including text in the code.
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @IsNotEmpty()
  payment: number;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string; // Or Date, if you handle date objects

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsOptional()
  address?: string;

  // Fields like createdBy, createdByDisplayName, status, etc.,
  // should be added by the service (ideally from auth data)
  // For now, let's assume they come from the client for simplicity
  // or we add them in the service.

  // Let's add the required user info here for now
  @IsString()
  @IsNotEmpty()
  createdBy: string; // User UID

  @IsString()
  @IsNotEmpty()
  createdByDisplayName: string;
}
