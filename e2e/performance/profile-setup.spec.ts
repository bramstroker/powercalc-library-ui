import { expect, test } from "@playwright/test";

test("loads setup code on demand and preserves the opened instructions", async ({ page }) => {
  const setupRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/ProfileSetupDetails-[^/]+\.js$/u.test(new URL(request.url()).pathname)) {
      setupRequests.push(request.url());
    }
  });

  await page.goto("/profiles/aeotec/zw117");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  expect(setupRequests).toHaveLength(0);

  const setup = page.getByTestId("profile-setup");
  const toggle = setup.getByRole("button", { name: "Use in Home Assistant" });
  await toggle.click();
  await expect(setup.getByText(/Powercalc can discover this model automatically/)).toBeVisible();
  expect(setupRequests).toHaveLength(1);

  await setup.getByRole("button", { name: "Set up manually instead" }).click();
  await setup.getByRole("button", { name: "Or configure with YAML" }).click();
  await expect(setup.locator("pre")).toContainText("model: ZW117");
  await toggle.click();
  await expect(setup.locator("pre")).toBeHidden();
  await toggle.click();
  await expect(setup.locator("pre")).toBeVisible();
  expect(setupRequests).toHaveLength(1);
});
