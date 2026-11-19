import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { CertificateType, ImpactType } from "@prisma/client";

/* ─── Log an impact entry ──────────────────────────────────── */

export class CreateImpactLogDto {
  @ApiProperty({ enum: ["TREES_PLANTED", "WASTE_COLLECTED", "HOURS_VOLUNTEERED", "EVENT_ATTENDED", "CARBON_OFFSET"] })
  @IsEnum(["TREES_PLANTED", "WASTE_COLLECTED", "HOURS_VOLUNTEERED", "EVENT_ATTENDED", "CARBON_OFFSET"] as const)
  type!: ImpactType;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.1)
  @Max(100000)
  value!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

/* ─── History query ────────────────────────────────────────── */

export class HistoryQueryDto {
  @ApiPropertyOptional({ example: 6, description: "Number of months, 1–24" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  months?: number;
}

/* ─── Certificate issuance ─────────────────────────────────── */

export class IssueCertificateDto {
  @ApiProperty({ enum: ["VOLUNTEER_HOURS", "TREES_PLANTED", "WASTE_COLLECTED", "ANNUAL_IMPACT"] })
  @IsEnum(["VOLUNTEER_HOURS", "TREES_PLANTED", "WASTE_COLLECTED", "ANNUAL_IMPACT"] as const)
  type!: CertificateType;

  @ApiPropertyOptional({ example: "2025-01-01T00:00:00Z", description: "Period start (defaults to Jan 1 of current year)" })
  @IsOptional()
  @IsISO8601()
  periodFrom?: string;

  @ApiPropertyOptional({ example: "2025-12-31T23:59:59Z", description: "Period end (defaults to now)" })
  @IsOptional()
  @IsISO8601()
  periodTo?: string;
}

/* ─── Response shapes ──────────────────────────────────────── */

export type ImpactMetricResponse = {
  treesPlanted: number;
  wasteCollectedKg: number;
  volunteerHours: number;
  eventsAttended: number;
  carbonOffsetKg: number;
};

export type BadgeResponse = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
  progress: { current: number; target: number };
};

export type HistoryPointResponse = {
  month: string; // "2024-01"
  trees: number;
  wasteKg: number;
  hours: number;
};

export type CertificateResponse = {
  id: string;
  type: CertificateType;
  title: string;
  issuedAt: string;
  periodFrom: string;
  periodTo: string;
  memberName: string;
  verificationCode: string;
  metrics: ImpactMetricResponse;
};
