import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(12, { message: "Password must be at least 12 characters" })
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
