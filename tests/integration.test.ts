import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
  vi,
} from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { hash } from "bcryptjs";
import { createTestDatabase } from "../scripts/test-database";
const mocks = vi.hoisted(() => ({
  session: null as null | {
    user: { id: string; role: string; sessionVersion: number };
  },
  credentials: null as
    null | ((credentials: unknown, request: Request) => Promise<unknown>),
}));
vi.mock("next-auth", () => ({
  default: (config: {
    providers: {
      authorize: (credentials: unknown, request: Request) => Promise<unknown>;
    }[];
  }) => {
    mocks.credentials = config.providers[0].authorize;
    return {
      auth: async () => mocks.session,
      handlers: {},
      signIn: vi.fn(),
      signOut: vi.fn(),
    };
  },
}));
vi.mock("next-auth/providers/credentials", () => ({
  default: (config: unknown) => config,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { connectDB } from "../src/lib/db";
import {
  Admin,
  Project,
  Article,
  Inquiry,
  Consultation,
  RateLimit,
  AuditLog,
  Service,
  Media,
} from "../src/models";
import { collection, individual } from "../src/features/admin/api";
import { submit } from "../src/features/forms/submit";
import { listContent, getContent } from "../src/lib/content";
import { requireAdmin } from "../src/lib/admin";
import { checkOrigin, rateLimit } from "../src/lib/security";
let mongo: MongoMemoryServer;
let adminId: string;
const origin = "http://localhost:3000";
const req = (path: string, method = "GET", data?: unknown) =>
  new Request(`${origin}${path}`, {
    method,
    headers: { origin, "content-type": "application/json" },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
const project = {
  title: "Test house",
  slug: "test-house",
  summary: "Test project summary",
  body: "<p>A test design story.</p>",
  category: "Residential",
  cover: {
    url: "https://res.cloudinary.com/test/image/upload/test.jpg",
    alt: "Test house facade",
  },
  status: "draft",
};
beforeAll(async () => {
  mongo = await createTestDatabase();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.AUTH_URL = origin;
  await connectDB();
  await Promise.all(
    [
      Admin,
      Project,
      Article,
      Inquiry,
      Consultation,
      RateLimit,
      AuditLog,
      Service,
      Media,
    ].map((m) => m.init()),
  );
  const owner = await Admin.create({
    email: "owner@example.com",
    name: "Test owner",
    role: "owner",
    passwordHash: await hash("a-long-test-password", 4),
  });
  adminId = String(owner._id);
});
beforeEach(async () => {
  mocks.session = { user: { id: adminId, role: "owner", sessionVersion: 0 } };
  await Promise.all(
    [Project, Article, Inquiry, Consultation, RateLimit].map((m) =>
      m.deleteMany({}),
    ),
  );
  await Admin.updateOne({ _id: adminId }, { sessionVersion: 0 });
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
describe("admin authentication and authorization", () => {
  it("rejects unauthenticated collection and mutation requests", async () => {
    mocks.session = null;
    expect(
      (await collection(req("/api/admin/projects"), "projects")).status,
    ).toBe(401);
    expect(
      (
        await collection(
          req("/api/admin/projects", "POST", project),
          "projects",
        )
      ).status,
    ).toBe(401);
  });
  it("accepts only correct credentials and throttles repeated logins", async () => {
    expect(mocks.credentials).toBeTypeOf("function");
    expect(
      await mocks.credentials!(
        { email: "owner@example.com", password: "wrong" },
        req("/api/auth"),
      ),
    ).toBeNull();
    const user = await mocks.credentials!(
      { email: "owner@example.com", password: "a-long-test-password" },
      req("/api/auth"),
    );
    expect(user).toMatchObject({ id: adminId, role: "owner" });
    for (let i = 0; i < 6; i++)
      await mocks.credentials!(
        { email: "owner@example.com", password: "wrong" },
        req("/api/auth"),
      );
    await expect(
      mocks.credentials!(
        { email: "owner@example.com", password: "wrong" },
        req("/api/auth"),
      ),
    ).rejects.toThrow("Too many");
  });
  it("revokes sessions when the account session version changes", async () => {
    await Admin.updateOne({ _id: adminId }, { sessionVersion: 1 });
    await expect(requireAdmin()).rejects.toThrow("Session expired");
  });
  it("denies owner settings to an editor", async () => {
    const editor = await Admin.create({
      name: "Editor",
      email: "editor@example.com",
      passwordHash: "unused",
      role: "editor",
    });
    mocks.session = {
      user: { id: String(editor._id), role: "editor", sessionVersion: 0 },
    };
    expect(
      (await collection(req("/api/admin/settings"), "settings")).status,
    ).toBe(403);
  });
  it("blocks cross-origin mutations", () => {
    expect(() =>
      checkOrigin(
        new Request(`${origin}/api/contact`, {
          headers: { origin: "https://evil.example" },
        }),
      ),
    ).toThrow("origin");
  });
});
describe("content CRUD and publication", () => {
  it.each(["projects", "articles"])(
    "creates, publishes, updates and deletes %s",
    async (resource) => {
      const created = await collection(
        req(`/api/admin/${resource}`, "POST", project),
        resource,
      );
      expect(created.status).toBe(201);
      const record = await created.json();
      expect(
        await getContent(resource as "projects" | "articles", "test-house"),
      ).toBeNull();
      const publish = await individual(
        req(`/api/admin/${resource}/${record._id}`, "PATCH", {
          status: "published",
        }),
        resource,
        record._id,
      );
      expect(publish.status).toBe(200);
      expect(
        await getContent(resource as "projects" | "articles", "test-house"),
      ).toMatchObject({ title: "Test house" });
      expect(
        (
          await individual(
            req("/api/admin/x", "PATCH", { title: "Refined title" }),
            resource,
            record._id,
          )
        ).status,
      ).toBe(200);
      expect(
        (await individual(req("/api/admin/x", "DELETE"), resource, record._id))
          .status,
      ).toBe(200);
      expect(
        await getContent(resource as "projects" | "articles", "test-house"),
      ).toBeNull();
    },
  );
  it("refuses incomplete publishing and duplicate slugs", async () => {
    expect(
      (
        await collection(
          req("/api/admin/projects", "POST", {
            title: "Incomplete",
            slug: "incomplete",
            status: "published",
          }),
          "projects",
        )
      ).status,
    ).toBe(422);
    await collection(req("/api/admin/projects", "POST", project), "projects");
    expect(
      (
        await collection(
          req("/api/admin/projects", "POST", project),
          "projects",
        )
      ).status,
    ).toBe(409);
  });
  it("filters public projects without revealing drafts or interpreting regex syntax", async () => {
    await Project.create([
      { ...project, status: "published" },
      { ...project, slug: "draft-project", title: "Secret draft" },
      {
        ...project,
        slug: "other",
        category: "Commercial",
        status: "published",
      },
    ]);
    const filtered = await listContent(
      "projects",
      new URLSearchParams({ category: "Residential" }),
    );
    expect(filtered.total).toBe(1);
    expect(
      (await listContent("projects", new URLSearchParams({ q: ".*" }))).total,
    ).toBe(0);
  });
});
describe("persisted public requests", () => {
  const contact = {
    name: "Test client",
    email: "test@example.com",
    phone: "12345678",
    message: "Please discuss my new home design.",
    consent: true,
  };
  it("persists contact submissions even when email is not configured", async () => {
    expect(
      (await submit(req("/api/contact", "POST", contact), "contact")).status,
    ).toBe(201);
    expect(
      await Inquiry.findOne({ email: contact.email }).lean(),
    ).toMatchObject({ status: "new", notificationStatus: "failed" });
  });
  it("rejects invalid submissions without storing them", async () => {
    expect(
      (
        await submit(
          req("/api/contact", "POST", { ...contact, consent: false }),
          "contact",
        )
      ).status,
    ).toBe(422);
    expect(await Inquiry.countDocuments()).toBe(0);
  });
  it("persists a complete consultation brief", async () => {
    const res = await submit(
      req("/api/consultations", "POST", {
        ...contact,
        projectType: "Residential",
        location: "London",
        area: "200 m²",
        budget: "$100k–$300k",
        timeline: "3–6 months",
      }),
      "consultation",
    );
    expect(res.status).toBe(201);
    expect(await Consultation.countDocuments()).toBe(1);
  });
  it("shares rate limits across requests through MongoDB", async () => {
    await rateLimit("test", 1);
    await expect(rateLimit("test", 1)).rejects.toThrow("Too many");
  });
});
