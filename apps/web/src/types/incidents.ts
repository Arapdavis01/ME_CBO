export type IncidentCategory =
  | "ILLEGAL_DUMPING"
  | "DEFORESTATION"
  | "WATER_POLLUTION"
  | "AIR_POLLUTION"
  | "WILDLIFE"
  | "OTHER";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";

export type Incident = {
  id: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  location: string;
  coords: { lat: number; lng: number };
  photoUrl?: string | null;
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
};

export type CreateIncidentPayload = {
  clientId: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  title: string;
  description: string;
  location: string;
  coords: { lat: number; lng: number };
  photoDataUrl?: string;
};
