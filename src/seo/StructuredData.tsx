import type { StructuredData as StructuredDataNode } from "./meta";

/**
 * Renders the page's JSON-LD graph into the route's own markup rather than through a `meta`
 * descriptor.
 *
 * `<Meta />` puts the script in `<head>`, where React re-inserts it during hydration instead of
 * matching the prerendered one, leaving two identical graphs on every page. Rendered as ordinary
 * route markup it hydrates like any other element. JSON-LD is position-independent — consumers
 * read it from anywhere in the document — so nothing is lost by moving it out of the head.
 */
export const StructuredData = ({ graph }: { graph: StructuredDataNode[] }) => {
  if (graph.length === 0) return null;

  return (
    <script
      type="application/ld+json"
      // The graph is built from our own API data, never from user input.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
          // A literal `</script>` inside the JSON would close the tag early.
          /<\/(script)/gi,
          "<\\/$1",
        ),
      }}
    />
  );
};
