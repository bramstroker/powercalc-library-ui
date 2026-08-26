import { useEffect, useRef } from "react";
import { NavigationType, useLocation, useNavigationType } from "react-router";

/**
 * Browser scroll position survives client-side navigation. Reset it for a genuinely different
 * page, while keeping the position stable when only library filters in the query string change.
 *
 * Back and forward navigation is left alone: the browser restores where the reader was, and
 * overriding that drops them at the top of a long list they had already scrolled through. The
 * navigation type is read through a ref so that it cannot itself retrigger the effect — only a
 * new pathname may.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const latestNavigationType = useRef(navigationType);
  latestNavigationType.current = navigationType;

  useEffect(() => {
    // The enum member rather than its "POP" string value: comparing an enum against a bare literal
    // typechecks only by coincidence and breaks silently if the value is ever renamed.
    if (latestNavigationType.current === NavigationType.Pop) {
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};
