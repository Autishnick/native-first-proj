// Per your request, all code and comments are in English.
import { IsNumber, IsPositive } from 'class-validator';

/**
 * This DTO validates the body for *placing* a bid.
 * It only expects the bidAmount, as the worker info
 * will be injected from the auth token.
 */
export class PlaceBidDto {
  @IsNumber()
  @IsPositive()
  bidAmount: number;
}
