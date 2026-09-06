import { expect, it } from "vitest";

import { provideEarlyStyles } from "./prerenderStyles";

it("provides late shared rules before first paint without removing hydration markup", () => {
  const late = '<style data-emotion="css shared">.css-shared{height:20px}</style>';
  const html = `<html><head></head><body><p class="MuiTypography-root css-shared">Intro</p>${late}<footer class="css-shared">Footer</footer></body></html>`;
  const result = provideEarlyStyles(html);
  expect(result.indexOf(".css-shared{height:20px}")).toBeLessThan(result.indexOf("</head>"));
  expect(result).toContain(`<p class="MuiTypography-root css-shared">Intro</p>${late}`);
});

it("leaves already ordered styles and similarly prefixed classes alone", () => {
  const html =
    '<html><head></head><body><p class="css-shared-other"></p><style data-emotion="css shared">.css-shared{height:20px}</style><p class="css-shared"></p></body></html>';
  expect(provideEarlyStyles(html)).toBe(html);
});
