import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";

const trim = () =>
  Transform(({ value }) => (typeof value === "string" ? value.trim() : value));
const emptyToUndefined = () =>
  Transform(({ value }) => (value === "" ? undefined : value));

export class CreateItemDto {
  @trim() @IsString() @MinLength(2) @MaxLength(120)
  name!: string;

  @IsOptional() @trim() @IsString() @MaxLength(60)
  category?: string;

  @IsOptional() @emptyToUndefined() @trim() @IsString() @MaxLength(1000)
  description?: string;

  @IsOptional() @emptyToUndefined() @trim() @IsString() @MaxLength(120)
  location?: string;

  @IsInt() @Min(0) @Max(100000)
  quantityTotal!: number;
}

export class UpdateItemDto {
  @IsOptional() @trim() @IsString() @MinLength(2) @MaxLength(120)
  name?: string;

  @IsOptional() @trim() @IsString() @MaxLength(60)
  category?: string;

  @IsOptional() @trim() @IsString() @MaxLength(1000)
  description?: string;

  @IsOptional() @trim() @IsString() @MaxLength(120)
  location?: string;

  @IsOptional() @IsInt() @Min(0) @Max(100000)
  quantityTotal?: number;
}

export class RequestLoanDto {
  @IsInt() @Min(1) @Max(10000)
  quantity!: number;

  @IsOptional() @emptyToUndefined() @trim() @IsString() @MaxLength(500)
  purpose?: string;

  @IsOptional() @emptyToUndefined() @IsDateString()
  neededBy?: string;
}

export class DecisionDto {
  @IsIn(["APPROVED", "REJECTED"])
  decision!: "APPROVED" | "REJECTED";
}
