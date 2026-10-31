import { describe, it, expect } from "vitest";
import {
  contactSchema,
  consultationSchema,
  contentSchema,
  validatePublication,
  validateFile,
} from "../src/lib/validation";
import { cleanHtml } from "../src/lib/html";
const contact = {
  name: "Test client",
  email: "client@example.com",
  phone: "1234567890",
  message: "A thoughtful new residential project.",
  consent: true,
};
describe("public form contracts", () => {
  it("requires consent and a meaningful message", () => {
    expect(
      contactSchema.safeParse({ ...contact, consent: false }).success,
    ).toBe(false);
    expect(contactSchema.safeParse({ ...contact, message: "hi" }).success).toBe(
      false,
    );
    expect(contactSchema.safeParse(contact).success).toBe(true);
  });
  it("rejects honeypot content", () =>
    expect(
      contactSchema.safeParse({ ...contact, website: "spam" }).success,
    ).toBe(false));
  it("requires complete consultation details", () => {
    expect(consultationSchema.safeParse(contact).success).toBe(false);
    expect(
      consultationSchema.safeParse({
        ...contact,
        projectType: "Residential",
        location: "London",
        area: "200 m²",
        budget: "$100k–$300k",
        timeline: "3–6 months",
      }).success,
    ).toBe(true);
  });
});
describe("publishing and media", () => {
  it("allows drafts but refuses incomplete publications", () => {
    const draft = contentSchema.parse({
      title: "New project",
      slug: "new-project",
    });
    expect(() => validatePublication(draft, "projects")).not.toThrow();
    expect(() =>
      validatePublication({ ...draft, status: "published" }, "projects"),
    ).toThrow("cover");
  });
  it("requires testimonial approval", () => {
    const draft = contentSchema.parse({
      title: "Client words",
      slug: "client-words",
      status: "published",
    });
    expect(() => validatePublication(draft, "testimonials")).toThrow("Approve");
  });
  it("rejects disguised and oversized images", () => {
    expect(() =>
      validateFile(new Uint8Array([60, 115, 99, 114]), "image/jpeg", 20),
    ).toThrow();
    expect(() =>
      validateFile(
        new Uint8Array([255, 216, 255]),
        "image/jpeg",
        9 * 1024 * 1024,
      ),
    ).toThrow();
    expect(() =>
      validateFile(new Uint8Array([255, 216, 255]), "image/jpeg", 3),
    ).not.toThrow();
  });
  it("sanitizes script, event handlers, unsafe links and foreign image hosts", () => {
    const html = cleanHtml(
      '<p onclick="alert(1)">Hello</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a><img src="https://evil.example/x.png" alt="x"/>',
    );
    expect(html).not.toContain("script");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("evil.example");
  });
});
