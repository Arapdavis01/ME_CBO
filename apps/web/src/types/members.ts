export type MemberStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "ALUMNI";

export type Member = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
  status: MemberStatus;
  joinedAt: string;
  skills: string[];
  location: string;
  avatarUrl?: string | null;
};

export type MembershipApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  motivation: string;
  skills: string[];
  submittedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote?: string | null;
};
