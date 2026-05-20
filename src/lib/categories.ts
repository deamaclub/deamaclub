export type CategorySlug =
  | "news"
  | "fights"
  | "hip-hop"
  | "sports"
  | "wild"
  | "celebrity";

export const CATEGORIES: { slug: CategorySlug; name: string }[] = [
  { slug: "news", name: "News" },
  { slug: "fights", name: "Fights" },
  { slug: "hip-hop", name: "Hip Hop" },
  { slug: "sports", name: "Sports" },
  { slug: "wild", name: "Wild" },
  { slug: "celebrity", name: "Celebrity" },
];
