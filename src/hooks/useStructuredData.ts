import { useEffect } from "react";

export type StructuredData = Record<string, unknown>;

const SCRIPT_ID = "page-structured-data";

/** Keeps one route-specific JSON-LD graph in the document head. */
export const useStructuredData = (items?: StructuredData[]) => {
  const serialized = items?.length
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@graph": items,
      })
    : null;

  useEffect(() => {
    document.getElementById(SCRIPT_ID)?.remove();

    if (!serialized) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "application/ld+json";
    script.textContent = serialized;
    document.head.appendChild(script);

    return () => script.remove();
  }, [serialized]);
};
