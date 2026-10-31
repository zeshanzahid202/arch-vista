import mongoose, { Schema, type InferSchemaType } from "mongoose";
const image = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
    publicId: String,
  },
  { _id: false },
);
const seo = new Schema(
  {
    title: String,
    description: String,
    image: String,
    canonical: String,
    noIndex: { type: Boolean, default: false },
  },
  { _id: false },
);
const contentFields = {
  title: { type: String, required: true, maxlength: 180 },
  slug: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },
  summary: { type: String, default: "", maxlength: 1200 },
  body: { type: String, default: "" },
  cover: image,
  gallery: [image],
  category: { type: String, default: "" },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
    index: true,
  },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  demo: { type: Boolean, default: false },
  seo,
};
const projectSchema = new Schema(
  {
    ...contentFields,
    location: String,
    year: Number,
    area: String,
    concept: String,
    materials: String,
    challenges: String,
    solution: String,
    serviceIds: [{ type: Schema.Types.ObjectId, ref: "Service" }],
  },
  { timestamps: true },
);
projectSchema.index({ status: 1, category: 1, order: 1 });
const serviceSchema = new Schema(
  {
    ...contentFields,
    benefits: [String],
    stages: [String],
    faqs: [{ question: String, answer: String }],
  },
  { timestamps: true },
);
const articleSchema = new Schema(
  { ...contentFields, tags: [String], author: String, publishedAt: Date },
  { timestamps: true },
);
articleSchema.index({ status: 1, publishedAt: -1 });
const adminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "editor"], default: "editor" },
    active: { type: Boolean, default: true },
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);
const submission = {
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  message: { type: String, required: true },
  consent: { type: Boolean, required: true },
  status: {
    type: String,
    enum: ["new", "contacted", "closed"],
    default: "new",
    index: true,
  },
  notes: { type: String, default: "" },
  notificationStatus: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
  },
};
const inquirySchema = new Schema(
  {
    ...submission,
    kind: { type: String, enum: ["contact", "newsletter"], default: "contact" },
  },
  { timestamps: true },
);
inquirySchema.index({ createdAt: -1 });
const consultationSchema = new Schema(
  {
    ...submission,
    projectType: { type: String, required: true },
    location: { type: String, required: true },
    area: String,
    budget: { type: String, required: true },
    timeline: { type: String, required: true },
  },
  { timestamps: true },
);
consultationSchema.index({ projectType: 1, status: 1, createdAt: -1 });
const testimonialSchema = new Schema(
  {
    ...contentFields,
    name: { type: String, required: true },
    role: String,
    quote: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true },
);
const teamSchema = new Schema(
  {
    ...contentFields,
    name: { type: String, required: true },
    role: { type: String, required: true },
  },
  { timestamps: true },
);
const mediaSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    alt: { type: String, required: true },
    folder: { type: String, default: "archvista" },
    bytes: Number,
    width: Number,
    height: Number,
  },
  { timestamps: true },
);
const keyValueSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);
const auditSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "Admin" },
    action: { type: String, required: true },
    resource: String,
    target: String,
  },
  { timestamps: true },
);
auditSchema.index({ createdAt: -1 });
const rateSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
rateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export type AdminRecord = InferSchemaType<typeof adminSchema>;
export type ProjectRecord = InferSchemaType<typeof projectSchema>;
export type ServiceRecord = InferSchemaType<typeof serviceSchema>;
export type ArticleRecord = InferSchemaType<typeof articleSchema>;
export type InquiryRecord = InferSchemaType<typeof inquirySchema>;
export type ConsultationRecord = InferSchemaType<typeof consultationSchema>;
export type TestimonialRecord = InferSchemaType<typeof testimonialSchema>;
export type TeamMemberRecord = InferSchemaType<typeof teamSchema>;
export type MediaRecord = InferSchemaType<typeof mediaSchema>;
export type SiteContentRecord = InferSchemaType<typeof keyValueSchema>;
export type SettingRecord = SiteContentRecord;
export type AuditLogRecord = InferSchemaType<typeof auditSchema>;
export const Admin =
  mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
export const Service =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);
export const Article =
  mongoose.models.Article || mongoose.model("Article", articleSchema);
export const Inquiry =
  mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);
export const Consultation =
  mongoose.models.Consultation ||
  mongoose.model("Consultation", consultationSchema);
export const Testimonial =
  mongoose.models.Testimonial ||
  mongoose.model("Testimonial", testimonialSchema);
export const TeamMember =
  mongoose.models.TeamMember || mongoose.model("TeamMember", teamSchema);
export const Media =
  mongoose.models.Media || mongoose.model("Media", mediaSchema);
export const SiteContent =
  mongoose.models.SiteContent || mongoose.model("SiteContent", keyValueSchema);
export const Setting =
  mongoose.models.Setting || mongoose.model("Setting", keyValueSchema.clone());
export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditSchema);
export const RateLimit =
  mongoose.models.RateLimit || mongoose.model("RateLimit", rateSchema);
export const modelMap = {
  projects: Project,
  services: Service,
  articles: Article,
  testimonials: Testimonial,
  team: TeamMember,
  media: Media,
  homepage: SiteContent,
  seo: SiteContent,
  settings: Setting,
  inquiries: Inquiry,
  consultations: Consultation,
};
