import { useEffect } from "react";

import { SITE_NAME, SITE_URL, SOCIAL_IMAGE_URL } from "../config/site";
import { DEFAULT_DESCRIPTION } from "../seo/meta";

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

const upsertCanonical = (href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

const removeMeta = (attribute: "name" | "property", key: string) => {
  document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
};

const canonicalUrl = () => {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return `${SITE_URL}${path}`;
};

export type PageMeta = {
  /** Page-specific part of the title. Omit on the landing page. */
  title?: string;
  description?: string;
  /** Keep error and nonexistent entity pages out of search results. */
  noIndex?: boolean;
};

/**
 * Imperative fallback for the one case a route `meta` export cannot cover: an error boundary, which
 * renders in place of a route whose own meta may never have run. Every ordinary page sets its title,
 * description and canonical URL through its route module instead — doing both would emit each tag
 * twice and let the two copies disagree.
 */
export const usePageMeta = ({ title, description, noIndex = false }: PageMeta) => {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    const resolvedDescription = description ?? DEFAULT_DESCRIPTION;
    const resolvedCanonicalUrl = canonicalUrl();

    document.title = fullTitle;
    upsertMeta("name", "description", resolvedDescription);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", resolvedDescription);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", resolvedCanonicalUrl);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:image", SOCIAL_IMAGE_URL);
    upsertMeta("property", "og:image:type", "image/png");
    upsertMeta("property", "og:image:width", "1200");
    upsertMeta("property", "og:image:height", "630");
    upsertMeta("property", "og:image:alt", "Powercalc profile library");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", resolvedDescription);
    upsertMeta("name", "twitter:image", SOCIAL_IMAGE_URL);
    upsertMeta("name", "twitter:image:alt", "Powercalc profile library");
    upsertCanonical(resolvedCanonicalUrl);
    if (noIndex) {
      upsertMeta("name", "robots", "noindex, follow");
    } else {
      removeMeta("name", "robots");
    }

    return () => {
      document.title = SITE_NAME;
      upsertMeta("name", "description", DEFAULT_DESCRIPTION);
      removeMeta("name", "robots");
    };
  }, [title, description, noIndex]);
};
