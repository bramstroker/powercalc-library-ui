import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

test("shows the initial profile attributes without JavaScript", async ({ page }) => {
  await page.goto("/profiles/aeotec/zw117");

  await expect(page.getByRole("heading", { name: "Aeotec ZW117", level: 1 })).toBeVisible();
  await expect(page.getByRole("region", { name: "Device", exact: true })).toContainText("Z-Wave");
  await expect(page.getByRole("region", { name: "Measurement", exact: true })).toBeVisible();
  await expect(page.getByText("Zhurui PR10", { exact: true })).toBeVisible();
  await expect(page.getByText("Loading profile details…", { exact: true })).toHaveCount(0);
});
