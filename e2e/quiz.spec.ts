import { expect, test } from "@playwright/test";

test("study mode answers, explains, saves, and resumes", async ({ page }) => {
  await page.goto("./study/");
  await page.getByRole("button", { name: "Start study session" }).click();
  await expect(page.locator("[data-prompt]")).not.toBeEmpty();
  await expect(page.locator("[data-choice]")).toHaveCount(4);
  await page.locator("[data-choice]").first().click();
  await expect(page.locator("[data-feedback]")).toBeVisible();
  await expect(page.locator("[data-feedback]")).toContainText(/Correct|Review this objective/);
  await page.getByRole("button", { name: "Save & exit" }).click();
  await expect(page.getByRole("button", { name: "Resume saved session" })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Resume saved session" }).click();
  await expect(page.locator("[data-prompt]")).not.toBeEmpty();
  await expect(page.locator("[data-feedback]")).toBeVisible();
});

test("fixed mock exam supplies 60 questions, timer, and scored remediation", async ({ page }) => {
  await page.goto("./exam/");
  await page.getByRole("button", { name: "Begin 120-minute exam" }).click();
  await expect(page.locator("[data-timer]")).toContainText(/^01:59:/);
  await expect(page.locator("[data-jump]")).toHaveCount(60);
  await page.locator("[data-choice]").first().click();
  await page.locator('[data-jump="59"]').click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Finish session" }).click();
  await expect(page.getByRole("heading", { name: "Your results" })).toBeVisible();
  await expect(page.locator("[data-score-summary]")).toContainText("of 60 correct");
  await expect(page.getByRole("heading", { name: "Review & remediation" })).toBeVisible();
  await page.getByRole("button", { name: "Start another session" }).click();
  await expect(page.locator("[data-recent-section]")).toBeVisible();
  await expect(page.locator("[data-recent-results]")).toContainText("Form A");
});
