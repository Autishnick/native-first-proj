// Always write all code in English, including text in the code.
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBidDto {
  @IsNumber()
  @IsNotEmpty()
  bidAmount: number;

  @IsString()
  @IsNotEmpty()
  workerId: string; // UID of the worker placing the bid

  @IsString()
  @IsNotEmpty()
  workerName: string;
}
