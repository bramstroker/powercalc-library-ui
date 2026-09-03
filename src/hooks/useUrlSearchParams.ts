import { useCallback, useRef } from "react";
import { useSearchParams } from "react-router";

export type SearchParamChanges = Readonly<Record<string, string | null>>;

/**
 * Reads URL search parameters and applies partial updates without adding browser-history entries.
 * A local draft makes multiple updates issued before React Router commits build on each other.
 */
export const useUrlSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = searchParams.toString();
  const draftRef = useRef(new URLSearchParams(searchParams));
  const writtenQueryRef = useRef(currentQuery);

  if (writtenQueryRef.current !== currentQuery) {
    draftRef.current = new URLSearchParams(searchParams);
    writtenQueryRef.current = currentQuery;
  }

  const updateSearchParams = useCallback(
    (changes: SearchParamChanges) => {
      const next = new URLSearchParams(draftRef.current);
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }

      draftRef.current = next;
      writtenQueryRef.current = next.toString();
      setSearchParams(next, { replace: true, preventScrollReset: true });
    },
    [setSearchParams],
  );

  return { searchParams, updateSearchParams };
};
