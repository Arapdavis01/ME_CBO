export type PetitionStatus = "OPEN" | "CLOSED" | "DELIVERED";

export type Petition = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  target: string;
  goalSignatures: number;
  currentSignatures: number;
  status: PetitionStatus;
  createdAt: string;
  closesAt: string;
  createdBy: string;
  hasSigned: boolean;
};

export type CreatePetitionPayload = {
  title: string;
  summary: string;
  body: string;
  target: string;
  goalSignatures: number;
  closesAt: string;
};
