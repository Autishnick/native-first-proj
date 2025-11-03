// Always write all code in English, including text in the code.
import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  uid: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsIn(['worker', 'employer']) // Adjust roles as needed
  @IsNotEmpty()
  role: string;

  // 'createdAt' will be set by Firestore (or your service),
  // so we don't expect it in the DTO from the client.
}
