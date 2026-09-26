/**
 * Aspect ratio of the viewBox, shared by the build metadata and the loaded artwork.
 * @param {string} svg
 * @returns {number | undefined}
 */
export const svgAspect = (svg) => {
  const viewBox = /viewBox=["']([^"']+)["']/u.exec(svg)?.[1];
  const values = viewBox
    ?.trim()
    .split(/[\s,]+/u)
    .map(Number);
  if (!values || values.length !== 4 || !values.every(Number.isFinite)) return undefined;
  const [, , width, height] = values;
  return width > 0 && height > 0 ? width / height : undefined;
};
