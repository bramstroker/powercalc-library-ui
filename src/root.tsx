import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
  type MetaFunction,
} from "react-router";

import { SkipLink } from "./components/SkipLink";
import { SITE_NAME } from "./config/site";
import { queryClient } from "./queryClient";
import { DEFAULT_DESCRIPTION } from "./seo/meta";
import { theme } from "./theme";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/manifest.json" },
];

// Site-wide defaults only. Anything route-specific — canonical URL above all — belongs in the
// route module: a route inheriting this must never end up claiming to be a copy of the landing page.
export const meta: MetaFunction = () => [
  { title: SITE_NAME },
  { name: "description", content: DEFAULT_DESCRIPTION },
  { name: "theme-color", content: "#303f9f" },
];

// The SPA fallback must stay independent of build-time API data. It is replaced as soon as the
// browser has loaded the current route and library data; fully prerendered URLs still get the page.
export const HydrateFallback = () => (
  <div role="status" style={{ padding: "2rem", fontFamily: "sans-serif" }}>
    Loading Powercalc library…
  </div>
);

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <InitColorSchemeScript attribute="data-mui-color-scheme" defaultMode="dark" />
        <SkipLink />
        <noscript>You need to enable JavaScript to use the interactive library.</noscript>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

const Root = () => {
  // Effects run after the commit, so this flips only once React has hydrated the document and the
  // page is actually interactive. End-to-end tests wait on it before clicking: with the library
  // preloaded from the document head, network quiet no longer implies hydration has happened.
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);

  return (
    <ThemeProvider theme={theme} defaultMode="dark">
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default Root;
