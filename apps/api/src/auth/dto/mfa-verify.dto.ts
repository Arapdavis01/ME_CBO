import { IsString, Length, IsUUID, Matches } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class MfaVerifyDto {
  @ApiProperty()
  @IsUUID()
  challengeId!: string;

  @ApiProperty({
    example: "123456",
    description: "6-digit authenticator code, or a 10-character backup code",
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(6, 24)
  @Matches(/^[A-Za-z0-9 -]+$/, { message: "Invalid code format" })
  code!: string;
}
