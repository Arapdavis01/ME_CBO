import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "chair@mecbo.org" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "CorrectHorseBatteryStaple1!" })
  @IsString()
  @MinLength(8)
  password!: string;
}
