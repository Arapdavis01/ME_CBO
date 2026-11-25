import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";

const trim = () =>
  Transform(({ value }) => (typeof value === "string" ? value.trim() : value));
const emptyToUndefined = () =>
  Transform(({ value }) => (value === "" ? undefined : value));

export const ANNOUNCEMENT_KINDS = ["INFO", "MAINTENANCE", "WARNING"] as const;

export class CreateAnnouncementDto {
  @ApiProperty({ description: "Short text shown in the banner" })
  @trim()
  @IsString() @MinLength(5) @MaxLength(280)
  message!: string;

  @ApiPropertyOptional({ enum: ANNOUNCEMENT_KINDS })
  @IsOptional() @IsIn(ANNOUNCEMENT_KINDS)
  kind?: (typeof ANNOUNCEMENT_KINDS)[number];

  @ApiPropertyOptional({ description: "ISO date-time. Banner is hidden before this. Default: now" })
  @IsOptional() @emptyToUndefined() @IsDateString()
  showFrom?: string;

  @ApiPropertyOptional({ description: "ISO date-time: start of the planned update" })
  @IsOptional() @emptyToUndefined() @IsDateString()
  windowStart?: string;

  @ApiPropertyOptional({ description: "ISO date-time: end of the planned update. Banner disappears after this" })
  @IsOptional() @emptyToUndefined() @IsDateString()
  windowEnd?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  active?: boolean;
}

export class UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto) {}
