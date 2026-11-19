import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { EventCategory, EventStatus } from "@prisma/client";

/* ─── Create ─────────────────────────────────────────────── */

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(120)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  location!: string;

  @ApiProperty({ description: "Latitude" })
  @IsNumber()
  @Min(-90) @Max(90)
  lat!: number;

  @ApiProperty({ description: "Longitude" })
  @IsNumber()
  @Min(-180) @Max(180)
  lng!: number;

  @ApiProperty({ example: "2026-03-15T07:00:00Z" })
  @IsISO8601()
  startsAt!: string;

  @ApiProperty({ example: "2026-03-15T12:00:00Z" })
  @IsISO8601()
  endsAt!: string;

  @ApiProperty({ enum: ["CLEANUP", "PLANTING", "AWARENESS", "MEETING"] })
  @IsEnum(["CLEANUP", "PLANTING", "AWARENESS", "MEETING"] as const)
  category!: EventCategory;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(1)
  @Max(5000)
  capacity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;
}

/* ─── Update (all optional) ──────────────────────────────── */

export class UpdateEventDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MinLength(4) @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MinLength(20) @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() location?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber() @Min(-90) @Max(90) lat?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber() @Min(-180) @Max(180) lng?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsISO8601() startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsISO8601() endsAt?: string;

  @ApiPropertyOptional({ enum: ["CLEANUP", "PLANTING", "AWARENESS", "MEETING"] })
  @IsOptional() @IsEnum(["CLEANUP", "PLANTING", "AWARENESS", "MEETING"] as const)
  category?: EventCategory;

  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(1) @Max(5000) capacity?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsUrl() coverImageUrl?: string;

  @ApiPropertyOptional({ enum: ["DRAFT", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED"] })
  @IsOptional() @IsEnum(["DRAFT", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED"] as const)
  status?: EventStatus;
}

/* ─── Query ──────────────────────────────────────────────── */

export class ListEventsDto {
  @ApiPropertyOptional({ enum: ["CLEANUP", "PLANTING", "AWARENESS", "MEETING"] })
  @IsOptional() @IsEnum(["CLEANUP", "PLANTING", "AWARENESS", "MEETING"] as const)
  category?: EventCategory;

  @ApiPropertyOptional({ enum: ["DRAFT", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED"] })
  @IsOptional() @IsEnum(["DRAFT", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED"] as const)
  status?: EventStatus;
}

/* ─── Check-in ───────────────────────────────────────────── */

export class CheckInDto {
  @ApiProperty({ example: "MECBO-2026-AB12" })
  @IsString()
  @MinLength(6)
  token!: string;
}

/* ─── Proof of work ──────────────────────────────────────── */

export class CreateProofDto {
  @ApiProperty({ description: "Device-generated UUID — ensures idempotent offline retries" })
  @IsString() @MinLength(8) @MaxLength(64)
  clientId!: string;

  @ApiProperty({ description: "Base64 data URL or https URL" })
  @IsString()
  photoDataUrl!: string;

  @ApiProperty()
  @IsNumber() @Min(-90) @Max(90) lat!: number;

  @ApiProperty()
  @IsNumber() @Min(-180) @Max(180) lng!: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500) notes?: string;

  @ApiProperty({ example: "2026-03-15T09:12:34Z" })
  @IsISO8601()
  capturedAt!: string;
}

export class ReviewProofDto {
  @ApiProperty({ enum: ["VERIFIED", "REJECTED"] })
  @IsEnum(["VERIFIED", "REJECTED"] as const)
  decision!: "VERIFIED" | "REJECTED";
}

/* ─── Response shapes ────────────────────────────────────── */

export type EventResponse = {
  id: string;
  title: string;
  description: string;
  location: string;
  site: { lat: number; lng: number };
  startsAt: string;
  endsAt: string;
  status: EventStatus;
  category: EventCategory;
  capacity: number;
  attending: number;
  myRsvp: "GOING" | "WAITLIST" | "NONE";
  coverImageUrl: string | null;
};
