import { test, expect } from "@playwright/test";
test("home navigation and consultation validation", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Spaces that inspire",
  );
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("link", { name: "Start a project", exact: true })
      .click();
  } else await page.getByRole("link", { name: "Let’s talk" }).click();
  await expect(page).toHaveURL(/consultation/);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Invalid email address")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("admin routes require authentication", async ({ page, request }) => {
  const response = await request.get("/api/admin/projects");
  expect(response.status()).toBe(401);
  await page.goto("/admin");
  await expect(page).toHaveURL(/admin\/login/);
  await expect(
    page.getByRole("button", { name: /Sign in to the studio/ }),
  ).toBeVisible();
});
test("public information pages and collection states render", async ({
  page,
}) => {
  for (const path of [
    "/about",
    "/services",
    "/projects",
    "/studio",
    "/journal",
    "/contact",
    "/privacy",
    "/terms",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
