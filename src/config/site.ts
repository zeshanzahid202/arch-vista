export const site = {
  name: "ArchVista",
  tagline: "Architecture Shaped by Vision.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};
export const categories = [
  "Residential",
  "Commercial",
  "Interior",
  "Hospitality",
  "Renovation",
  "Conceptual",
];
export const resources = [
  "projects",
  "services",
  "articles",
  "testimonials",
  "team",
  "media",
  "homepage",
  "settings",
  "seo",
  "inquiries",
  "consultations",
] as const;
export const heroImage =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=85";
