import { describe, expect, it } from "vitest";

import { svgAspect } from "./svgAspect.mjs";

describe("svgAspect", () => {
  it.each([
    ['<svg viewBox="0 0 240 60">', 4],
    ["<svg viewBox='-10, -20, 40, 80'>", 0.5],
    ['<svg viewBox=" 0  0  1e2  50 ">', 2],
  ])("reads the artwork proportions from %s", (svg, expected) => {
    expect(svgAspect(svg)).toBe(expected);
  });

  it.each([
    "<svg>",
    '<svg viewBox="0 0 10">',
    '<svg viewBox="0 0 10 10 10">',
    '<svg viewBox="0 0 0 10">',
    '<svg viewBox="0 0 10 -10">',
    '<svg viewBox="0 0 10 Infinity">',
    '<svg viewBox="0 0 10 invalid">',
  ])("rejects dimensions that cannot reserve a valid slot: %s", (svg) => {
    expect(svgAspect(svg)).toBeUndefined();
  });
});
