import { test, expect } from "@playwright/test";
test("real admin sign-in, rich editor, publish, draft and delete", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "Full CMS mutation journey runs once on desktop; mobile covers public navigation.",
  );
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill("browser-test@example.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("only-for-isolated-browser-tests");
  await page.getByRole("button", { name: /Sign in to the studio/ }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/projects/new");
  await page
    .getByLabel("Title", { exact: true })
    .fill("Browser verified project");
  await page.getByLabel("URL slug").fill("browser-verified-project");
  await page
    .getByLabel("Short description")
    .fill("A project created by the isolated browser verification.");
  await page
    .getByRole("textbox", { name: "Rich text content" })
    .fill("A considered architectural story created in the real editor.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/[a-f0-9]{24}$/);
  await page.getByRole("button", { name: "Choose image", exact: true }).click();
  await page.getByLabel("Image", { exact: true }).setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page
    .getByLabel("Alt text", { exact: true })
    .fill("Test architectural image");
  await page.getByRole("button", { name: "Upload image", exact: true }).click();
  await expect(
    page.getByText("Configure Cloudinary to upload images"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close image library" }).click();
  // Without real Cloudinary credentials, use the authenticated API to set a
  // licensed external cover; still exercise actual publish/draft handlers.
  const id = page.url().split("/").pop();
  let response = await page.request.patch(`/api/admin/projects/${id}`, {
    headers: { origin: "http://localhost:3000" },
    data: {
      cover: {
        url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
        alt: "Illustrative interior",
      },
    },
  });
  expect(response.ok()).toBe(true);
  await page.reload();
  await page.getByRole("button", { name: "Publish", exact: false }).click();
  await expect(
    page.getByText("Saved successfully.", { exact: false }),
  ).toBeVisible();
  await page.goto("/projects/browser-verified-project");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Browser verified project",
  );
  response = await page.request.patch(`/api/admin/projects/${id}`, {
    headers: { origin: "http://localhost:3000" },
    data: { status: "draft" },
  });
  expect(response.ok()).toBe(true);
  expect(
    (await page.request.get("/api/projects/browser-verified-project")).status(),
  ).toBe(404);
  expect(
    (
      await page.request.delete(`/api/admin/projects/${id}`, {
        headers: { origin: "http://localhost:3000" },
      })
    ).ok(),
  ).toBe(true);
});
