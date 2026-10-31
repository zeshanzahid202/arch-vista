export type Status = "draft" | "published";
export type Resource =
  | "projects"
  | "services"
  | "articles"
  | "testimonials"
  | "team"
  | "media"
  | "homepage"
  | "settings"
  | "seo"
  | "inquiries"
  | "consultations";
export interface ImageAsset {
  url: string;
  alt: string;
  publicId?: string;
}
export interface FAQ {
  question: string;
  answer: string;
}
export interface Content {
  _id: string;
  title: string;
  slug: string;
  status: Status;
  category: string;
  summary: string;
  body: string;
  cover: ImageAsset;
  gallery: ImageAsset[];
  featured: boolean;
  order: number;
  location: string;
  year: number;
  area: string;
  concept: string;
  materials: string;
  challenges: string;
  solution: string;
  benefits: string[];
  stages: string[];
  faqs: FAQ[];
  tags: string[];
  author: string;
  publishedAt?: string;
  name: string;
  role: string;
  quote: string;
  approved: boolean;
  demo: boolean;
  seo: {
    title?: string;
    description?: string;
    image?: string;
    canonical?: string;
    noIndex?: boolean;
  };
  key: string;
  value: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
export interface Submission {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  projectType?: string;
  location?: string;
  area?: string;
  budget?: string;
  timeline?: string;
  status: string;
  notes: string;
  createdAt: string;
  notificationStatus: string;
}
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
