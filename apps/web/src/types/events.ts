export type EventStatus = "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED" | "CANCELLED";

export type GeoPoint = { lat: number; lng: number };

export type EventItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  site: GeoPoint;
  startsAt: string;
  endsAt: string;
  status: EventStatus;
  capacity: number;
  attending: number;
  myRsvp: "GOING" | "WAITLIST" | "NONE";
  coverImageUrl?: string | null;
  category: "CLEANUP" | "PLANTING" | "AWARENESS" | "MEETING";
};

export type ProofOfWorkPayload = {
  clientId: string; // uuid generated on device
  eventId: string;
  photoDataUrl: string; // base64 (offline-safe)
  coords: GeoPoint;
  notes?: string;
  capturedAt: string; // ISO
};
