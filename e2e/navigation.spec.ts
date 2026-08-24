import { expect, test } from "@playwright/test";

test("home and learning library navigate from the custom-domain root", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle("Part 107 Flight Desk");
  await expect(page.getByText("Not an official FAA or U.S. government website.")).toBeVisible();
  await expect(page.locator('body[data-design-system="uswds"]')).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Learn the rules");
  await page.getByRole("link", { name: "Start the roadmap" }).click();
  await expect(page).toHaveURL(/\/learn\/certification-roadmap\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Certification roadmap");
  await expect(page.locator(".prose-faa h2").first()).toBeVisible();
});

test("mobile navigation opens and reaches the mock exam", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only navigation assertion");
  await page.goto("./");
  const toggle = page.getByRole("button", { name: "Open navigation" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.locator("#mobile-nav").getByRole("link", { name: "Mock exam" }).click();
  await expect(page).toHaveURL(/\/exam\/$/);
});
