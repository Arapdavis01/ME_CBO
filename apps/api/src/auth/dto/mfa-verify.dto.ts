import { IsString, Length, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class MfaVerifyDto {
  @ApiProperty()
  @IsUUID()
  challengeId!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(6, 6)
  code!: string;
}
