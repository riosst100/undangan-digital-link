export type CatalogTemplate = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  tier: "standard" | "exclusive";
  thumbnail_url: string | null;
  invitations_count: number | null;
  created_at: string;
};

export type TemplateCatalog = {
  newest: CatalogTemplate[];
  best_sellers: CatalogTemplate[];
  exclusive: CatalogTemplate[];
};
