import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";

const trim = () =>
  Transform(({ value }) => (typeof value === "string" ? value.trim() : value));
const trimEach = () =>
  Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((v) => (typeof v === "string" ? v.trim() : v)).filter(Boolean)
      : value,
  );
/** Empty strings from forms become "no value". */
const emptyToUndefined = () =>
  Transform(({ value }) => (value === "" ? undefined : value));

export const PROJECT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const PROJECT_PHASES = ["PLANNED", "ONGOING", "COMPLETED"] as const;

export class CreateProjectDto {
  @ApiProperty()
  @trim()
  @IsString() @MinLength(3) @MaxLength(120)
  title!: string;

  @ApiProperty({ description: "One or two sentences shown on cards" })
  @trim()
  @IsString() @MinLength(10) @MaxLength(220)
  summary!: string;

  @ApiProperty({ description: "Full story. Blank line = new paragraph" })
  @trim()
  @IsString() @MinLength(20) @MaxLength(8000)
  description!: string;

  @ApiPropertyOptional({ enum: PROJECT_STATUSES })
  @IsOptional() @IsIn(PROJECT_STATUSES)
  status?: (typeof PROJECT_STATUSES)[number];

  @ApiPropertyOptional({ enum: PROJECT_PHASES })
  @IsOptional() @IsIn(PROJECT_PHASES)
  phase?: (typeof PROJECT_PHASES)[number];

  @ApiPropertyOptional()
  @IsOptional() @emptyToUndefined() @trim() @IsString() @MaxLength(120)
  location?: string;

  @ApiPropertyOptional({ description: "YYYY-MM-DD" })
  @IsOptional() @emptyToUndefined() @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: "YYYY-MM-DD" })
  @IsOptional() @emptyToUndefined() @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional() @emptyToUndefined()
  @IsUrl({ protocols: ["https"], require_protocol: true }) @MaxLength(500)
  coverImageUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @trimEach()
  @IsArray() @ArrayMaxSize(12)
  @IsString({ each: true }) @MaxLength(160, { each: true })
  highlights?: string[];
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
