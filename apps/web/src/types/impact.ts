export type ImpactMetric = {
  treesPlanted: number;
  wasteCollectedKg: number;
  volunteerHours: number;
  eventsAttended: number;
  carbonOffsetKg: number;
};

export type ClubMetric = ImpactMetric & {
  activeMembers: number;
  cleanupZones: number;
  reforestationSites: number;
  fundsRaisedKes: number;
};

export type Badge = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: "sprout" | "leaf" | "tree" | "recycle" | "droplet" | "sun" | "star";
  earned: boolean;
  earnedAt: string | null;
  progress: { current: number; target: number };
};

export type Certificate = {
  id: string;
  type: "VOLUNTEER_HOURS" | "TREES_PLANTED" | "WASTE_COLLECTED" | "ANNUAL_IMPACT";
  title: string;
  issuedAt: string;
  periodFrom: string;
  periodTo: string;
  metrics: ImpactMetric;
  memberName: string;
  verificationCode: string;
};

export type ImpactHistory = {
  month: string; // "2024-01"
  trees: number;
  wasteKg: number;
  hours: number;
};
