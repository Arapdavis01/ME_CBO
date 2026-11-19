export type SwapListing = {
  id: string;
  title: string;
  description: string;
  category: "FURNITURE" | "ELECTRONICS" | "CLOTHING" | "TOOLS" | "GARDEN" | "OTHER";
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
  photoUrl?: string | null;
  location: string;
  ownerId: string;
  ownerName: string;
  status: "AVAILABLE" | "RESERVED" | "CLAIMED";
  createdAt: string;
};
