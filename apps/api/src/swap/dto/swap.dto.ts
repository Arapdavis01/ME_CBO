import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";

export const SWAP_CATEGORIES = [
  "Tools",
  "Seedlings & plants",
  "Clothes",
  "Books",
  "Household",
  "Electronics",
  "Other",
] as const;

const trim = () =>
  Transform(({ value }) => (typeof value === "string" ? value.trim() : value));
const emptyToUndefined = () =>
  Transform(({ value }) => (value === "" ? undefined : value));

export class CreateListingDto {
  @trim() @IsString() @MinLength(3) @MaxLength(120)
  title!: string;

  @IsOptional() @emptyToUndefined() @trim() @IsString() @MaxLength(1000)
  description?: string;

  @IsIn(SWAP_CATEGORIES)
  category!: (typeof SWAP_CATEGORIES)[number];

  @IsOptional() @emptyToUndefined() @trim() @IsString() @MaxLength(200)
  wanted?: string;

  @IsOptional() @emptyToUndefined() @trim() @IsString() @MaxLength(120)
  location?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsUrl({ protocols: ["https"], require_protocol: true })
  imageUrl?: string;
}

export class UpdateListingDto {
  @IsOptional() @trim() @IsString() @MinLength(3) @MaxLength(120)
  title?: string;

  @IsOptional() @trim() @IsString() @MaxLength(1000)
  description?: string;

  @IsOptional() @IsIn(SWAP_CATEGORIES)
  category?: (typeof SWAP_CATEGORIES)[number];

  @IsOptional() @trim() @IsString() @MaxLength(200)
  wanted?: string;

  @IsOptional() @trim() @IsString() @MaxLength(120)
  location?: string;

  @IsOptional() @IsIn(["OPEN", "COMPLETED", "CANCELLED"])
  status?: "OPEN" | "COMPLETED" | "CANCELLED";
}

export class SwapRequestDto {
  @IsOptional() @emptyToUndefined() @trim() @IsString() @MaxLength(500)
  message?: string;
}

export class ListSwapDto {
  @IsOptional() @trim() @IsString() @MaxLength(80)
  q?: string;

  @IsOptional() @IsIn(SWAP_CATEGORIES)
  category?: (typeof SWAP_CATEGORIES)[number];
}
