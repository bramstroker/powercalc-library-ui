import { Box } from "@mui/material";
import { lazy, Suspense, useEffect, useRef, useState } from "react";

import type { PowerProfile } from "../types/PowerProfile";

const AuthorContributionsChart = lazy(() =>
  import("./AuthorContributionsChart").then((module) => ({
    default: module.AuthorContributionsChart,
  })),
);

/** Loads the chart bundle shortly before the activity section reaches the viewport. */
export const LazyAuthorContributionsChart = ({ profiles }: { profiles: PowerProfile[] }) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    if (anchorRef.current) observer.observe(anchorRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Box ref={anchorRef} sx={{ minHeight: profiles.length > 0 ? 240 : 0 }}>
      {visible ? (
        <Suspense fallback={null}>
          <AuthorContributionsChart profiles={profiles} />
        </Suspense>
      ) : null}
    </Box>
  );
};
