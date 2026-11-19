export type LearningResource = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // markdown
  category: "COMPOSTING" | "REFORESTATION" | "WASTE" | "CLIMATE" | "HOW_TO";
  coverImageUrl?: string | null;
  durationMin: number;
  publishedAt: string;
};
