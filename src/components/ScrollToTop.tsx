import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Browser scroll position survives client-side navigation. Reset it for a genuinely different
 * page, while keeping the position stable when only library filters in the query string change.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};
