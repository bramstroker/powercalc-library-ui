import { useEffect } from "react";

export const SITE_NAME = "Powercalc profile library";

const DEFAULT_DESCRIPTION =
  "Browse the Powercalc device library: power measurement profiles for smart lights, plugs, " +
  "speakers and other devices, contributed by the Home Assistant community.";

const upsertMeta = (attribute: "name" | "property", key: string, content: string) => {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

export type PageMeta = {
  /** Page-specific part of the title. Omit on the landing page. */
  title?: string;
  description?: string;
};

/**
 * Sets the document title and the description / Open Graph tags for the current page, so history,
 * bookmarks and link previews say something more useful than the site name on every route.
 *
 * Note: crawlers that do not execute JavaScript (Slack and Discord unfurls, among others) only see
 * the tags in index.html. Making these visible to them needs prerendering, which is a separate
 * change.
 */
export const usePageMeta = ({ title, description }: PageMeta) => {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    const resolvedDescription = description ?? DEFAULT_DESCRIPTION;

    document.title = fullTitle;
    upsertMeta("name", "description", resolvedDescription);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", resolvedDescription);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", window.location.href);
    upsertMeta("name", "twitter:card", "summary");

    return () => {
      document.title = SITE_NAME;
      upsertMeta("name", "description", DEFAULT_DESCRIPTION);
    };
  }, [title, description]);
};
