import { IsString, Length, Matches } from "class-validator";

export class MfaSetupTicketStartDto {
  @IsString()
  @Length(36, 36)
  setupId!: string;
}

export class MfaSetupTicketConfirmDto {
  @IsString()
  @Length(36, 36)
  setupId!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: "Code must be 6 digits" })
  code!: string;
}
