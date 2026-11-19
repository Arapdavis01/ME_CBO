import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { ApplicationStatus, Role, UserStatus } from "@prisma/client";

/* ─── Public application ────────────────────────────────────── */

export class SubmitApplicationDto {
  @ApiProperty()
  @IsString() @MinLength(2) @MaxLength(120)
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString() @MinLength(7) @MaxLength(20)
  phone!: string;

  @ApiProperty()
  @IsString() @MinLength(20) @MaxLength(1000)
  motivation!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  skills?: string[];
}

/* ─── Review ────────────────────────────────────────────────── */

export class RejectApplicationDto {
  @ApiProperty()
  @IsString() @MinLength(3) @MaxLength(500)
  note!: string;
}

/* ─── Directory query ───────────────────────────────────────── */

export class DirectoryQueryDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(120)
  q?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(60)
  skill?: string;

  @ApiPropertyOptional({ enum: ["SUPER_ADMIN","OPERATIONS_ADMIN","FINANCE_ADMIN","TEAM_LEAD","MEMBER"] })
  @IsOptional() @IsEnum(["SUPER_ADMIN","OPERATIONS_ADMIN","FINANCE_ADMIN","TEAM_LEAD","MEMBER"] as const)
  role?: Role;
}

/* ─── Self profile update ───────────────────────────────────── */

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(120)
  location?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUrl()
  avatarUrl?: string;
}

/* ─── Response shapes ───────────────────────────────────────── */

export type ApplicationResponse = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  motivation: string;
  skills: string[];
  submittedAt: string;
  status: ApplicationStatus;
  reviewNote: string | null;
};

export type MemberResponse = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  joinedAt: string;
  skills: string[];
  location: string | null;
  avatarUrl: string | null;
};

export type MemberDetailResponse = MemberResponse & {
  bio: string | null;
  metrics: {
    treesPlanted: number;
    wasteCollectedKg: number;
    volunteerHours: number;
    eventsAttended: number;
  };
};
